import { PropsWithChildren } from "react";
import Modal from "react-modal";
import Head from "next/head";
import CENNZApiProvider from "@refactor/providers/CENNZApiProvider";
import SupportedAssetsProvider from "@refactor/providers/SupportedAssetsProvider";
import SupportedWalletProvider from "@refactor/providers/SupportedWalletProvider";
import DAppModuleProvider from "@refactor/providers/DAppModuleProvider";
import UserAgentProvider from "@refactor/providers/UserAgentProvider";
import Web3AccountsProvider from "@refactor/providers/Web3AccountsProvider";
import { AppProps } from "@refactor/utils/fetchAppProps";

Modal.setAppElement("#__next");

type ComponentProps = {} & AppProps;

export default function App({
	children,
	supportedAssets,
}: PropsWithChildren<ComponentProps>) {
	return (
		<UserAgentProvider>
			<DAppModuleProvider>
				<Web3AccountsProvider>
					<CENNZApiProvider
						endpoint={process.env.NEXT_PUBLIC_CENNZ_API_ENDPOINT}>
						<SupportedAssetsProvider assets={supportedAssets}>
							<SupportedWalletProvider>
								<Head>
									<title>Litho</title>
									<link rel="shortcut icon" href="/favicon.ico" />
									<link
										rel="stylesheet"
										href="https://use.typekit.net/txj7ase.css"
									/>
								</Head>
								{children}
							</SupportedWalletProvider>
						</SupportedAssetsProvider>
					</CENNZApiProvider>
				</Web3AccountsProvider>
			</DAppModuleProvider>
		</UserAgentProvider>
	);
}
