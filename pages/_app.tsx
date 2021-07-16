import React from "react";
import { AppProps } from "next/app";
import Head from "next/head";
import Link from "next/link";
import dynamic from "next/dynamic";

import ConnectWallet from "../components/ConnectWallet";
import "../styles/globals.scss";
import Text from "../components/Text";
import Modal from "../components/Modal";

const Web3 = dynamic(() => import("../components/Web3"), { ssr: false });

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  const [showViewOnDesktop, setShowViewOnDesktop] = React.useState(false);

  return (
    <Web3>
      <Head>
        <title>Litho</title>
        <link rel="stylesheet" href="https://use.typekit.net/txj7ase.css" />
      </Head>
      <header className="h-20 py-5 flex items-center w-full justify-between top-0 left-0 w-full px-6 lg:px-20 z-20 bg-litho-cream bg-noise">
        <Link href="/">
          <a>
            <img src="/logo.svg" alt="Litho" />
          </a>
        </Link>
        <div className="h-12 flex items-center">
          <Link href="/create">
            <a className="hidden lg:block">
              <Text variant="h6">Create</Text>
            </a>
          </Link>
          <button
            className="lg:hidden"
            onClick={() => setShowViewOnDesktop(true)}
          >
            <Text variant="h6">Create</Text>
          </button>
          <ConnectWallet />
        </div>
      </header>
      <main
        className="w-full bg-litho-cream p-6 lg:px-20 bg-noise"
        style={{ minHeight: "calc(100% - 160px)" }}
      >
        <Component {...pageProps} />
        {showViewOnDesktop && (
          <Modal
            onClose={() => setShowViewOnDesktop(false)}
            disableOutsideClick={true}
            styles={{ modalBody: "w-11/12", modalContainer: "z-20" }}
          >
            <Text variant="h4" color="litho-blue">
              Open in Chrome on a desktop to mint your NFT
            </Text>
          </Modal>
        )}
      </main>
      <footer className="lg:h-20 px-6 py-4 lg:px-20 lg:py-0 bg-litho-cream flex flex-col lg:flex-row lg:items-center lg:flex-1">
        <div className="flex flex-col lg:flex-1 mb-2 lg:mb-0 lg:flex-row">
          <Link href="/">
            <a className="mb-4 lg:mb-0">
              <img src="/logo.svg" alt="Litho" />
            </a>
          </Link>

          <Link href="/privacy-policy">
            <a className="font-semibold lg:ml-12 flex items-center">
              Privacy Policy
            </a>
          </Link>
        </div>
        <div className="flex items-center lg:justify-end lg:w-9/12 space-x-4">
          <Link href="https://twitter.com/CENNZnet">
            <a className="font-semibold" target="_blank">
              Twitter
            </a>
          </Link>
          <Link href="https://discord.gg/hsRbe4gb">
            <a className="font-semibold" target="_blank">
              Discord
            </a>
          </Link>
        </div>
      </footer>
    </Web3>
  );
};

export default MyApp;
