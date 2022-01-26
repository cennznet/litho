import { Api } from "@cennznet/api";
import {
	CollectionTupple,
	DOMComponentProps,
	NFTCollectionId,
} from "@refactor/types";
import fetchAppProps, { AppProps } from "@refactor/utils/fetchAppProps";
import App from "@refactor/components/App";
import Main from "@refactor/components/Main";
import CollectionGrid from "@refactor/components/CollectionGrid";
import fetchOpenListingIds, {
	fetchAllOpenListingIds,
} from "@refactor/utils/fetchOpenListingIds";

export async function getStaticProps({ params }) {
	const api = await Api.create({
		provider: process.env.NEXT_PUBLIC_CENNZ_API_ENDPOINT,
	});
	const appProps = await fetchAppProps(api);

	const collectionId = parseInt(params?.collectionId, 10);
	const defaultListingIds = await fetchOpenListingIds(api, collectionId);

	return {
		props: { refactored: true, appProps, collectionId, defaultListingIds },
		revalidate: false,
	};
}

export async function getStaticPaths() {
	const api = await Api.create({
		provider: process.env.NEXT_PUBLIC_CENNZ_API_ENDPOINT,
	});

	const paths = (await fetchAllOpenListingIds(api)).map(
		(listingId: CollectionTupple) => ({
			params: {
				collectionId: listingId[0].toString(),
			},
		})
	);

	return { paths, fallback: "blocking" };
}

type PageProps = {
	appProps: AppProps;
	collectionId: NFTCollectionId;
	defaultListingIds: Array<CollectionTupple>;
};

export function Collection({
	appProps,
	collectionId,
	defaultListingIds,
}: DOMComponentProps<PageProps, "div">) {
	return (
		<App {...appProps}>
			<Main>
				<CollectionGrid
					headline={`Collection #${collectionId}`}
					collectionId={collectionId}
					defaultListingIds={defaultListingIds}
				/>
			</Main>
		</App>
	);
}
