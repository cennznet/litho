import Head from "next/head";

import CENNZApiProvider from "@refactor/providers/CENNZApiProvider";
import SupportedAssetsProvider from "@refactor/providers/SupportedAssetsProvider";
import SupportedWalletProvider from "@refactor/providers/SupportedWalletProvider";
import { PropsWithChildren } from "react";

type ComponentProps = {};

export default function App({ children }: PropsWithChildren<ComponentProps>) {
	return (
		<CENNZApiProvider endpoint={process.env.NEXT_PUBLIC_CENNZ_API_ENDPOINT}>
			<SupportedAssetsProvider>
				<SupportedWalletProvider>
					<Head>
						<title>Litho</title>
						<link rel="shortcut icon" href="/favicon.ico" />
						<link rel="stylesheet" href="https://use.typekit.net/txj7ase.css" />
					</Head>
					{children}
				</SupportedWalletProvider>
			</SupportedAssetsProvider>
		</CENNZApiProvider>
	);
}
