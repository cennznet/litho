import { Api } from "@cennznet/api";
import { CollectionTupple, DOMComponentProps } from "@refactor/types";
import fetchAppProps, { AppProps } from "@refactor/utils/fetchAppProps";
import App from "@refactor/components/App";
import Main from "@refactor/components/Main";
import CollectionGrid from "@refactor/components/CollectionGrid";
import { fetchAllOpenListingIds } from "@refactor/utils/fetchOpenListingIds";

export async function getStaticProps() {
	const api = await Api.create({
		provider: process.env.NEXT_PUBLIC_CENNZ_API_ENDPOINT,
	});
	const appProps = await fetchAppProps(api);
	const defaultListingIds = await fetchAllOpenListingIds(api);

	return {
		props: { refactored: true, appProps, defaultListingIds },
		revalidate: false,
	};
}

type PageProps = {
	appProps: AppProps;
	defaultListingIds: Array<CollectionTupple>;
};

export function Marketplace({
	appProps,
	defaultListingIds,
}: DOMComponentProps<PageProps, "div">) {
	return (
		<App {...appProps}>
			<Main>
				<CollectionGrid
					headline="Marketplace Collections"
					defaultListingIds={defaultListingIds}
				/>
			</Main>
		</App>
	);
}
