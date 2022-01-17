import CENNZApiProvider from "@refactor/providers/CENNZApiProvider";

export default function App({ children }) {
	return (
		<CENNZApiProvider endpoint={process.env.NEXT_PUBLIC_CENNZ_API_ENDPOINT}>
			{children}
		</CENNZApiProvider>
	);
}
