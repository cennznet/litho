import Head from "next/head";

import CENNZApiProvider from "@refactor/providers/CENNZApiProvider";

export default function App({ children }) {
	return (
		<CENNZApiProvider endpoint={process.env.NEXT_PUBLIC_CENNZ_API_ENDPOINT}>
			<Head>
				<title>Litho</title>
				<link rel="shortcut icon" href="/favicon.ico" />
				<link rel="stylesheet" href="https://use.typekit.net/txj7ase.css" />
			</Head>
			{children}
		</CENNZApiProvider>
	);
}
