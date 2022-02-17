import { Api } from "@cennznet/api";
import { NFTListingTuple, DOMComponentProps } from "@refactor/types";
import fetchAppProps from "@refactor/utils/fetchAppProps";
import HomeHero from "@refactor/components/HomeHero";
import FeaturedGrid from "@refactor/components/FeaturedGrid";
import fetchOpenListingIds from "@refactor/utils/fetchOpenListingIds";
import fetchLatestOpenListingIds from "@refactor/utils/fetchLatestOpenListingIds";
import LatestGrid from "@refactor/components/LatestGrid";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import Main from "@refactor/components/Main";
import { NextSeo } from "next-seo";

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
};

export function Home({
	featuredListingIds,
	latestListingIds,
}: DOMComponentProps<PageProps, "div">) {
	return (
		<Main>
			<NextSeo title="Home" />
			<div className={bem("content")}>
				<HomeHero className={bem("homeIntro")} />
				{!!featuredListingIds.length && (
					<FeaturedGrid
						listingIds={featuredListingIds}
						className={bem("featuredGrid")}
					/>
				)}
				<LatestGrid
					defaultListingIds={latestListingIds}
					className={bem("lastestGrid")}
				/>
			</div>
		</Main>
	);
}
