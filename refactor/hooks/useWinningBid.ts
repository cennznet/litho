import { useCENNZApi } from "@refactor/providers/CENNZApiProvider";
import { useEffect, useState } from "react";

type BidOwner = string;
type BidValue = number;
type BidTuple = [BidOwner, BidValue];

export default function useWinningBid(listingId: number): BidTuple {
	const api = useCENNZApi();
	const [winningBid, setWinningBid] = useState<BidTuple>();

	useEffect(() => {
		if (!api || !listingId) return;
		async function fetchWinningBid(listingId) {
			const bid = ((await api.query.nft.listingWinningBid(listingId)) as any)
				.unwrapOrDefault()
				.toJSON() as BidTuple;

			console.log(bid);
			setWinningBid(bid);
		}

		fetchWinningBid(listingId);
	}, [api, listingId]);

	return winningBid;
}
