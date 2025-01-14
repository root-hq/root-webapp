import type { AppProps } from "next/app";
import Head from "next/head";
import type { FC } from "react";
import React, { useState } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import { clusterApiUrl } from "@solana/web3.js";

import { WalletModalProvider } from "../components/Wallet";
import { BottomStatusProvider } from "../components/BottomStatus";
import { Analytics } from '@vercel/analytics/react';

const BottomStatusBar = dynamic(
  () => import("../components/BottomStatus/BottomStatusBar"),
);
const Header = dynamic(() => import("../components/Header"));

import Script from "next/script";
import dynamic from "next/dynamic";
import { RootStateProvider } from "../components/RootStateContextType";
import Announcement from "components/Announcement";

// Use require instead of import since order matters
// require("bootstrap/dist/css/bootstrap.min.css");
require("../styles/wallet.css");
require("../styles/globals.css");

const App: FC<AppProps> = ({ Component, pageProps }) => {
  const endpoint = useMemo(() => clusterApiUrl("mainnet-beta"), []);

  const wallets = useMemo(
    () => [
      // new OKXWalletAdapter(),
      // new LedgerWalletAdapter(),
      // new CoinbaseWalletAdapter(),
      // new WalletConnectWalletAdapter({
      //   network: WalletAdapterNetwork.Mainnet,
      // } as WalletConnectWalletAdapterConfig),
    ],
    [],
  );

  const [isScriptReady, setIsScriptReady] = useState(false);

  return (
    <>
      <Head>
        <title>Root - Trading bots and limit orders on Solana</title>
        <link rel="icon" href="/images/root-logo.png" />
        <meta property="og:title" content="Root Exchange" />
        <meta property="og:description" content="Best on-chain limit orders on Solana" />
      </Head>

      <Script
        src="/static/datafeeds/udf/dist/bundle.js"
        strategy="lazyOnload"
        onReady={() => {
          setIsScriptReady(true);
        }}
      />
      {isScriptReady ? (
        <BottomStatusProvider>
          <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets}>
              <WalletModalProvider>
                <RootStateProvider>
                  <div>
                  <Announcement />
                    <Header />
                  </div>
                  <Component {...pageProps} />
                  <div>
                    <BottomStatusBar />
                  </div>
                  <div>
                    <Analytics />
                  </div>
                </RootStateProvider>
              </WalletModalProvider>
            </WalletProvider>
          </ConnectionProvider>
        </BottomStatusProvider>
      ) : (
        <div
          style={{
            color: `#ddd`,
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            margin: "auto",
          }}
        >{`Loading data...`}</div>
      )}

      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta2/css/all.min.css"
        integrity="sha512-YWzhKL2whUzgiheMoBFwW8CKV4qpHQAEuvilg9FAn5VJUDwKZZxkJNuGM4XkWuk94WCrrwslk8yWNGmY1EduTA=="
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      />

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
        rel="stylesheet"
      />
    </>
  );
};

export default App;
