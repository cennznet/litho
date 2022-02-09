import { NFTId, AssetInfo, NFTListingType } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import { Props as ModalProps } from "react-modal";
import Modal from "@refactor/components/Modal";
import Text from "@refactor/components/Text";
import { useState, useCallback, useMemo } from "react";
import HourglassSVG from "@refactor/assets/vectors/hourglass.svg";
import MoneySVG from "@refactor/assets/vectors/money.svg";
import Dropdown from "@refactor/components/Dropdown";
import { useAssets } from "@refactor/providers/SupportedAssetsProvider";
import AssetInput from "./AssetInput";
import Button from "./Button";
import useAddressValidation from "@refactor/hooks/useAddressValidation";
import useNFTSell from "@refactor/hooks/useNFTSell";

const bem = createBEMHelper(require("./SellFlowModal.module.scss"));

type ComponentProps = { tokenId: NFTId } & Pick<
	ModalProps,
	"onRequestClose" | "isOpen" | "shouldCloseOnOverlayClick" | "shouldCloseOnEsc"
>;

export default function SellFlowModal({
	tokenId,
	onRequestClose,
	...props
}: ComponentProps) {
	const [listingType, setListingtype] = useState<NFTListingType>("Fixed Price");
	const onListingTypeChange = useCallback((event) => {
		setListingtype(event.target.value);
	}, []);
	const { assets, findAsset } = useAssets();
	const [asset, setAsset] = useState<AssetInfo>(assets?.[0]);
	const onDropdownChange = useCallback(
		(event) => {
			const asset = findAsset(parseInt(event.target.value, 10));
			setAsset(asset);
		},
		[findAsset]
	);

	const sellToken = useNFTSell();

	const [busy, setBusy] = useState<boolean>(false);

	const [minDate, maxDate] = useMemo(() => {
		const minDate = new Date();
		minDate.setDate(new Date().getDate() + 3);
		const maxDate = new Date(minDate.valueOf());
		maxDate.setFullYear(minDate.getFullYear() + 1);
		return [minDate, maxDate].map((date) => date.toISOString().split("T")[0]);
	}, []);

	const onFormSubmit = useCallback(
		async (event) => {
			event?.preventDefault?.();
			const formData = Array.from(new FormData(event.target)).reduce(
				(formData, [key, value]) => {
					switch (key) {
						case "price":
							formData[key] =
								parseInt(value as string, 10) * Math.pow(10, asset.decimals);
							break;
						case "closingDate":
							formData[key] = [
								"setHours",
								"setMinutes",
								"setSeconds",
								"setMilliseconds",
							].reduce((date, method) => {
								date[method](0);
								return date;
							}, new Date(value as string));
							break;
						default:
							formData[key] = value;
							break;
					}
					return formData;
				},
				{} as {
					price: number;
					closingDate: Date;
					buyer?: string;
					type: NFTListingType;
				}
			);

			setBusy(true);
			const status = await sellToken({
				...formData,
				tokenId,
				paymentAssetId: asset.assetId,
			});
			if (status === "cancelled") return setBusy(false);
			setBusy(false);
			onRequestClose?.(null);
		},
		[asset, tokenId, sellToken, onRequestClose]
	);

	const onAddressChange = useAddressValidation();

	return (
		<Modal
			{...props}
			className={bem("content")}
			innerClassName={bem("inner")}
			overlayClassName={bem("overlay")}
			shouldCloseOnEsc={!busy}
			shouldCloseOnOverlayClick={!busy}
			onRequestClose={onRequestClose}>
			<div className={bem("header")}>
				<Text variant="headline3">Sell on Marketplace</Text>
			</div>

			<div className={bem("body")}>
				<form className={bem("form")} onSubmit={onFormSubmit}>
					<div className={bem("field")}>
						<div className={bem("listingType")}>
							<input
								type="radio"
								name="type"
								value="Fixed Price"
								id="FixedPriceRadio"
								checked={listingType === "Fixed Price"}
								onChange={onListingTypeChange}
								disabled={busy}
							/>
							<label htmlFor="FixedPriceRadio">
								<i>
									<MoneySVG />
								</i>
								Fixed Price
							</label>
						</div>

						<div className={bem("spacer")} />

						<div className={bem("listingType")}>
							<input
								type="radio"
								name="type"
								value="Auction"
								id="AuctionRadio"
								checked={listingType === "Auction"}
								onChange={onListingTypeChange}
								disabled={busy}
							/>
							<label htmlFor="AuctionRadio">
								<i>
									<HourglassSVG />
								</i>
								Timed Auction
							</label>
						</div>
					</div>

					<div className={bem("field")}>
						<div className={bem("input")}>
							<label htmlFor="TokenDropdown">Token</label>
							<Dropdown
								id="TokenDropdown"
								className={bem("tokenDropdown")}
								defaultLabel={assets?.[0]?.symbol}
								defaultValue={assets?.[0]?.assetId}
								value={asset?.assetId}
								onChange={onDropdownChange}
								disabled={busy}>
								{assets.map((asset) => (
									<option key={asset.assetId} value={asset.assetId}>
										{asset.symbol}
									</option>
								))}
							</Dropdown>
						</div>
					</div>

					<div className={bem("field")}>
						<div className={bem("input")}>
							<label htmlFor="PriceInput">
								{listingType === "Auction" ? "Reserve Price" : "Selling Price"}
							</label>

							<AssetInput
								name="price"
								required={true}
								placeholder={`Enter your ${
									listingType === "Auction" ? "reserve price" : "selling price"
								}`}
								focusOnInit={true}
								assetId={asset?.assetId}
								disabled={busy}
							/>
						</div>
					</div>

					<div className={bem("field")}>
						<div className={bem("input")}>
							<label htmlFor="DateInput">Closing Date</label>
							<input
								type="date"
								className={bem("textInput")}
								name="closingDate"
								id="DateInput"
								defaultValue={minDate}
								min={minDate}
								max={maxDate}
								required
								disabled={busy}
							/>
							<div className={bem("inputNote")}>
								By default, the listing will be closed in 3 days
							</div>
						</div>
					</div>

					{listingType === "Fixed Price" && (
						<div className={bem("field")}>
							<div className={bem("input")}>
								<label htmlFor="BuyerInput">Specific Buyer (optional)</label>
								<input
									type="text"
									className={bem("textInput")}
									name="buyer"
									onChange={onAddressChange}
									id="BuyerInput"
									placeholder="Enter a specific address that's allowed to buy"
									disabled={busy}
								/>
							</div>
						</div>
					)}

					<div className={bem("field")}>
						<div className={bem("input")}>
							<Button
								type="submit"
								className={bem("submitInput")}
								disabled={busy}
								showProgress={true}>
								{busy ? "Processing" : "Submit"}
							</Button>
						</div>
					</div>
				</form>
			</div>
		</Modal>
	);
}
