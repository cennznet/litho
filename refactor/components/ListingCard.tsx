/* eslint-disable @next/next/no-img-element */
import {
	DOMComponentProps,
	NFTListing,
	CollectionTupple,
} from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import NFTRenderer from "@refactor/components/NFTRenderer";
import Text from "@refactor/components/Text";
import { useAssets } from "@refactor/providers/SupportedAssetsProvider";
import { useEffect, useMemo, useState } from "react";
import HourglassSVG from "@refactor/assets/vectors/hourglass.svg?inline";
import MoneySVG from "@refactor/assets/vectors/money.svg?inline";
import fetchListingItem from "@refactor/utils/fetchListingItem";
import { useCENNZApi } from "@refactor/providers/CENNZApiProvider";
import Link from "@refactor/components/Link";
import { useInView } from "react-hook-inview";

const bem = createBEMHelper(require("./ListingCard.module.scss"));

type ComponentProps = {
	listingId: number | CollectionTupple;
};

export default function ListingCard({
	className,
	listingId,
	...props
}: DOMComponentProps<ComponentProps, "a">) {
	const [item, setItem] = useState<NFTListing>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const api = useCENNZApi();

	const collectionId = Array.isArray(listingId) ? listingId[0] : null;

	const [ref, inView] = useInView({
		threshold: 0.5,
	});

	useEffect(() => {
		if (!api || !listingId || !inView) return;
		fetchListingItem(
			api,
			Array.isArray(listingId) ? listingId[1] : listingId
		).then((item) => {
			setItem(item);
			setLoading(false);
		});
	}, [api, listingId, inView]);

	const { token, price, paymentAssetId, type } = (item || {}) as NFTListing;
	const { displayAsset } = useAssets();
	const [listingPrice, symbol] = useMemo(() => {
		if (!displayAsset || !price || !paymentAssetId) return [];
		return displayAsset(paymentAssetId, price);
	}, [displayAsset, price, paymentAssetId]);

	if (!loading && !item) return null;

	return (
		<Link
			className={bem("root", { asStack: !!collectionId }, className)}
			{...props}
			href={
				!!collectionId
					? `/collection/${collectionId}`
					: !!token?.tokenId
					? `/nft/${token.tokenId.join("/")}`
					: null
			}
			title={token?.metadata?.name}>
			<div className={bem("inner")} ref={ref}>
				<div className={bem("media")}>
					{!!token && (
						<NFTRenderer
							className={bem("renderer")}
							url={token.metadata.image}
							extension={token.metadata.properties.extension}
							name={token.metadata.image}
						/>
					)}
				</div>
				<div className={bem("details", { loading })}>
					{!!token && (
						<Text
							variant="headline5"
							className={bem("name")}
							title={token.metadata.name}>
							{token.metadata.name}
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
					{!!type && (
						<div className={bem("listingType")}>
							{type === "Auction" && (
								<>
									<img
										src={HourglassSVG.src}
										className={bem("typeIcon")}
										alt="Auction"
									/>
									<span className={bem("typeLabel")}>Auction</span>
								</>
							)}

							{type === "Fixed Price" && (
								<>
									<img
										src={MoneySVG.src}
										className={bem("typeIcon")}
										alt="Fixed Price"
									/>
									<span className={bem("typeLabel")}>Fixed Price</span>
								</>
							)}
						</div>
					)}

					{!collectionId && !!token?.metadata?.properties?.quantity && (
						<div className={bem("listingQuantity")}>
							{`${token.tokenId[2] + 1} of ${
								token.metadata.properties.quantity
							}`}
						</div>
					)}
				</div>
			</div>
		</Link>
	);
}
