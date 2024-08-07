import { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import store from '@/store';
import '../styles/global.css';
import '../styles/fonts.css';
import RootLayout from '@/layouts/Root';
import { User } from '@/types/models/User';

// Check that PostHog is client-side (used to handle Next.js SSR)
if (
  typeof window !== 'undefined' &&
  !window.location.host.includes('127.0.0.1') &&
  !window.location.host.includes('localhost') &&
  process.env.NEXT_PUBLIC_POSTHOG_KEY &&
  process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true'
) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host:
      process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'identified_only', // can switch to all for more data, but higher cost too
    // Enable debug mode in development
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') {
        posthog.debug();
      } else {
        const consentGiven = localStorage.getItem('cookieConsent');
        if (consentGiven === 'accepted') {
          posthog.opt_in_capturing();
        } else if (consentGiven === 'declined') {
          posthog.opt_out_capturing();
        }
      }
    },
  });
}

const useIdentifyUser = () => {
  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user: User = JSON.parse(userJson);
      posthog.identify(user.id, {
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
      });
    }
  }, []);
};

function MyApp({ Component, pageProps }: AppProps) {
  useIdentifyUser();
  const router = useRouter();

  useEffect(() => {
    // Track page views
    const handleRouteChange = () => posthog?.capture('$pageview');
    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <PostHogProvider client={posthog}>
      <Provider store={store}>
        <RootLayout>
          <Component {...pageProps} />
        </RootLayout>
      </Provider>
    </PostHogProvider>
  );
}

export default MyApp;
