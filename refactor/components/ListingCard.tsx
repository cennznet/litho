/* eslint-disable @next/next/no-img-element */
import { DOMComponentProps, NFTListing } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import NFTRenderer from "@refactor/components/NFTRenderer";
import Text from "@refactor/components/Text";
import { useAssets } from "@refactor/providers/SupportedAssetsProvider";
import { useMemo } from "react";
import HourglassSVG from "@refactor/assets/vectors/hourglass.svg?inline";
import MoneySVG from "@refactor/assets/vectors/money.svg?inline";

const bem = createBEMHelper(require("./ListingCard.module.scss"));

type ComponentProps = {
	value: NFTListing;
};

export default function ListingCard({
	className,
	value,
	...props
}: DOMComponentProps<ComponentProps, "div">) {
	const { token, price, paymentAssetId, type } = value;
	const { displayAsset } = useAssets();
	const [listingPrice, symbol] = useMemo(() => {
		if (!displayAsset) return [];
		return displayAsset(paymentAssetId, price);
	}, [displayAsset, price, paymentAssetId]);

	return (
		<div className={bem("root", className)} {...props}>
			<div className={bem("renderer")}>
				<NFTRenderer value={token} />
			</div>
			<div className={bem("details")}>
				<Text
					variant="headline5"
					className={bem("name")}
					title={token.metadata.name}>
					{token.metadata.name}
				</Text>

				{listingPrice && (
					<div className={bem("price")}>
						<span className={bem("priceValue")}>{listingPrice}</span>
						<span className={bem("priceSymbol")}>{symbol}</span>
					</div>
				)}
			</div>
			<div className={bem("state")}>
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
			</div>
		</div>
	);
}
