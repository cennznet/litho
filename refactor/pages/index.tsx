import { Api } from "@cennznet/api";
import { NFTListingTuple, DOMComponentProps } from "@refactor/types";
import App from "@refactor/components/App";
import Main from "@refactor/components/Main";
import fetchAppProps, { AppProps } from "@refactor/utils/fetchAppProps";
import HomeIntro from "@refactor/components/HomeIntro";
import FeaturedGrid from "@refactor/components/FeaturedGrid";
import fetchOpenListingIds, {
	fetchLatestOpenListingIds,
} from "@refactor/utils/fetchOpenListingIds";
import LatestGrid from "@refactor/components/LatestGrid";
import createBEMHelper from "@refactor/utils/createBEMHelper";

const bem = createBEMHelper(require("./index.module.scss"));

export async function getStaticProps() {
	const api = await Api.create({
		provider: process.env.NEXT_PUBLIC_CENNZ_API_ENDPOINT,
	});

	const appProps = await fetchAppProps(api);
	const latestListingIds = await fetchLatestOpenListingIds(api);

	const featuredCollectionId = parseInt(
		process.env.NEXT_PUBLIC_FEATURED_COLLECTION_ID,
		10
	);
	const featuredListingIds = await fetchOpenListingIds(
		api,
		featuredCollectionId
	);

	return {
		props: {
			refactored: true,
			appProps,
			featuredListingIds,
			latestListingIds,
		},
		revalidate: 60,
	};
}

type PageProps = {
	featuredListingIds: Array<number>;
	latestListingIds: Array<NFTListingTuple>;
	appProps: AppProps;
};

export function Home({
	appProps,
	featuredListingIds,
	latestListingIds,
}: DOMComponentProps<PageProps, "div">) {
	return (
		<App {...appProps}>
			<Main>
				<HomeIntro className={bem("homeIntro")} />
				<FeaturedGrid
					listingIds={featuredListingIds}
					className={bem("featuredGrid")}
				/>
				<LatestGrid
					defaultListingIds={latestListingIds}
					className={bem("lastestGrid")}
				/>
			</Main>
		</App>
	);
}
