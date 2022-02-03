/* eslint-disable @next/next/no-img-element */
import { DOMComponentProps, NFTData, NFTListing } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import Text from "@refactor/components/Text";
import NFTRenderer from "@refactor/components/NFTRenderer";
import HourglassSVG from "@refactor/assets/vectors/hourglass.svg?inline";
import MoneySVG from "@refactor/assets/vectors/money.svg?inline";
import { useAssets } from "@refactor/providers/SupportedAssetsProvider";
import { useMemo } from "react";
import Button from "@refactor/components/Button";
import useCoinGeckoRate from "@refactor/hooks/useCoinGeckoRate";
import useEndTime, {
	getFriendlyEndTimeString,
} from "@refactor/hooks/useEndTime";
import useWinningBid from "@refactor/hooks/useWinningBid";

const bem = createBEMHelper(require("./NFTDetail.module.scss"));

type ComponentProps = {
	listingItem: NFTData & Partial<NFTListing>;
};

export default function NFTDetail({
	className,
	listingItem,
	...props
}: DOMComponentProps<ComponentProps, "div">) {
	const { metadata, tokenId, listingId } = listingItem;

	console.log(tokenId);

	return (
		<div className={bem("root", className)} {...props}>
			<div className={bem("display")}>
				<div className={bem("header")}>
					<Text variant="headline2">
						{metadata.name}

						<span className={bem("listingQuantity")}>
							({`${tokenId[2] + 1} of ${metadata.properties.quantity}`})
						</span>
					</Text>
				</div>
				<div className={bem("body")}>
					<NFTRenderer
						className={bem("renderer")}
						name={metadata.name}
						url={metadata.image}
						extension={metadata.properties.extension}
					/>
				</div>
			</div>

			<div className={bem("sidebar")}>
				{!!listingId && <BuySection listingItem={listingItem} />}
				<SellSection listingItem={listingItem} />
				<DescriptionSection listingItem={listingItem} />
				<DetailsSection listingItem={listingItem} />
			</div>
		</div>
	);
}

function BuySection({ listingItem }: DOMComponentProps<ComponentProps, "div">) {
	const { type, price, paymentAssetId, closeBlock, listingId } = listingItem;

	const { displayAsset } = useAssets();
	const [listingPrice, symbol] = useMemo(() => {
		if (!displayAsset || !price || !paymentAssetId) return [];
		return displayAsset(paymentAssetId, price);
	}, [displayAsset, price, paymentAssetId]);
	const usdRate = useCoinGeckoRate("usd");
	const usdPrice = useMemo(() => {
		if (!usdRate) return;
		const numberFormat = new Intl.NumberFormat("en-NZ", {
			style: "currency",
			currency: "USD",
			currencyDisplay: "narrowSymbol",
		});

		return numberFormat.format(listingPrice * usdRate);
	}, [usdRate, listingPrice]);

	const endTime = useEndTime(closeBlock);
	const winningBid = useWinningBid(type === "Auction" ? listingId : null);
	const reserveMet = !!winningBid?.[1] && winningBid?.[1] >= price;

	return (
		<div className={bem("buySection")}>
			{type === "Auction" && (
				<ul className={bem("state")}>
					<li>
						<div className={bem("stateType")}>
							<img
								src={HourglassSVG.src}
								className={bem("typeIcon")}
								alt="Auction"
							/>
							<span className={bem("typeLabel")}>{type}</span>
						</div>

						{endTime && (
							<div className={bem("stateLabel")}>
								{getFriendlyEndTimeString(endTime)}
							</div>
						)}
					</li>
					{!!reserveMet && (
						<li>
							<div className={bem("stateType")}>Current Bid</div>
							<div className={bem("stateLabel")}>Reserve Met</div>
						</li>
					)}
				</ul>
			)}

			{type === "Fixed Price" && (
				<ul className={bem("state")}>
					<li>
						<div className={bem("stateType")}>
							<img
								src={MoneySVG.src}
								className={bem("typeIcon")}
								alt="Fixed Price"
							/>
							<span className={bem("stateLabel")}>{type}</span>
						</div>
					</li>
				</ul>
			)}

			<div className={bem("price")}>
				<div className={bem("priceValue")}>
					{listingPrice} {symbol}
				</div>

				{usdPrice && (
					<div className={bem("priceConversion")}>({usdPrice} USD)</div>
				)}
			</div>

			<Button className={bem("submitButton")}>
				{type === "Fixed Price" && <span>Buy Now</span>}
				{type === "Auction" && <span>Place A Bid</span>}
			</Button>
		</div>
	);
}

function SellSection({
	listingItem,
}: DOMComponentProps<ComponentProps, "div">) {
	return <div className={bem("sellSection")}></div>;
}

function DescriptionSection({
	listingItem,
}: DOMComponentProps<ComponentProps, "div">) {
	return <div className={bem("descriptionSection")}></div>;
}

function DetailsSection({
	listingItem,
}: DOMComponentProps<ComponentProps, "div">) {
	return <div className={bem("detailsSection")}></div>;
}
