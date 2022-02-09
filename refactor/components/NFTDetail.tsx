/* eslint-disable @next/next/no-img-element */
import { DOMComponentProps, NFTData, NFTListing } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import Text from "@refactor/components/Text";
import NFTRenderer from "@refactor/components/NFTRenderer";
import HourglassSVG from "@refactor/assets/vectors/hourglass.svg?inline";
import MoneySVG from "@refactor/assets/vectors/money.svg?inline";
import { useAssets } from "@refactor/providers/SupportedAssetsProvider";
import { useCallback, useEffect, useMemo, useState } from "react";
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
	RemoveAction,
	SellAction,
	ConnectAction,
	TopUpAction,
} from "@refactor/components/ListingAction";
import { useWallet } from "@refactor/providers/SupportedWalletProvider";
import { useCENNZApi } from "@refactor/providers/CENNZApiProvider";
import fetchNFTData from "@refactor/utils/fetchNFTData";
import findListingIdByTokenId from "@refactor/utils/findListingIdByTokenId";
import fetchListingItem from "@refactor/utils/fetchListingItem";

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
					}, 0);

				case "bid":
					setTimeout(() => {
						setItem({ ...item });
					}, 0);
					break;

				case "sell":
					(async () => {
						const listingId = await findListingIdByTokenId(api, item.tokenId);
						const listing = await fetchListingItem(api, listingId);
						const data = listing
							? await fetchNFTData(api, listing.tokenId)
							: null;

						setItem(data?.metadata ? { ...listing, ...data } : null);
					})();
					break;
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
	const {
		type,
		price,
		paymentAssetId,
		closeBlock,
		listingId,
		owner,
		tokenId,
		winningBid,
	} = listingItem;

	const [latestWinningBid, fetchWiningBid] = useWinningBid(
		type === "Auction" ? listingId : null,
		winningBid
	);
	const latestPrice =
		(latestWinningBid?.[1] || 0) > price ? latestWinningBid?.[1] : price;
	const { displayAsset } = useAssets();
	const [listingPrice, symbol] = paymentAssetId
		? displayAsset(paymentAssetId, latestPrice)
		: [];

	const [, displayInCurrency] = useCoinGeckoRate("usd");
	const usdPrice = listingPrice ? displayInCurrency(listingPrice) : null;

	const endTime = useEndTime(closeBlock);

	const { account, balances, checkSufficientFund } = useWallet();
	const isOwner = account?.address === owner;
	const isSufficientFund = paymentAssetId
		? checkSufficientFund(latestPrice, paymentAssetId)
		: false;

	useEffect(() => {
		fetchWiningBid();
	}, [listingItem, fetchWiningBid]);

	if (!!account && !listingId && !isOwner) return null;

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

					{!!latestWinningBid?.[1] && (
						<li>
							<div className={bem("stateType")}>
								<span className={bem("stateLabel")}>Highest Bidder</span>
							</div>
							<div className={bem("stateLabel")}>
								<AccountAddress address={latestWinningBid[0]} length={6} />
							</div>
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

			{(() => {
				if (!account) return <ConnectAction />;

				if (!listingId) {
					if (isOwner)
						return (
							<SellAction
								tokenId={tokenId}
								onActionComplete={onActionComplete}
							/>
						);
				}

				if (!!listingId) {
					if (isOwner)
						return (
							<RemoveAction
								listingId={listingId}
								onActionComplete={onActionComplete}
								disabled={!!latestWinningBid?.[1]}
							/>
						);

					if (!isSufficientFund && !!balances)
						return <TopUpAction type={type} />;

					if (type === "Fixed Price")
						return (
							<BuyAction
								onActionComplete={onActionComplete}
								listingId={listingId}
							/>
						);

					if (type === "Auction")
						return (
							<BidAction
								listingId={listingId}
								currentBid={listingPrice}
								paymentAssetId={paymentAssetId}
								onActionComplete={onActionComplete}
							/>
						);
				}
			})()}
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
					<AccountAddress address={owner} length={6} />
				</dd>
			</dl>
			<dl className={bem("address")}>
				<dt>Creator</dt>
				<dd>
					<AccountAddress address={creator} length={6} />
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
