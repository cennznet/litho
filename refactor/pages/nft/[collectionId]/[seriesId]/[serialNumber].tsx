import { Api } from "@cennznet/api";
import { DOMComponentProps, NFTData, NFTId, NFTListing } from "@refactor/types";
import { fetchAllOpenListingIds } from "@refactor/utils/fetchLatestOpenListingIds";
import fetchAppProps, { AppProps } from "@refactor/utils/fetchAppProps";
import App from "@refactor/components/App";
import Main from "@refactor/components/Main";
import fetchListingItem from "@refactor/utils/fetchListingItem";
import fetchNFTData from "@refactor/utils/fetchNFTData";
import findListingIdByTokenId from "@refactor/utils/findListingIdByTokenId";
import Breadcrumb from "@refactor/components/Breadcrumb";
import Link from "@refactor/components/Link";
import NFTDetail from "@refactor/components/NFTDetail";
import { indexAllOpenListingItems } from "@refactor/utils/findListingIdByTokenId";
import createBEMHelper from "@refactor/utils/createBEMHelper";

const bem = createBEMHelper(require("./[serialNumber].module.scss"));

export async function getStaticPaths() {
	const api = await Api.create({
		provider: process.env.NEXT_PUBLIC_CENNZ_API_ENDPOINT,
	});

	await indexAllOpenListingItems(api);

	const allOpenListingIds = await fetchAllOpenListingIds(api);

	const paths = await Promise.all([
		...allOpenListingIds
			.map(([, listingIds]) =>
				listingIds.slice(0, 3).map((listingId) =>
					fetchListingItem(api, listingId).then(({ tokenId }) => {
						return {
							params: {
								collectionId: tokenId[0].toString(),
								seriesId: tokenId[1].toString(),
								serialNumber: tokenId[2].toString(),
							},
						};
					})
				)
			)
			.flat(),
	]);

	return { paths, fallback: "blocking" };
}

export async function getStaticProps({ params }) {
	const api = await Api.create({
		provider: process.env.NEXT_PUBLIC_CENNZ_API_ENDPOINT,
	});

	const { collectionId, seriesId, serialNumber } = params;
	const tokenId: NFTId = [
		parseInt(collectionId, 10),
		parseInt(seriesId, 10),
		parseInt(serialNumber, 10),
	];
	const listingId = await findListingIdByTokenId(api, tokenId);
	const listing = listingId ? await fetchListingItem(api, listingId) : null;

	const data = await fetchNFTData(api, tokenId);

	if (!data?.metadata)
		return {
			notFound: true,
			props: {
				refactored: true,
			},
		};

	return {
		props: {
			refactored: true,
			appProps: await fetchAppProps(api),
			listingItem: { ...listing, ...data, tokenId },
		},
		revalidate: 60,
	};
}

type PageProps = {
	appProps: AppProps;
	listingItem: NFTData & Partial<NFTListing>;
};

export function NFTSingle({
	appProps,
	listingItem,
}: DOMComponentProps<PageProps, "div">) {
	return (
		<App {...appProps}>
			<Main>
				<div className={bem("content")}>
					<Breadcrumb>
						<Link href="/marketplace">Marketplace</Link>
						<Link href={`/collection/${listingItem.tokenId[0]}`}>
							Collection #{listingItem.tokenId[0]}
						</Link>
						<span>{listingItem.metadata.name}</span>
					</Breadcrumb>

					<NFTDetail listingItem={listingItem} className={bem("detail")} />
				</div>
			</Main>
		</App>
	);
}
