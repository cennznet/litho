import { PropsWithChildren, useEffect } from "react";
import Modal from "react-modal";
import Head from "next/head";
import CENNZApiProvider from "@refactor/providers/CENNZApiProvider";
import SupportedAssetsProvider from "@refactor/providers/SupportedAssetsProvider";
import SupportedWalletProvider from "@refactor/providers/SupportedWalletProvider";
import CENNZExtensionProvider from "@refactor/providers/CENNZExtensionProvider";
import UserAgentProvider from "@refactor/providers/UserAgentProvider";
import { AppProps } from "@refactor/utils/fetchAppProps";
import SellFlowProvider from "@refactor/providers/SellFlowProvider";
import MintFlowProvider from "@refactor/providers/MintFlowProvider";
import DialogProvider from "@refactor/providers/DialogProvider";
import { useRouter } from "next/router";
import trackPageview from "@refactor/utils/trackPageview";
import { DefaultSeo } from "next-seo";

Modal.setAppElement("#__next");

type ComponentProps = {} & AppProps;

export default function App({
	children,
	supportedAssets,
}: PropsWithChildren<ComponentProps>) {
	const { events } = useRouter();

	useEffect(() => {
		if (!events) return;

		events.on("routeChangeComplete", trackPageview);
		return () => {
			events.off("routeChangeComplete", trackPageview);
		};
	}, [events]);

	return (
		<UserAgentProvider>
			<DialogProvider>
				<CENNZExtensionProvider>
					<CENNZApiProvider
						endpoint={process.env.NEXT_PUBLIC_CENNZ_API_ENDPOINT}>
						<SupportedAssetsProvider assets={supportedAssets}>
							<SupportedWalletProvider>
								<MintFlowProvider>
									<SellFlowProvider>
										<DefaultSeo
											titleTemplate="Litho | %s"
											title="Litho"
											description="Launch into the Lithoverse. Your place to create and exchange NFTs."
											twitter={{
												handle: "@CENNZnet",
												site: "@Lithoverse",
												cardType: "summary_large_image",
											}}
											openGraph={{
												images: [
													{
														url: `${
															process.env.VERCEL_URL || "https://lithoverse.xyz"
														}/assets/litho-share.png`,
														width: 800,
														height: 421,
													},
												],
											}}
										/>
										<Head>
											<title>Litho</title>
											<link rel="shortcut icon" href="/favicon.ico" />
											<link
												rel="stylesheet"
												href="https://use.typekit.net/txj7ase.css"
											/>
										</Head>
										{children}
									</SellFlowProvider>
								</MintFlowProvider>
							</SupportedWalletProvider>
						</SupportedAssetsProvider>
					</CENNZApiProvider>
				</CENNZExtensionProvider>
			</DialogProvider>
		</UserAgentProvider>
	);
}
