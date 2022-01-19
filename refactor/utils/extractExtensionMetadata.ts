import { Api } from "@cennznet/api";
import { defaults as addressDefaults } from "@polkadot/util-crypto/address/defaults";

export default async function extractExtensionMetadata(api: Api): Promise<any> {
	const systemChain = await api.rpc.system.chain();
	const genesisHashExpected = api.genesisHash.toString();
	const additionalTypes = await fetch(
		"https://raw.githubusercontent.com/cennznet/api.js/master/extension-releases/runtimeModuleTypes.json"
	).then((response) => response.json());

	if (!additionalTypes) return;

	let typesForCurrentChain = additionalTypes[genesisHashExpected];
	// if not able to find types, take the first element (in case of local node the genesis Hash keep changing)
	typesForCurrentChain =
		typesForCurrentChain === undefined
			? Object.values(additionalTypes)[0]
			: typesForCurrentChain;

	let specTypes, userExtensions;

	if (typesForCurrentChain) {
		specTypes = typesForCurrentChain.types;
		userExtensions = typesForCurrentChain.userExtensions;
	}
	const DEFAULT_SS58 = api.registry.createType("u32", addressDefaults.prefix);
	const DEFAULT_DECIMALS = api.registry.createType("u32", 4);

	return {
		chain: systemChain,
		color: "#191a2e",
		genesisHash: api.genesisHash.toHex(),
		icon: "CENNZnet",
		metaCalls: Buffer.from(api.runtimeMetadata.asCallsOnly.toU8a()).toString(
			"base64"
		),
		specVersion: api.runtimeVersion.specVersion.toNumber(),
		ss58Format: DEFAULT_SS58.toNumber(),
		tokenDecimals: DEFAULT_DECIMALS.toNumber(),
		tokenSymbol: "CENNZ",
		types: specTypes,
		userExtensions: userExtensions,
	};
}
