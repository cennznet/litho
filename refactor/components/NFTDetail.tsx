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
import AccountAddress from "./AccountAddress";

const bem = createBEMHelper(require("./NFTDetail.module.scss"));

type ComponentProps = {
	listingItem: NFTData & Partial<NFTListing>;
};

export default function NFTDetail({
	className,
	listingItem,
	...props
}: DOMComponentProps<ComponentProps, "div">) {
	const { metadata, tokenId, listingId, attributes } = listingItem;

	return (
		<div className={bem("root", className)} {...props}>
			<div className={bem("display")}>
				<div className={bem("header")}>
					<Text variant="headline2">{metadata.name}</Text>
				</div>
				<div className={bem("body")}>
					<NFTRenderer
						className={bem("renderer")}
						name={metadata.name}
						url={metadata.image}
						extension={metadata.properties.extension}
					/>
					<span className={bem("listingQuantity")}>
						({`${tokenId[2] + 1} of ${metadata.properties.quantity}`})
					</span>
				</div>
			</div>

			<div className={bem("sidebar")}>
				<div className={bem("sidebarContent")}>
					<div className={bem("scrollContent")}>
						{!!listingId && <BuySection listingItem={listingItem} />}
						<SellSection listingItem={listingItem} />
						<DescriptionSection listingItem={listingItem} />
						{!!attributes?.length && (
							<DetailsSection listingItem={listingItem} />
						)}
					</div>
				</div>
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
	const {
		owner,
		metadata: {
			properties: { creator },
		},
		royalty,
	} = listingItem;

	return (
		<div className={bem("sellSection")}>
			<dl className={bem("address")}>
				<dt>Owner</dt>
				<dd>
					<AccountAddress address={owner} length={8} />
				</dd>
			</dl>

			<dl className={bem("address")}>
				<dt>Creator</dt>
				<dd>
					<AccountAddress address={creator} length={8} />
					{!!royalty && <em>({royalty / 10000}% royalties)</em>}
				</dd>
			</dl>
		</div>
	);
}

function DescriptionSection({
	listingItem,
}: DOMComponentProps<ComponentProps, "div">) {
	const {
		metadata: { description },
	} = listingItem;

	return (
		<div className={bem("descriptionSection")}>
			<dl className={bem("description")}>
				<dt>Description</dt>
				<dd>{description}</dd>
			</dl>
		</div>
	);
}

function DetailsSection({
	listingItem,
}: DOMComponentProps<ComponentProps, "div">) {
	const { attributes } = listingItem;

	return (
		<div className={bem("detailsSection")}>
			<Text variant="headline6" className={bem("detailsHeadline")}>
				Attributes
			</Text>
			{attributes.map((attribute, index) => {
				const key = Object.keys(attribute)?.[0];
				const value = Object.values(attribute)?.[0];

				return (
					<dl className={bem("attribute")} key={index}>
						<dt>{key === "Text" ? "#" : key}</dt>
						<dd>{value}</dd>
					</dl>
				);
			})}
		</div>
	);
}
