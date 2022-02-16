import { Signer, SubmittableExtrinsic } from "@polkadot/api/types";

export default async function signAndSend(
	extrinsic: SubmittableExtrinsic<"promise", any>,
	address: string,
	signer: Signer
): Promise<string> {
	const signAndSend = async () => {
		return new Promise((resolve, reject) => {
			extrinsic
				.signAndSend(address, { signer }, (progress) => {
					const { dispatchError, status } = progress?.toHuman?.() || {};
					if (dispatchError?.Module) return reject(dispatchError.Module);
					if (status?.InBlock) return resolve(status.InBlock);
				})
				.catch((error) => reject(error));
		});
	};

	try {
		return await signAndSend().then((status) => {
			console.info(`Transaction Block: ${status}`);
			return status as string;
		});
	} catch (error) {
		if (error?.message === "Cancelled") return "cancelled";
		const err = new Error(
			"An error occured while sending your transaction request."
		);
		(err as any).code = error?.message?.split?.(":")?.[0];
		throw err;
	}
}
