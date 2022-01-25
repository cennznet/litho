import { Api } from "@cennznet/api";
import { AssetInfo } from "@refactor/types";
import fetchSupportedAssets from "@refactor/utils/fetchSupportedAssets";

export type AppProps = {
	supportedAssets: Array<AssetInfo>;
};

export default async function fetchAppProps(api: Api): Promise<AppProps> {
	return {
		supportedAssets: await fetchSupportedAssets(api),
	};
}
