import { AppProps } from "next/app";
import Head from 'next/head';
import Link from 'next/link';

import "../styles/globals.scss";

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  return <main className="w-screen h-screen bg-litho-cream">
    <Head>
      <title>Litho</title>
    </Head>
    <header className="h-20 px-20 py-5 flex items-center w-full justify-between">
      <Link href="/">
        <a><img src="/logo.svg" alt="Litho" /></a>
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
    </main>
};

export default MyApp;
