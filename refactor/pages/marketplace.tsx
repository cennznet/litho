import { NFTListingTuple, DOMComponentProps } from "@refactor/types";
import fetchAppProps from "@refactor/utils/fetchAppProps";
import CollectionGrid from "@refactor/components/CollectionGrid";
import fetchLatestOpenListingIds from "@refactor/utils/fetchLatestOpenListingIds";
import Main from "@refactor/components/Main";
import { NextSeo } from "next-seo";

import createBEMHelper from "@refactor/utils/createBEMHelper";
import getApiInstance from "@refactor/utils/getApiInstance";

const bem = createBEMHelper(require("./marketplace.module.scss"));

export async function getStaticProps() {
	const api = await getApiInstance();
	const appProps = await fetchAppProps(api);
	const defaultListingIds = await fetchLatestOpenListingIds(api);

	return {
		props: { refactored: true, appProps, defaultListingIds },
		revalidate: false,
	};
}

type PageProps = {
	defaultListingIds: Array<NFTListingTuple>;
};

export function Marketplace({
	defaultListingIds,
}: DOMComponentProps<PageProps, "div">) {
	return (
		<Main>
			<NextSeo title="Marketplace" />
			<div className={bem("content")}>
				<CollectionGrid
					headline="Marketplace Collections"
					defaultListingIds={defaultListingIds}
				/>
			</div>
		</Main>
	);
}
