import {
	DOMComponentProps,
	NFTListingId,
	NFTId,
	NFTListingType,
	NFTListing,
} from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import Button from "@refactor/components/Button";
import { useCallback, useState, useRef } from "react";
import useNFTCancel from "@refactor/hooks/useNFTCancel";
import useNFTBuy from "@refactor/hooks/useNFTBuy";
import useNFTBid from "@refactor/hooks/useNFTBid";
import Link from "@refactor/components/Link";
import { useWallet } from "@refactor/providers/SupportedWalletProvider";
import Text from "@refactor/components/Text";
import AssetInput from "@refactor/components/AssetInput";
import { useAssets } from "@refactor/providers/SupportedAssetsProvider";

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

type BidComponentProps = {
	currentBid: number;
	paymentAssetId: number;
	onActionComplete?: (action: string) => void;
};
export function BidAction({
	currentBid,
	paymentAssetId,
	onActionComplete,
}: DOMComponentProps<BidComponentProps, "div">) {
	const [showInput, setShowInput] = useState<boolean>(false);
	const onPlaceBidClick = useCallback(() => {
		setShowInput((showInput) => !showInput);
	}, []);

	const onCancelClick = useCallback(() => {
		setShowInput(false);
	}, []);
	const { getMinimumStep } = useAssets();
	const [step] = getMinimumStep?.(paymentAssetId) || [1];
	const minimumBid = currentBid + step;

	return (
		<>
			{!showInput && (
				<div className={bem("bidAction")}>
					<Button className={bem("actionButton")} onClick={onPlaceBidClick}>
						Place A Bid
					</Button>
				</div>
			)}

			{showInput && (
				<form className={bem("form")}>
					<Text variant="headline5" className={bem("formHeadline")}>
						Enter a bid
					</Text>

					<AssetInput
						assetId={paymentAssetId}
						min={minimumBid}
						placeholder={`Minimum bid of ${minimumBid}`}
						className={bem("formInput")}
						focusOnInit={true}
					/>

					<div className={bem("formActions")}>
						<Button
							className={bem("cancelButton")}
							variant="hollow"
							onClick={onCancelClick}
							showProgress={false}>
							Cancel
						</Button>

						<Button className={bem("bidButton")} type="submit">
							Confirm Bid
						</Button>
					</div>
				</form>
			)}
		</>
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
		<div className={bem("cancelAction")}>
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
		<div className={bem("sellAction")}>
			<Link
				href={`/sell?collectionId=${tokenId[0]}&seriesId=${tokenId[1]}&serialNumber=${tokenId[2]}`}>
				<Button className={bem("actionButton")}>Start Listing</Button>
			</Link>
		</div>
	);
}

type ConnectComponentProps = {};
export function ConnectAction({}: DOMComponentProps<
	ConnectComponentProps,
	"div"
>) {
	const { connectWallet } = useWallet();
	const [busy, setBusy] = useState<boolean>(false);
	const onConnectClick = useCallback(() => {
		setBusy(true);
		connectWallet(() => setBusy(false));
	}, [connectWallet]);

	return (
		<div className={bem("connectAction")}>
			<Button
				className={bem("actionButton")}
				disabled={busy}
				onClick={onConnectClick}>
				Connect Wallet
			</Button>
		</div>
	);
}

type TopUpComponentProps = {
	type: NFTListingType;
};
export function TopUpAction({
	type,
}: DOMComponentProps<TopUpComponentProps, "div">) {
	return (
		<div className={bem("removeAction")}>
			<Link href="https://www.mexc.com">
				<Button className={bem("actionButton")}>
					{type === "Fixed Price" && "Top up to buy"}
					{type === "Auction" && "Top up to bid"}
				</Button>
			</Link>
		</div>
	);
}
