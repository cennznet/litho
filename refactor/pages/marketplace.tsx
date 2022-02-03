import { Api } from "@cennznet/api";
import { NFTListingTuple, DOMComponentProps } from "@refactor/types";
import fetchAppProps, { AppProps } from "@refactor/utils/fetchAppProps";
import App from "@refactor/components/App";
import Main from "@refactor/components/Main";
import CollectionGrid from "@refactor/components/CollectionGrid";
import fetchLatestOpenListingIds from "@refactor/utils/fetchLatestOpenListingIds";

import createBEMHelper from "@refactor/utils/createBEMHelper";

const bem = createBEMHelper(require("./marketplace.module.scss"));

export async function getStaticProps() {
	const api = await Api.create({
		provider: process.env.NEXT_PUBLIC_CENNZ_API_ENDPOINT,
	});
	const appProps = await fetchAppProps(api);
	const defaultListingIds = await fetchLatestOpenListingIds(api);

	return {
		props: { refactored: true, appProps, defaultListingIds },
		revalidate: false,
	};
}

type PageProps = {
	appProps: AppProps;
	defaultListingIds: Array<NFTListingTuple>;
};

export function Marketplace({
	appProps,
	defaultListingIds,
}: DOMComponentProps<PageProps, "div">) {
	return (
		<App {...appProps}>
			<Main>
				<div className={bem("content")}>
					<CollectionGrid
						headline="Marketplace Collections"
						defaultListingIds={defaultListingIds}
					/>
				</div>
			</Main>
		</App>
	);
}
