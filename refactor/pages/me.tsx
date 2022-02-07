import { Api } from "@cennznet/api";
import { DOMComponentProps } from "@refactor/types";
import fetchAppProps, { AppProps } from "@refactor/utils/fetchAppProps";
import App from "@refactor/components/App";
import Main from "@refactor/components/Main";
import ProfileHero from "@refactor/components/ProfileHero";

export async function getStaticProps() {
	const api = await Api.create({
		provider: process.env.NEXT_PUBLIC_CENNZ_API_ENDPOINT,
	});
	const appProps = await fetchAppProps(api);

	return {
		props: { refactored: true, appProps },
		revalidate: false,
	};
}

type PageProps = {
	appProps: AppProps;
};
export function MyProfile({ appProps }: DOMComponentProps<PageProps, "div">) {
	return (
		<App {...appProps}>
			<Main>
				<ProfileHero />
			</Main>
		</App>
	);
}
