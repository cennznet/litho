import { Api } from "@cennznet/api";
import {
	DOMComponentProps,
	NFTData,
	NFTIdTuple,
	NFTListing,
} from "@refactor/types";
import { fetchAllOpenListingIds } from "@refactor/utils/fetchOpenListingIds";
import fetchAppProps, { AppProps } from "@refactor/utils/fetchAppProps";
import App from "@refactor/components/App";
import Main from "@refactor/components/Main";
import fetchListingItem from "@refactor/utils/fetchListingItem";
import fetchNFTData from "@refactor/utils/fetchNFTData";

export async function getStaticPaths() {
	const diskCache = require("@refactor/utils/diskCache").default;

	const api = await Api.create({
		provider: process.env.NEXT_PUBLIC_CENNZ_API_ENDPOINT,
	});

	const allOpenListingIds = await fetchAllOpenListingIds(api);
	const tokenListingMap = {};

	const paths = await Promise.all([
		...allOpenListingIds.map((listingId) =>
			fetchListingItem(api, listingId[1]).then(({ tokenId }) => {
				tokenListingMap[tokenId.join("/")] = listingId[1];
				return {
					params: {
						collectionId: tokenId[0].toString(),
						seriesId: tokenId[1].toString(),
						serialNumber: tokenId[2].toString(),
					},
				};
			})
		),
	]);

	await diskCache.set("tokenListingMap", tokenListingMap);

	return { paths, fallback: "blocking" };
}

export async function getStaticProps({ params }) {
	const diskCache = require("@refactor/utils/diskCache").default;
	const api = await Api.create({
		provider: process.env.NEXT_PUBLIC_CENNZ_API_ENDPOINT,
	});

	const { collectionId, seriesId, serialNumber } = params;
	const tokenId: NFTIdTuple = [collectionId, seriesId, serialNumber];
	const tokenListingMap = await diskCache.get("tokenListingMap");

	const listing = await fetchListingItem(
		api,
		tokenListingMap[tokenId.join("/")]
	);
	const data = await fetchNFTData(api, tokenId);

	return {
		props: {
			refactored: true,
			appProps: await fetchAppProps(api),
			listingItem: { ...listing, ...data },
		},
		revalidate: 600,
	};
}

type PageProps = {
	appProps: AppProps;
	listingItem: NFTListing & NFTData;
};

export function NFTSingle({
	appProps,
	listingItem,
}: DOMComponentProps<PageProps, "div">) {
	console.log({ listingItem });
	return (
		<App {...appProps}>
			<Main></Main>
		</App>
	);
}
