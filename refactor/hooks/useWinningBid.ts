import { useCENNZApi } from "@refactor/providers/CENNZApiProvider";
import { useCallback, useState } from "react";

type BidOwner = string;
type BidValue = number;
type BidTuple = [BidOwner, BidValue];

export default function useWinningBid(
	listingId: number
): [BidTuple, () => Promise<void>] {
	const api = useCENNZApi();
	const [winningBid, setWinningBid] = useState<BidTuple>();

	const fetchWinningBid = useCallback(async () => {
		if (!api || !listingId) return;
		const bid = ((await api.query.nft.listingWinningBid(listingId)) as any)
			.unwrapOrDefault()
			.toJSON() as BidTuple;

		setWinningBid(bid);
	}, [api, listingId]);

	return [winningBid, fetchWinningBid];
}
