import cacheManager from "cache-manager";
import fsStore from "cache-manager-fs-hash";

const diskCache = cacheManager.caching({
	store: fsStore,
	options: {
		ttl: 3600,
		subdirs: true,
	},
});

export default diskCache;
