import { useCENNZApi } from "@refactor/providers/CENNZApiProvider";
import { useCallback, useState } from "react";
import isFinite from "lodash/isFinite";

type BidOwner = string;
type BidValue = number;
type BidTuple = [BidOwner, BidValue];

export default function useWinningBid(
	listingId: number,
	defaultValue = null
): [BidTuple, () => Promise<void>] {
	const api = useCENNZApi();
	const [winningBid, setWinningBid] = useState<BidTuple>(defaultValue);

	const fetchWinningBid = useCallback(async () => {
		if (!api || !isFinite(listingId)) return;
		const bid = ((await api.query.nft.listingWinningBid(listingId)) as any)
			.unwrapOrDefault()
			.toJSON() as BidTuple;

		setWinningBid(bid);
	}, [api, listingId]);

	return [winningBid, fetchWinningBid];
}
