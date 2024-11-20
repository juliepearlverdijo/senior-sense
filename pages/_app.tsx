import type { AppProps } from "next/app";
import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/react";
import ErrorBoundary from "../components/ErrorBoundary";
import { ReduxProvider } from "@/store/provider";
import { log } from "../lib/logger";
import { Toaster } from "@/components/ui/toaster";
import { Inter, Poppins } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
const poppins = Poppins({
  weight: ["100", "300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

import "../styles/globals.css";
import Head from "next/head";

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  useEffect(() => {
    log.info("App initialized");
  }, []);

  return (
    <>
      <Head>
        <title>Senior Sense Demo</title>
      </Head>
      <style jsx global>{`
        html {
          font-family: ${poppins.style.fontFamily};
        }
      `}</style>
      <ReduxProvider>
        <SessionProvider session={session}>
          <ErrorBoundary>
            <Component {...pageProps} />
            <Toaster />
            <Analytics />
          </ErrorBoundary>
        </SessionProvider>
      </ReduxProvider>
    </>
  );
}

export default MyApp;
