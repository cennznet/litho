import { NFTId, NFTListingType } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import { Props as ModalProps } from "react-modal";
import Modal from "@refactor/components/Modal";
import Text from "@refactor/components/Text";
import { useState, useCallback } from "react";
import HourglassSVG from "@refactor/assets/vectors/hourglass.svg";
import MoneySVG from "@refactor/assets/vectors/money.svg";

const bem = createBEMHelper(require("./SellFlowModal.module.scss"));

type ComponentProps = { tokenId: NFTId } & Pick<
	ModalProps,
	"onRequestClose" | "isOpen" | "shouldCloseOnOverlayClick" | "shouldCloseOnEsc"
>;

export default function SellFlowModal({ tokenId, ...props }: ComponentProps) {
	const [listingType, setListingtype] = useState<NFTListingType>("Fixed Price");
	const onListingTypeChange = useCallback((event) => {
		setListingtype(event.target.value);
	}, []);

	return (
		<Modal
			{...props}
			className={bem("content")}
			innerClassName={bem("inner")}
			overlayClassName={bem("overlay")}>
			<div className={bem("header")}>
				<Text variant="headline3">Sell on Marketplace</Text>
			</div>

			<div className={bem("body")}>
				<form className={bem("form")}>
					<div className={bem("row")}>
						<div className={bem("listingType")}>
							<input
								type="radio"
								name="type"
								value="Fixed Price"
								id="FixedPriceRadio"
								checked={listingType === "Fixed Price"}
								onChange={onListingTypeChange}
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
							/>
							<label htmlFor="AuctionRadio">
								<i>
									<HourglassSVG />
								</i>
								Timed Auction
							</label>
						</div>
					</div>
				</form>
			</div>
		</Modal>
	);
}
