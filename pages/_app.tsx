import React from "react";
import { AppProps } from "next/app";
import Head from "next/head";
import Link from "next/link";
import dynamic from "next/dynamic";

import "../styles/globals.scss";

const Web3Enable = dynamic(() => import("../components/Web3"), { ssr: false });

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <main className="w-full bg-litho-cream p-20 bg-noise">
      <Web3Enable />
      <Head>
        <title>Litho</title>
      </Head>
      <header className="h-20 py-5 flex items-center w-full justify-between fixed top-0 left-0 w-full px-20 bg-litho-cream z-10">
        <Link href="/">
          <a>
            <img src="/logo.svg" alt="Litho" />
          </a>
        </Link>
        <div className="h-12 flex items-center">
          Create
          <button className="border border-litho-wallet ml-9 flex items-center justify-between flex-1 pl-1 pr-2 py-2">
            <img src="/wallet.svg" alt="Connect Wallet" className="mr-4" />
            Connect Wallet
          </button>
        </div>
      </header>
      <Component {...pageProps} />
      <footer className="fixed bottom-0 left-0 w-full h-20 px-20 bg-litho-cream flex items-center">
        <div className="flex flex-1 items-center">
          <Link href="/">
            <a>
              <img src="/logo.svg" alt="Litho" />
            </a>
          </Link>

          <Link href="/privacy-policy">
            <a className="font-semibold ml-12">Privacy Policy</a>
          </Link>
        </div>
        <div className="flex items-center justify-end w-10/12">
          <Link href="/instagram">
            <a className="font-semibold mx-4" target="_blank">
              Instagram
            </a>
          </Link>
          <Link href="/twitter">
            <a className="font-semibold mx-4" target="_blank">
              Twitter
            </a>
          </Link>
          <Link href="/facebook">
            <a className="font-semibold mx-4" target="_blank">
              Facebook
            </a>
          </Link>
        </div>
      </footer>
    </main>
  );
};

export default MyApp;
