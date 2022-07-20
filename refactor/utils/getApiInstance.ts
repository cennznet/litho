import { Api } from "@cennznet/api";

let api: Api;

export default async function getApiInstance(): Promise<Api> {
	if (api) return api;
	return (api = await Api.create({
		provider: process.env.NEXT_PUBLIC_CENNZ_API_ENDPOINT,
	}));
}
