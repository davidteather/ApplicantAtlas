package pipelines

import (
	"api/internal/middlewares"
	"api/internal/types"
	"net/http"
	"shared/models"
	"shared/mongodb"
	"shared/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func RegisterRoutes(r *gin.RouterGroup, params *types.RouteParams) {
	r.GET(":pipeline_id", middlewares.JWTAuthMiddleware(), getPipelineConfigHandler(params))
	r.POST("", middlewares.JWTAuthMiddleware(), createPipelineConfigHandler(params))
	r.PUT(":pipeline_id", middlewares.JWTAuthMiddleware(), updatePipelineConfigHandler(params))
	r.DELETE(":pipeline_id", middlewares.JWTAuthMiddleware(), deletePipelineConfigHandler(params))
}

func getPipelineConfigHandler(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		pipelineID, err := primitive.ObjectIDFromHex(c.Param("pipeline_id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid pipeline ID"})
			return
		}

		authenticatedUser, ok := utils.GetUserFromContext(c, true)
		if !ok {
			return
		}

		pipelineConfig, err := params.MongoService.GetPipeline(c, pipelineID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Pipeline configuration not found"})
			return
		}

		canModify := mongodb.CanUserModifyPipeline(c, params.MongoService, authenticatedUser, primitive.NilObjectID, pipelineConfig)
		if !canModify {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "You are not authorized to view this pipeline"})
			return
		}

		c.JSON(http.StatusOK, pipelineConfig)
	}
}

func createPipelineConfigHandler(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req models.PipelineConfiguration
		if err := c.BindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}

		// Make sure the user is an admin of pipeline.EventID
		authenticatedUser, ok := utils.GetUserFromContext(c, true)
		if !ok {
			return
		}

		event, err := params.MongoService.GetEvent(c, req.EventID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
			return
		}

		canUserModifyEvent := mongodb.CanUserModifyEvent(c, params.MongoService, authenticatedUser, primitive.NilObjectID, event)
		if !canUserModifyEvent {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "You cannot create a pipeline on this event"})
		}

		pipelineID, err := params.MongoService.CreatePipeline(c, req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create pipeline configuration"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"id": pipelineID})
	}
}

func updatePipelineConfigHandler(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		pipelineID, err := primitive.ObjectIDFromHex(c.Param("pipeline_id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid pipeline ID"})
			return
		}

		var req models.PipelineConfiguration
		if err := c.BindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}

		authenticatedUser, ok := utils.GetUserFromContext(c, true)
		if !ok {
			return
		}

		if !mongodb.CanUserModifyPipeline(c, params.MongoService, authenticatedUser, pipelineID, nil) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "You are not authorized to update this pipeline"})
			return
		}

		_, err = params.MongoService.UpdatePipeline(c, req, pipelineID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update pipeline configuration"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Pipeline configuration updated successfully"})
	}
}

func deletePipelineConfigHandler(params *types.RouteParams) gin.HandlerFunc {
	return func(c *gin.Context) {
		pipelineID, err := primitive.ObjectIDFromHex(c.Param("pipeline_id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid pipeline ID"})
			return
		}

		authenticatedUser, ok := utils.GetUserFromContext(c, true)
		if !ok {
			return
		}

		if !mongodb.CanUserModifyPipeline(c, params.MongoService, authenticatedUser, pipelineID, nil) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "You are not authorized to delete this pipeline"})
			return
		}

		_, err = params.MongoService.DeletePipeline(c, pipelineID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete pipeline configuration"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Pipeline configuration deleted successfully"})
	}
}
