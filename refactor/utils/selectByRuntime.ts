import { Api } from "@cennznet/api";
export default function selectByRuntime(
	api: Api,
	{ current, cerulean }: { current: () => any; cerulean: () => any }
): any {
	const runtimeVersion = api.runtimeVersion.specVersion.toNumber();

	if (runtimeVersion <= 46) return current();
	return cerulean();
}
