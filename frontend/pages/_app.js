import '../styles/globals.css'
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { isAuthenticated } from '../utils/auth';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated and not already on login page
    if (!isAuthenticated() && router.pathname !== '/login') {
      router.push('/login');
    }
  }, [router.pathname]);

  return <Component {...pageProps} />
}

export default MyApp
