/* eslint-disable @next/next/no-img-element */
import { DOMComponentProps, NFTData, NFTListing } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import Text from "@refactor/components/Text";
import NFTRenderer from "@refactor/components/NFTRenderer";
import HourglassSVG from "@refactor/assets/vectors/hourglass.svg?inline";
import MoneySVG from "@refactor/assets/vectors/money.svg?inline";
import { useAssets } from "@refactor/providers/SupportedAssetsProvider";
import { useCallback, useMemo, useState } from "react";
import useCoinGeckoRate from "@refactor/hooks/useCoinGeckoRate";
import useEndTime, {
	getFriendlyEndTimeString,
} from "@refactor/hooks/useEndTime";
import useWinningBid from "@refactor/hooks/useWinningBid";
import AccountAddress from "@refactor/components/AccountAddress";
import Link from "@refactor/components/Link";
import {
	BuyAction,
	BidAction,
	CancelAction,
	SellAction,
} from "@refactor/components/ListingAction";
import { useWallet } from "@refactor/providers/SupportedWalletProvider";
import { useCENNZApi } from "@refactor/providers/CENNZApiProvider";
import fetchNFTData from "@refactor/utils/fetchNFTData";

const bem = createBEMHelper(require("./NFTDetail.module.scss"));

type NFTDetail = NFTData & Partial<NFTListing>;
type ComponentProps = {
	listingItem: NFTDetail;
};

export default function NFTDetail({
	className,
	listingItem,
	...props
}: DOMComponentProps<ComponentProps, "div">) {
	const api = useCENNZApi();
	const [item, setItem] = useState<NFTDetail>(listingItem);
	const { fetchAssetBalances } = useWallet();

	const onActionComplete = useCallback(
		async (action) => {
			switch (action) {
				case "cancel":
					const data = await fetchNFTData(api, item.tokenId);
					setItem({ tokenId: item.tokenId, ...data });
					break;
				case "buy":
					setTimeout(async () => {
						const data = await fetchNFTData(api, item.tokenId);
						setItem({ tokenId: item.tokenId, ...data });
						alert(
							`Congratulations! The NFT "${item?.metadata?.name}" is now yours.`
						);
						await fetchAssetBalances();
					}, api.consts.babe.expectedBlockTime.toNumber());

				default:
					break;
			}
		},
		[api, item, fetchAssetBalances]
	);

	const { metadata, tokenId, attributes, imageIPFSUrl } = item;

	return (
		<div className={bem("root", className)} {...props}>
			<div className={bem("display")}>
				<div className={bem("header")}>
					<Text variant="headline2">{metadata.name}</Text>
				</div>
				<div className={bem("body")}>
					<Link href={imageIPFSUrl} className={bem("renderer")}>
						<NFTRenderer
							name={metadata.name}
							url={metadata.image}
							extension={metadata.properties.extension}
						/>
					</Link>
					<span className={bem("listingQuantity")}>
						({`${tokenId[2] + 1} of ${metadata.properties.quantity}`})
					</span>
				</div>
			</div>

			<div className={bem("sidebar")}>
				<div className={bem("sidebarContent")}>
					<div className={bem("scrollContent")}>
						<ListingSection
							listingItem={item}
							onActionComplete={onActionComplete}
						/>
						<AssociationSection listingItem={item} />
						<DescriptionSection listingItem={item} />
						{!!attributes?.length && <DetailsSection listingItem={item} />}
					</div>
				</div>
			</div>
		</div>
	);
}

type ListingComponentProps = ComponentProps & {
	onActionComplete?: (action: string) => void;
};

function ListingSection({
	listingItem,
	onActionComplete,
}: DOMComponentProps<ListingComponentProps, "div">) {
	const { type, price, paymentAssetId, closeBlock, listingId, owner, tokenId } =
		listingItem;

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

	const { account } = useWallet();
	const isOwner = account?.address === owner;

	if (!listingId && !isOwner) return null;

	return (
		<div className={bem("listing")}>
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
			{!!listingPrice && (
				<div className={bem("price")}>
					<div className={bem("priceValue")}>
						{listingPrice} {symbol}
					</div>

					{usdPrice && (
						<div className={bem("priceConversion")}>({usdPrice} USD)</div>
					)}
				</div>
			)}

			{!!account && isOwner && !!listingId && (
				<CancelAction
					listingId={listingId}
					onActionComplete={onActionComplete}
				/>
			)}

			{!!account && isOwner && !listingId && <SellAction tokenId={tokenId} />}

			{!!account && !isOwner && type === "Fixed Price" && (
				<BuyAction onActionComplete={onActionComplete} listingId={listingId} />
			)}
			{!!account && !isOwner && type === "Auction" && <BidAction />}
		</div>
	);
}

function AssociationSection({
	listingItem,
}: DOMComponentProps<ComponentProps, "div">) {
	const {
		owner,
		metadata: {
			properties: { creator },
		},
		royalty,
	} = listingItem;

	const { account } = useWallet();
	const isOwner = account?.address === owner;
	const isCreator = account?.address === creator;

	return (
		<div className={bem("association")}>
			<dl className={bem("address")}>
				<dt>Owner</dt>
				<dd>
					<AccountAddress address={owner} length={8} />
					{!!account && isOwner && <em>(You)</em>}
				</dd>
			</dl>
			<dl className={bem("address")}>
				<dt>Creator</dt>
				<dd>
					<AccountAddress address={creator} length={8} />
					{!!account && isCreator && <em>(You)</em>}
				</dd>
			</dl>

			{!!royalty && (
				<dl className={bem("address")}>
					<dt>Royalties</dt>
					<dd>{royalty / 10000}%</dd>
				</dl>
			)}
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
