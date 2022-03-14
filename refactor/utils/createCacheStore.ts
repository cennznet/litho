import cacheManager, { Cache } from "cache-manager";

export default function createCacheStore(ttl: number = 60): Cache {
	return cacheManager.caching({
		store:
			process.env.EXEC_ENV === "build"
				? require("cache-manager-fs-hash")
				: "memory",
		ttl,
		options: {
			path: "./.next/cache/json",

			subdirs: true,
		},
	});
}
