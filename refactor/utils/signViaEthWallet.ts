import { Api, SubmittableResult } from "@cennznet/api";
import { MetaMaskInpageProvider } from "@metamask/providers";
import { CENNZnetExtrinsic } from "@cennznet/types/interfaces/extrinsic";

export default async function signViaEthWallet(
	api: Api,
	ethAddress: string,
	extrinsic: CENNZnetExtrinsic,
	extension: MetaMaskInpageProvider
): Promise<string> {
	const signViaEthWallet = async () =>
		new Promise((resolve, reject) => {
			extrinsic
				.signViaEthWallet(
					ethAddress,
					api,
					extension,
					(result: SubmittableResult) => {
						const { dispatchError, status } = result;
						if (dispatchError && dispatchError?.isModule) {
							const { index, error } = dispatchError.asModule.toJSON();
							return reject(new Error(`${index}${error}: Module error`));
						}
						if (status.isFinalized)
							return resolve(status.asFinalized.toString());
					}
				)
				.catch((error) => reject(error));
		});

	try {
		return await signViaEthWallet().then((status) => {
			console.info(`Transaction Block: ${status}`);
			return status as string;
		});
	} catch (error) {
		if (error?.code === 4001) return "cancelled";
		throw new Error(error?.message?.split?.(":")?.[1].trim());
	}
}
