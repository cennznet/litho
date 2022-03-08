import { useCallback } from "react";
import { NFTMetadata271 } from "@refactor/types";

type PinataResponse = {
	IpfsHash: string;
	PinSize: number;
	Timestamp: string;
	isDuplicated: boolean;
};

export default function usePinataIPFS(): {
	pinFile: (file: Blob) => Promise<PinataResponse>;
	pinMetadata: (
		metadata: NFTMetadata271,
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
			data.append(
				"file",
				new Blob([JSON.stringify(metadata)], {
					type: "application/json",
				}),
				"nft/metadata.json"
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
