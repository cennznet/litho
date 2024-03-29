import { DOMComponentProps } from "@refactor/types";
import fetchAppProps from "@refactor/utils/fetchAppProps";
import ProfileHero from "@refactor/components/ProfileHero";
import OwnerGrid from "@refactor/components/OwnerGrid";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import Main from "@refactor/components/Main";
import { NextSeo } from "next-seo";
import getApiInstance from "@refactor/utils/getApiInstance";

const bem = createBEMHelper(require("./me.module.scss"));

export async function getStaticProps() {
	const api = await getApiInstance();
	const appProps = await fetchAppProps(api);

	return {
		props: { refactored: true, appProps },
		revalidate: false,
	};
}

type PageProps = {};

export function MyProfile({}: DOMComponentProps<PageProps, "div">) {
	return (
		<Main>
			<NextSeo title="My Profile" />
			<ProfileHero className={bem("hero")} />
			<OwnerGrid className={bem("grid")} />
		</Main>
	);
}
