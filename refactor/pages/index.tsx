import { Api } from "@cennznet/api";
import { DOMComponentProps } from "@refactor/types";
import App from "@refactor/components/App";
import Main from "@refactor/components/Main";
import fetchAppProps, { AppProps } from "@refactor/utils/fetchAppProps";
import HomeIntro from "@refactor/components/HomeIntro";
import FeaturedGrid from "@refactor/components/FeaturedGrid";
import fetchOpenListingIds from "@refactor/utils/fetchOpenListingIds";

export async function getStaticProps() {
	const api = await Api.create({
		provider: process.env.NEXT_PUBLIC_CENNZ_API_ENDPOINT,
	});

	const appProps = await fetchAppProps(api);

	const featuredCollectionId = parseInt(
		process.env.NEXT_PUBLIC_FEATURED_COLLECTION_ID,
		10
	);
	const featuredListingIds = await fetchOpenListingIds(
		api,
		featuredCollectionId
	);

	return {
		props: { refactored: true, appProps, featuredListingIds },
		revalidate: 60,
	};
}

type PageProps = {
	featuredListingIds: Array<number>;
	appProps: AppProps;
};

export function Home({
	appProps,
	featuredListingIds,
}: DOMComponentProps<PageProps, "div">) {
	return (
		<App {...appProps}>
			<Main>
				<HomeIntro />
				<FeaturedGrid listingIds={featuredListingIds} />
			</Main>
		</App>
	);
}
