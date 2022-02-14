import { useCallback } from "react";

type PinataResponse = {
	IpfsHash: string;
	PinSize: number;
	Timestamp: string;
	isDuplicated: boolean;
};

export default function usePinataIPFS(): {
	pinFile: (file: Blob) => Promise<PinataResponse>;
	pinMetadata: (
		metadata: { [key: string]: any },
		repeats?: number
	) => Promise<PinataResponse>;
} {
	const pinataEndpoint = process.env.NEXT_PUBLIC_PINATA_PIN_ENDPOINT;
	const pinataJWT = process.env.NEXT_PUBLIC_PINATA_JWT;

	const pinFile = useCallback(
		async (file) => {
			const data = new FormData();
			data.append("file", file);
			return fetch(`${pinataEndpoint}/pinning/pinFileToIPFS`, {
				method: "POST",
				body: data,
				headers: {
					Authorization: `Bearer ${pinataJWT}`,
				},
			}).then((response) => response.json());
		},
		[pinataEndpoint, pinataJWT]
	);

	const pinMetadata = useCallback(
		async (metadata: { [key: string]: any }, repeats: number = 1) => {
			const data = new FormData();
			new Array(repeats).fill(null).map((noop, index) =>
				data.append(
					"file",
					new Blob([JSON.stringify({ ...metadata, serial_number: index })], {
						type: "application/json",
					}),
					`nft/${index}.json`
				)
			);

			return fetch(`${pinataEndpoint}/pinning/pinFileToIPFS`, {
				method: "POST",
				body: data,
				headers: {
					Authorization: `Bearer ${pinataJWT}`,
				},
			}).then((response) => response.json());
		},
		[pinataEndpoint, pinataJWT]
	);

	return { pinFile, pinMetadata };
}
