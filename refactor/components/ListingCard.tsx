/* eslint-disable @next/next/no-img-element */
import {
	DOMComponentProps,
	NFTListing,
	NFTListingTuple,
	NFTData,
	NFTId,
} from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import NFTRenderer from "@refactor/components/NFTRenderer";
import Text from "@refactor/components/Text";
import { useAssets } from "@refactor/providers/SupportedAssetsProvider";
import { useEffect, useMemo, useState } from "react";
import HourglassSVG from "@refactor/assets/vectors/hourglass.svg?inline";
import MoneySVG from "@refactor/assets/vectors/money.svg?inline";
import Link from "@refactor/components/Link";
import { useInView } from "react-hook-inview";
import useNFTListing, { useNFTData } from "@refactor/hooks/useNFTListing";
import findListingIdByTokenId from "@refactor/utils/findListingIdByTokenId";
import { useCENNZApi } from "@refactor/providers/CENNZApiProvider";
import fetchListingItem from "@refactor/utils/fetchListingItem";

const bem = createBEMHelper(require("./ListingCard.module.scss"));

type ComponentProps = {
	listingId: number | NFTListingTuple;
};

export default function ListingCard({
	className,
	listingId,
	...props
}: DOMComponentProps<ComponentProps, "a">) {
	const collectionId = Array.isArray(listingId) ? listingId[0] : null;
	const [ref, inView] = useInView({
		threshold: 0,
	});
	const [loading, setLoading] = useState<boolean>(true);
	const [item, fetchItem] = useNFTListing(
		Array.isArray(listingId) ? listingId[1] : listingId,
		{} as any
	);

	const firstInView = inView && !item?.metadata;

	useEffect(() => {
		if (!firstInView) return;
		fetchItem(() => setLoading(false));
	}, [firstInView, fetchItem]);

	const { tokenId, metadata, price, paymentAssetId, type, winningBid } =
		(item || {}) as NFTData & Partial<NFTListing>;
	const { displayAsset } = useAssets();
	const latestPrice = (winningBid?.[1] || 0) > price ? winningBid?.[1] : price;
	const [listingPrice, symbol] = useMemo(() => {
		if (!displayAsset || !latestPrice || !paymentAssetId) return [];
		return displayAsset(paymentAssetId, latestPrice);
	}, [displayAsset, latestPrice, paymentAssetId]);

	if (!loading && !item) return null;

	return (
		<Link
			className={bem("root", { asStack: !!collectionId }, className)}
			{...props}
			href={
				!!collectionId
					? `/collection/${collectionId}`
					: !!tokenId
					? `/nft/${tokenId.join("/")}`
					: null
			}
			title={metadata?.name}>
			<div className={bem("inner")} ref={ref}>
				<div className={bem("media")}>
					{!!tokenId && (
						<NFTRenderer
							className={bem("renderer")}
							url={metadata.image}
							extension={metadata.properties.extension}
							name={metadata.image}
						/>
					)}
				</div>
				<div className={bem("details", { loading })}>
					{!!tokenId && (
						<Text
							variant="headline5"
							className={bem("name")}
							title={metadata.name}>
							{metadata.name}
						</Text>
					)}

					{!!listingPrice && (
						<div className={bem("price")}>
							<span className={bem("priceValue")}>{listingPrice}</span>
							<span className={bem("priceSymbol")}>{symbol}</span>
						</div>
					)}
				</div>
				<div className={bem("state", { loading })}>
					<div className={bem("listingType")}>
						{type === "Auction" && (
							<>
								<img
									src={HourglassSVG.src}
									className={bem("typeIcon")}
									alt="Auction"
								/>
								<span className={bem("typeLabel")}>{type}</span>
							</>
						)}

						{type === "Fixed Price" && (
							<>
								<img
									src={MoneySVG.src}
									className={bem("typeIcon")}
									alt="Fixed Price"
								/>
								<span className={bem("typeLabel")}>{type}</span>
							</>
						)}
					</div>

					{!collectionId && !!metadata?.properties?.quantity && (
						<div className={bem("listingQuantity")}>
							({`${tokenId[2] + 1} of ${metadata.properties.quantity}`})
						</div>
					)}
				</div>
			</div>
		</Link>
	);
}

type NFTCardProps = {
	tokenId: NFTId;
};
export function NFTCard({
	className,
	tokenId,
	...props
}: DOMComponentProps<NFTCardProps, "a">) {
	const api = useCENNZApi();
	const [ref, inView] = useInView({
		threshold: 0,
	});
	const [loading, setLoading] = useState<boolean>(true);
	const [item, fetchNFTData] = useNFTData(tokenId);
	const [listing, setListing] = useState<NFTListing>({} as NFTListing);

	const firstInView = inView && !item?.metadata;

	useEffect(() => {
		if (!firstInView || !tokenId) return;
		const fetchItem = async function () {
			const listingId = await findListingIdByTokenId(api, tokenId);
			const listing = listingId ? await fetchListingItem(api, listingId) : {};

			setListing(listing as NFTListing);
			await fetchNFTData(() => setLoading(false));
		};

		fetchItem();
	}, [firstInView, fetchNFTData, api, tokenId]);

	const { metadata } = (item || {}) as NFTData;

	const { price, paymentAssetId, type, winningBid } = (listing ||
		{}) as NFTListing;
	const { displayAsset } = useAssets();
	const latestPrice = (winningBid?.[1] || 0) > price ? winningBid?.[1] : price;
	const [listingPrice, symbol] = useMemo(() => {
		if (!displayAsset || !latestPrice || !paymentAssetId) return [];
		return displayAsset(paymentAssetId, latestPrice);
	}, [displayAsset, latestPrice, paymentAssetId]);

	return (
		<Link
			className={bem("root", className)}
			{...props}
			href={tokenId ? `/nft/${tokenId.join("/")}` : null}
			title={metadata?.name}>
			<div className={bem("inner")} ref={ref}>
				<div className={bem("media")}>
					{!!metadata && (
						<NFTRenderer
							className={bem("renderer")}
							url={metadata.image}
							extension={metadata.properties.extension}
							name={metadata.image}
						/>
					)}
				</div>
				<div className={bem("details", { loading })}>
					{!!metadata && (
						<Text
							variant="headline5"
							className={bem("name")}
							title={metadata.name}>
							{metadata.name}
						</Text>
					)}

					{!!listingPrice && (
						<div className={bem("price")}>
							<span className={bem("priceValue")}>{listingPrice}</span>
							<span className={bem("priceSymbol")}>{symbol}</span>
						</div>
					)}
				</div>
				<div className={bem("state", { loading })}>
					<div className={bem("listingType")}>
						{type === "Auction" && (
							<>
								<img
									src={HourglassSVG.src}
									className={bem("typeIcon")}
									alt="Auction"
								/>
								<span className={bem("typeLabel")}>{type}</span>
							</>
						)}

						{type === "Fixed Price" && (
							<>
								<img
									src={MoneySVG.src}
									className={bem("typeIcon")}
									alt="Fixed Price"
								/>
								<span className={bem("typeLabel")}>{type}</span>
							</>
						)}
					</div>
					{!!tokenId && !!metadata?.properties?.quantity && (
						<div className={bem("listingQuantity")}>
							({`${tokenId[2] + 1} of ${metadata.properties.quantity}`})
						</div>
					)}
				</div>
			</div>
		</Link>
	);
}
