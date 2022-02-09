import { Signer, SubmittableExtrinsic } from "@polkadot/api/types";

export default async function signAndSend(
	extrinsic: SubmittableExtrinsic<"promise", any>,
	address: string,
	signer: Signer,
	timeout: number = 0
): Promise<string> {
	const signAndSend = async () => {
		return new Promise((resolve, reject) => {
			extrinsic.signAndSend(address, { signer }, (progress) => {
				const { dispatchError, status } = progress?.toHuman?.() || {};
				if (dispatchError?.Module) return reject(dispatchError.Module);
				if (status?.InBlock) return resolve(status.InBlock);
			});
		});
	};

	try {
		return await signAndSend().then((status) => {
			console.info(`Transaction Block: ${status}`);
			return new Promise((resolve) =>
				setTimeout(resolve.bind(null, status), timeout)
			);
		});
	} catch (error) {
		if (error?.message === "Cancelled") return "cancelled";
		if (error?.message) console.info(error?.message);
		console.error(`Transaction Error: ${JSON.stringify(error)}`);
		return "error";
	}
}
