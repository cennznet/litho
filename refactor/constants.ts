export const SUPPORTED_ASSET_IDS: number[] =
	process.env.NEXT_PUBLIC_SUPPORTED_ASSETS?.split(",").map(Number);
