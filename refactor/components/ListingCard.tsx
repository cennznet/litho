/* eslint-disable @next/next/no-img-element */
import {
	DOMComponentProps,
	NFTListing,
	NFTListingTuple,
	NFTData,
} from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import NFTRenderer from "@refactor/components/NFTRenderer";
import Text from "@refactor/components/Text";
import { useAssets } from "@refactor/providers/SupportedAssetsProvider";
import { useEffect, useMemo, useState } from "react";
import HourglassSVG from "@refactor/assets/vectors/hourglass.svg?inline";
import MoneySVG from "@refactor/assets/vectors/money.svg?inline";
import fetchListingItem from "@refactor/utils/fetchListingItem";
import fetchNFTData from "@refactor/utils/fetchNFTData";
import { useCENNZApi } from "@refactor/providers/CENNZApiProvider";
import Link from "@refactor/components/Link";
import { useInView } from "react-hook-inview";

const bem = createBEMHelper(require("./ListingCard.module.scss"));

type ComponentProps = {
	listingId: number | NFTListingTuple;
};

export default function ListingCard({
	className,
	listingId,
	...props
}: DOMComponentProps<ComponentProps, "a">) {
	const [item, setItem] = useState<NFTListing & NFTData>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const api = useCENNZApi();

	const collectionId = Array.isArray(listingId) ? listingId[0] : null;

	const [ref, inView] = useInView({
		threshold: 0,
	});

	useEffect(() => {
		if (!api || !listingId || !inView) return;

		async function fetchListing() {
			const listing = await fetchListingItem(
				api,
				Array.isArray(listingId) ? listingId[1] : listingId
			);

			const data = await fetchNFTData(api, listing.tokenId);

			setItem(data?.metadata ? { ...listing, ...data } : null);
			setLoading(false);
		}

		fetchListing();
	}, [api, listingId, inView]);

	const { tokenId, metadata, price, paymentAssetId, type } = (item ||
		{}) as NFTListing & NFTData;
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
					{!!type && (
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
					)}

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
