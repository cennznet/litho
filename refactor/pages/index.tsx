import { Api } from "@cennznet/api";
import { DOMComponentProps, NFTListing } from "@refactor/types";
import App from "@refactor/components/App";
import Main from "@refactor/components/Main";
import fetchOpenListings from "@refactor/utils/fetchOpenListings";
import fetchAppProps, { AppProps } from "@refactor/utils/fetchAppProps";
import HomeIntro from "@refactor/components/HomeIntro";
import ListingGrid from "@refactor/components/ListingGrid";
import Text from "@refactor/components/Text";

export async function getStaticProps() {
	const api = await Api.create({
		provider: process.env.NEXT_PUBLIC_CENNZ_API_ENDPOINT,
	});
	const featuredCollectionId = process.env.NEXT_FEATURED_COLLECTION_ID;

	const featuredListings = featuredCollectionId
		? await fetchOpenListings(api, process.env.NEXT_FEATURED_COLLECTION_ID)
		: null;

	const appProps = await fetchAppProps(api);

	return {
		props: { refactored: true, featuredListings, appProps },
		revalidate: 3600,
	};
}

type PageProps = {
	featuredListings: Array<NFTListing>;
	appProps: AppProps;
};

export function Home({
	featuredListings,
	appProps,
}: DOMComponentProps<PageProps, "div">) {
	return (
		<App {...appProps}>
			<Main>
				<HomeIntro />
				<ListingGrid items={featuredListings.slice(0, 4)}>
					<Text variant="headline3">
						{process.env.NEXT_PUBLIC_FEATURED_COLLECTION_TITLE ||
							"Featured Collection"}
					</Text>
				</ListingGrid>
			</Main>
		</App>
	);
}
