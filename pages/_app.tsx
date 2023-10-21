import type { AppProps } from "next/app";
import Head from "next/head";
import type { FC } from "react";
import React from "react";
import Header from "../components/Header";

// Use require instead of import since order matters
require("../styles/globals.css");

const App: FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>
          Root - Automated trading strategies for providing liquidity on Solana
        </title>
        <link rel="icon" href="/images/root-logo.png" />
      </Head>

      <div>
        <Header />
      </div>
      <Component {...pageProps} />

      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta2/css/all.min.css"
        integrity="sha512-YWzhKL2whUzgiheMoBFwW8CKV4qpHQAEuvilg9FAn5VJUDwKZZxkJNuGM4XkWuk94WCrrwslk8yWNGmY1EduTA=="
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      />
    </>
  );
};

export default App;
