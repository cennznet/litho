import { DOMComponentProps, NFTListingId, NFTId } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import Button from "@refactor/components/Button";
import { useCallback, useState } from "react";
import useNFTCancel from "@refactor/hooks/useNFTCancel";
import useNFTBuy from "@refactor/hooks/useNFTBuy";
import useNFTBid from "@refactor/hooks/useNFTBid";
import Link from "@refactor/components/Link";

const bem = createBEMHelper(require("./ListingAction.module.scss"));

type BuyComponentProps = {
	listingId: NFTListingId;
	onActionComplete?: (action: string) => void;
};
export function BuyAction({
	listingId,
	onActionComplete,
}: DOMComponentProps<BuyComponentProps, "div">) {
	const [busy, setBusy] = useState<boolean>(false);
	const buyListing = useNFTBuy();
	const onBuyClick = useCallback(async () => {
		const confirmed = confirm("Are you sure?");
		if (!confirmed) return;
		setBusy(true);
		await buyListing(listingId);
		onActionComplete?.("buy");
	}, [buyListing, listingId, onActionComplete]);

	return (
		<div className={bem("buyAction")}>
			<Button
				className={bem("actionButton")}
				onClick={onBuyClick}
				disabled={busy}>
				{busy ? "Processing" : "Buy Now"}
			</Button>
		</div>
	);
}

type BidComponentProps = {};
export function BidAction(props: DOMComponentProps<BidComponentProps, "div">) {
	return (
		<div className={bem("bidAction")}>
			<Button className={bem("actionButton")}>Place A Bid</Button>
		</div>
	);
}

type CancelComponentProps = {
	listingId: NFTListingId;
	onActionComplete?: (action: string) => void;
};
export function CancelAction({
	listingId,
	onActionComplete,
}: DOMComponentProps<CancelComponentProps, "div">) {
	const [busy, setBusy] = useState<boolean>(false);
	const cancelListing = useNFTCancel();
	const onCancelClick = useCallback(async () => {
		const confirmed = confirm("Are you sure?");
		if (!confirmed) return;
		setBusy(true);
		await cancelListing(listingId);
		onActionComplete?.("cancel");
	}, [cancelListing, listingId, onActionComplete]);

	return (
		<div className={bem("removeAction")}>
			<Button
				className={bem("actionButton")}
				disabled={busy}
				onClick={onCancelClick}>
				{busy ? "Processing" : "Cancel Listing"}
			</Button>
		</div>
	);
}

type SellComponentProps = {
	tokenId: NFTId;
};
export function SellAction({
	tokenId,
}: DOMComponentProps<SellComponentProps, "div">) {
	return (
		<div className={bem("removeAction")}>
			<Link
				href={`/sell?collectionId=${tokenId[0]}&seriesId=${tokenId[1]}&serialNumber=${tokenId[2]}`}>
				<Button className={bem("actionButton")}>Start Listing</Button>
			</Link>
		</div>
	);
}
