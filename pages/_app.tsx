import React from "react";
import { AppProps } from "next/app";
import Head from "next/head";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

import ConnectWallet from "../components/ConnectWallet";
import "../styles/globals.scss";
import Text from "../components/Text";
import Modal from "../components/Modal";
import DeviceContext from "../components/DeviceContext";
import { SWRConfig } from "swr";

const Web3 = dynamic(() => import("../components/Web3"), { ssr: false });
const Device = dynamic(() => import("../components/DeviceContextProvider"), {
  ssr: false,
});

const SupportedAssetsProvider = dynamic(
  () => import("../components/SupportedAssetsProvider"),
  { ssr: false }
);

const SearchBar: React.FC<{}> = () => {
  const router = useRouter();
  const submitHandler: React.FormEventHandler = (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const { query } = form;
    if (query.value) {
      router.push(`/marketplace?q=${query.value}`);
    }
    form.reset();
  };

  const hideOnPaths = [
    "/create",
    "/nft/[collectionId]/[seriesId]/[serialNumber]",
    "/sell/[collectionId]/[seriesId]/[serialNumber]",
  ];
  if (hideOnPaths.includes(router.pathname)) {
    return null;
  }

  return (
    <form
      className="flex-1 mr-9 flex items-center border-b-2 border-black hidden lg:flex"
      onSubmit={submitHandler}
    >
      <img src="/search.svg" alt="Search" />
      <input
        type="text"
        className="bg-transparent flex-1 ml-2 outline-none"
        name="query"
        id="query"
      />
    </form>
  );
};

const ResourcesLink: React.FC<{}> = () => {
  return (
    <Link href="https://litho.a2hosted.com">
      <a className="mr-9 hidden lg:flex" target="_blank">
        <Text variant="h6" color="litho-blue">
          Resources
        </Text>
      </a>
    </Link>
  );
};

const MarketplaceLink: React.FC<{}> = () => {
  return (
    <Link href="/marketplace">
      <a className="mr-9 hidden lg:flex">
        <Text variant="h6" color="litho-blue">
          Marketplace
        </Text>
      </a>
    </Link>
  );
};

const CreateButton: React.FC<{ setShowViewOnDesktop: (val: boolean) => void }> =
  ({ setShowViewOnDesktop }) => {
    const deviceContext = React.useContext(DeviceContext);
    return deviceContext.isMobile ||
      (!deviceContext.isChrome && !deviceContext.isFirefox) ? (
      <button onClick={() => setShowViewOnDesktop(true)}>
        <Text variant="h6">Create</Text>
      </button>
    ) : (
      <Link href="/create">
        <a>
          <Text variant="h6">Create</Text>
        </a>
      </Link>
    );
  };

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  const [showViewOnDesktop, setShowViewOnDesktop] = React.useState(false);
  // short-circute to use the new system
  if(pageProps.refactored) return <Component {...pageProps}/>
  return (
    <SWRConfig
      value={{
        fetcher: (resource, init) =>
          fetch(resource, init).then((res) => res.json()),
      }}
    >
      <Device>
        <Web3>
          <SupportedAssetsProvider>
            <Head>
              <title>Litho</title>
              <link rel="shortcut icon" href="/favicon.ico" />
              <link
                rel="stylesheet"
                href="https://use.typekit.net/txj7ase.css"
              />
              <link
                rel="preload"
                href="/api/getAllNfts"
                as="fetch"
                crossOrigin="anonymous"
              />
            </Head>
            <header className="h-20 py-5 flex items-center justify-between top-0 left-0 w-full px-6 lg:px-20 z-20 bg-litho-cream bg-noise">
              <Link href="/">
                <a>
                  <img src="/logo-beta.svg" alt="Litho" />
                </a>
              </Link>
              <div className="ml-24 h-12 flex items-center flex-1 justify-end">
                <ResourcesLink />
                <MarketplaceLink />
                <CreateButton setShowViewOnDesktop={setShowViewOnDesktop} />
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
                  styles={{
                    modalBody: "w-11/12 lg:w-3/12",
                    modalContainer: "z-20",
                  }}
                >
                  <Text variant="h4" color="litho-blue">
                    Open in Chrome on a desktop to mint your NFT
                  </Text>
                </Modal>
              )}
            </main>
            <footer className="lg:h-20 px-6 py-4 lg:px-20 lg:py-0 bg-litho-cream flex flex-col lg:flex-row lg:items-center lg:flex-1">
              <div className="flex flex-wrap lg:flex-1 mb-2 lg:mb-0 lg:flex-row">
                <Link href="/">
                  <a className="mb-4 lg:mb-0 w-full lg:w-auto">
                    <img src="/logo-beta.svg" alt="Litho" />
                  </a>
                </Link>

                {/* <Link href="/about">
              <a className="lg:ml-12 flex items-center">
                <Text variant="subtitle1">About</Text>
              </a>
            </Link>
            <Link href="/community-guidelines">
              <a className="ml-4 mr-4 lg:ml-12 lg:mr-0 flex items-center">
                <Text variant="subtitle1">Community Guidelines</Text>
              </a>
            </Link> */}
                <Link href="https://cennz.net/privacy-policy/">
                  <a className="lg:ml-12 flex items-center" target="_blank">
                    <Text variant="subtitle1">Privacy Policy</Text>
                  </a>
                </Link>
                <Link href="https://litho.a2hosted.com/terms-of-use/">
                  <a className="lg:ml-12 flex items-center" target="_blank">
                    <Text variant="subtitle1">Terms of use</Text>
                  </a>
                </Link>
              </div>
              <div className="flex items-center lg:justify-end lg:w-6/12 space-x-4">
                <Link href="https://twitter.com/Lithoverse">
                  <a target="_blank">
                    <Text variant="subtitle1">Twitter</Text>
                  </a>
                </Link>
                <Link href="https://www.instagram.com/lithoverse/">
                  <a target="_blank">
                    <Text variant="subtitle1">Instagram</Text>
                  </a>
                </Link>
              </div>
            </footer>
          </SupportedAssetsProvider>
        </Web3>
      </Device>
    </SWRConfig>
  );
};

export default MyApp;
