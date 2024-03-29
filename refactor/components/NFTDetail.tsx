/* eslint-disable @next/next/no-img-element */
import { DOMComponentProps, NFTData, NFTListing } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import Text from "@refactor/components/Text";
import NFTRenderer from "@refactor/components/NFTRenderer";
import HourglassSVG from "@refactor/assets/vectors/hourglass.svg?inline";
import MoneySVG from "@refactor/assets/vectors/money.svg?inline";
import { useAssets } from "@refactor/providers/SupportedAssetsProvider";
import { useCallback, useEffect } from "react";
import useExchangeRate from "@refactor/hooks/useExchangeRate";
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
import useNFTListing from "@refactor/hooks/useNFTListing";
import isFinite from "lodash/isFinite";
import parseDescriptionForViewStoryLink from "@refactor/utils/parseDescriptionForViewStoryLink";
import useSelectedAccount from "@refactor/hooks/useSelectedAccount";
import { useWalletProvider } from "@refactor/providers/WalletProvider";
import useCENNZBalances from "@refactor/hooks/useCENNZBalances";

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
	const { updateCENNZBalances } = useCENNZBalances();
	const { item, fetchByListingId, fetchByTokenId } = useNFTListing(listingItem);

	const onActionComplete = useCallback(
		async (action) => {
			switch (action) {
				case "cancel":
				case "buy":
					await fetchByTokenId(item.tokenId);
					void updateCENNZBalances();
					break;

				case "bid":
					await fetchByListingId(item.listingId);
					break;

				case "sell":
					await fetchByTokenId(item.tokenId);
					break;
				default:
					break;
			}
		},
		[item, fetchByTokenId, fetchByListingId, updateCENNZBalances]
	);

	useEffect(() => {
		if (!item?.tokenId || !fetchByTokenId) return;
		fetchByTokenId(item.tokenId);
	}, [item?.tokenId, fetchByTokenId]);

	const { metadata, tokenId, attributes, imageIPFSUrl } = item || {};

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
					<div className={bem("info")}>
						<div className={bem("listingQuantity")}>
							({`${tokenId[2] + 1} of ${metadata.properties.quantity}`})
						</div>
					</div>
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
		buyer,
		metadata,
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

	const [, displayInCurrency] = useExchangeRate(symbol);
	const usdPrice = listingPrice ? displayInCurrency(listingPrice) : null;

	const endTime = useEndTime(closeBlock);

	const { cennzBalances } = useWalletProvider();
	const { checkSufficientFund } = useCENNZBalances();
	const selectedAccount = useSelectedAccount();
	const isOwner = selectedAccount?.address === owner;
	const isSufficientFund = paymentAssetId
		? checkSufficientFund(latestPrice, paymentAssetId)
		: false;

	useEffect(() => {
		fetchWiningBid();
	}, [listingItem, fetchWiningBid]);

	if (!!selectedAccount && !isFinite(listingId) && !isOwner) return null;

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
								alt={!!buyer ? "Private Sale" : "Fixed Price"}
							/>
							<span className={bem("stateLabel")}>
								{!!buyer ? "Private Sale" : type}
							</span>
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
				if (!selectedAccount)
					return <ConnectAction className={bem("action")} />;

				if (!isFinite(listingId)) {
					if (isOwner)
						return (
							<SellAction
								className={bem("action")}
								tokenId={tokenId}
								onActionComplete={onActionComplete}
							/>
						);
				}

				if (isFinite(listingId)) {
					if (isOwner)
						return (
							<RemoveAction
								className={bem("action")}
								listingId={listingId}
								onActionComplete={onActionComplete}
								disabled={!!latestWinningBid?.[1]}
							/>
						);

					if (!isSufficientFund && !!cennzBalances)
						return (
							<TopUpAction
								type={type}
								buyerAddress={buyer}
								className={bem("action")}
							/>
						);

					if (type === "Fixed Price")
						return (
							<BuyAction
								className={bem("action")}
								onActionComplete={onActionComplete}
								listingId={listingId}
								nftName={`${metadata.name} #${tokenId[2]}`}
								buyerAddress={buyer}
							/>
						);

					if (type === "Auction")
						return (
							<BidAction
								className={bem("action")}
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

			{!isNaN(royalty) && (
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

	const [start, link, end] = parseDescriptionForViewStoryLink(description);

	return (
		<div className={bem("descriptionSection")}>
			<dl className={bem("description")}>
				<dt>Description</dt>
				<dd>
					<pre>
						{start}{" "}
						{!!link && (
							<>
								<Link href={link}>here</Link>.
							</>
						)}{" "}
						{end}
					</pre>
				</dd>
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
