package main

import (
	"api/internal/middlewares"
	"api/internal/routes"
	"api/internal/types"
	"context"
	"fmt"
	"log"
	"net/http"
	"os/exec"
	"os/signal"
	"shared/config"
	"shared/kafka/producer"
	"shared/mongodb"
	"shared/utils"
	"strings"
	"syscall"
	"time"

	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	ginadapter "github.com/awslabs/aws-lambda-go-api-proxy/gin"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	apiConfig, err := config.GetAPIConfig()
	if err != nil {
		log.Fatalf("Error getting API config: %v", err)
	}

	// If we're on a Codespace add that
	if os.Getenv("CODESPACES") == "true" {
		// Lets run command to set the port visibility to public
		// Note: There's probably a better way to do this.
		cmdName := "gh"
		cmdArgs := []string{"codespace", "ports", "visibility", "8080:public", "-c"}

		// Append the actual CODESPACE_NAME environment variable value
		codespaceName := os.Getenv("CODESPACE_NAME")
		if codespaceName == "" {
			log.Fatal("CODESPACE_NAME environment variable is not set")
		}
		cmdArgs = append(cmdArgs, codespaceName)

		// Execute the command
		cmd := exec.Command(cmdName, cmdArgs...)

		if err := cmd.Run(); err != nil {
			log.Fatalf("Failed to set port visibility to public: %v", err)
		}

		// Add the domain to valid
		codespaceURL := fmt.Sprintf("https://%s-8080.%s", os.Getenv("CODESPACE_NAME"), os.Getenv("GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN"))
		apiConfig.CORS_ALLOW_ORIGINS = append(apiConfig.CORS_ALLOW_ORIGINS, codespaceURL)
	}

	// If no origins are specified, error out
	if len(apiConfig.CORS_ALLOW_ORIGINS) == 0 {
		log.Fatal("CORS: No allowed origins specified, please specify with CORS_ALLOW_ORIGINS environment variable")
	}

	r.Use(middlewares.CORSMiddleware(strings.Join(apiConfig.CORS_ALLOW_ORIGINS, ",")))

	mongoService, cleanup, err := mongodb.NewService()
	if err != nil {
		log.Fatal(err)
	}
	defer cleanup()

	// TODO: This isn't a great solution because lambda functions are stateless
	// would be better to do it as a step in the CI/CD pipeline
	err = mongoService.SeedPlans(context.TODO())
	if err != nil {
		log.Fatalf("Failed to seed plans: %v", err)
	}

	producer, err := producer.NewMessageProducer()
	if err != nil {
		log.Fatalf("Failed to create Kafka producer: %v", err)
	}
	defer producer.Close()

	// Setup routes
	params := types.RouteParams{
		MongoService:    mongoService,
		MessageProducer: producer,
	}
	routes.SetupRoutes(r, &params)

	// Handle 404s
	r.NoRoute(func(c *gin.Context) {
		c.JSON(http.StatusNotFound, gin.H{"error": "API route not found"})
	})

	// Check if running in AWS Lambda or not
	if utils.RunningInAWSLambda() {
		// Create a Lambda server with the Gin router
		// This converts lambda events to http.Request objects
		ginLambda := ginadapter.New(r)
		lambda.Start(func(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
			// Proxy the request to the Gin engine
			return ginLambda.ProxyWithContext(ctx, req)
		})
	} else {
		// Running outside AWS Lambda
		// This is to handle graceful shutdown (will close connections to MongoDB with the defer cleanup)
		srv := &http.Server{
			Addr:    ":8080",
			Handler: r,
		}

		go func() {
			if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
				log.Fatalf("listen: %s\n", err)
			}
		}()

		// Wait for interrupt signal to gracefully shut down the server
		quit := make(chan os.Signal, 1)
		signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
		<-quit

		// The context is used to inform the server it has 5 seconds to finish
		// the request it is currently handling
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := srv.Shutdown(ctx); err != nil {
			log.Fatal("Server forced to shutdown:", err)
		}

		log.Println("Server exiting")
	}
}
