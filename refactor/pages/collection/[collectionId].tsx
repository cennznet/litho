import { Api } from "@cennznet/api";
import {
	NFTListingTuple,
	DOMComponentProps,
	NFTCollectionId,
} from "@refactor/types";
import fetchAppProps from "@refactor/utils/fetchAppProps";
import CollectionGrid from "@refactor/components/CollectionGrid";
import fetchOpenListingIds from "@refactor/utils/fetchOpenListingIds";
import fetchLatestOpenListingIds from "@refactor/utils/fetchLatestOpenListingIds";
import Breadcrumb from "@refactor/components/Breadcrumb";
import Link from "@refactor/components/Link";
import Main from "@refactor/components/Main";
import { NextSeo } from "next-seo";

export async function getStaticPaths() {
	const api = await Api.create({
		provider: process.env.NEXT_PUBLIC_CENNZ_API_ENDPOINT,
	});

	const paths = (await fetchLatestOpenListingIds(api)).map(
		(listingId: NFTListingTuple) => ({
			params: {
				collectionId: listingId[0].toString(),
			},
		})
	);

	return { paths, fallback: "blocking" };
}

export async function getStaticProps({ params }) {
	const api = await Api.create({
		provider: process.env.NEXT_PUBLIC_CENNZ_API_ENDPOINT,
	});
	const appProps = await fetchAppProps(api);

	const collectionId = parseInt(params?.collectionId, 10);
	const defaultListingIds = await fetchOpenListingIds(api, collectionId);

	return {
		props: { refactored: true, appProps, collectionId, defaultListingIds },
		revalidate: 600,
	};
}

type PageProps = {
	collectionId: NFTCollectionId;
	defaultListingIds: Array<NFTListingTuple>;
};

export function Collection({
	collectionId,
	defaultListingIds,
}: DOMComponentProps<PageProps, "div">) {
	return (
		<Main>
			<NextSeo title={`Collection #${collectionId}`} />
			<Breadcrumb>
				<Link href="/marketplace">Marketplace</Link>
				<span>{`Collection #${collectionId}`}</span>
			</Breadcrumb>
			<CollectionGrid
				headline={`Collection #${collectionId}`}
				collectionId={collectionId}
				defaultListingIds={defaultListingIds}
			/>
		</Main>
	);
}
