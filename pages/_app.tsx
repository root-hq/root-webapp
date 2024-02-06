import type { AppProps } from "next/app";
import Head from "next/head";
import type { FC } from "react";
import React, { useState } from "react";
import Header from "../components/Header";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletModalProvider } from "../components/Wallet";
import { BottomStatusProvider } from "../components/BottomStatus";
import BottomStatusBar from "../components/BottomStatus/BottomStatusBar";
import Script from "next/script";

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
        <title>Root - Efficient limit orders on Solana</title>
        <link rel="icon" href="/images/root-logo.png" />
        </Head>

        <Script
          src="/static/datafeeds/udf/dist/bundle.js"
          strategy="lazyOnload"
          onReady={() => {
            console.log("Setting to ready");
            setIsScriptReady(true);
          }}
        />
      {
        isScriptReady ?
          <BottomStatusProvider>
            <ConnectionProvider endpoint={endpoint}>
              <WalletProvider wallets={wallets}>
                <WalletModalProvider>
                  <div>
                    <Header />
                  </div>
                  <Component {...pageProps} />
                  <div>
                    <BottomStatusBar />
                  </div>
                </WalletModalProvider>
              </WalletProvider>
            </ConnectionProvider>
          </BottomStatusProvider>
        :
          <div style={{color: `#ddd`}}>{`Not ready, needs hard refresh`}</div>
      }

      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta2/css/all.min.css"
        integrity="sha512-YWzhKL2whUzgiheMoBFwW8CKV4qpHQAEuvilg9FAn5VJUDwKZZxkJNuGM4XkWuk94WCrrwslk8yWNGmY1EduTA=="
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      />

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet" />
    </>
  );
};

export default App;
