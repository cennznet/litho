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

const bem = createBEMHelper(require("./NFTDetail.module.scss"));

type ComponentProps = {
	listingItem: NFTListing & NFTData;
};

export default function NFTDetail({
	className,
	listingItem,
	...props
}: DOMComponentProps<ComponentProps, "div">) {
	const { metadata, tokenId, type, price, paymentAssetId } = listingItem;

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
				<div className={bem("action")}>
					<ul className={bem("state")}>
						<li className={bem("listingType")}>
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
						</li>
					</ul>

					<div className={bem("price")}>
						<div className={bem("priceValue")}>
							{listingPrice} {symbol}
						</div>

						{usdPrice && (
							<div className={bem("priceConversion")}>({usdPrice} USD)</div>
						)}
					</div>

					<Button className={bem("submitButton")}>
						{type === "Fixed Price" && <span>Buy now</span>}
					</Button>
				</div>

				<div className={bem("connection")}></div>
				<div className={bem("description")}></div>
				<div className={bem("details")}></div>
			</div>
		</div>
	);
}
