import cacheManager, { Cache } from "cache-manager";

export default function createCacheStore(ttl: number = 60): Cache {
	return cacheManager.caching({
		store:
			typeof window === "undefined"
				? require("cache-manager-fs-hash")
				: "memory",
		ttl,
		options: {
			path: "./.cache",

			subdirs: true,
		},
	});
}
