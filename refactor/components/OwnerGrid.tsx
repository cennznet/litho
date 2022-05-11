import { useCENNZApi } from "@refactor/providers/CENNZApiProvider";
import { DOMComponentProps, NFTId, SortOrder } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import { useEffect, useState, useCallback } from "react";
import { NFTGrid } from "@refactor/components/ListingGrid";
import Text from "@refactor/components/Text";
import Dropdown from "@refactor/components/Dropdown";
import Button from "@refactor/components/Button";
import { useMintFlow } from "@refactor/providers/MintFlowProvider";
import useSelectedAccount from "@refactor/hooks/useSelectedAccount";
import useScrollToWallet from "@refactor/hooks/useScrollToWallet";

const bem = createBEMHelper(require("./OwnerGrid.module.scss"));

type ComponentProps = {};

const DEFAULT_STATE = new Array(4).fill(null);

export default function OwnerGrid({
	className,
	...props
}: DOMComponentProps<ComponentProps, "div">) {
	const selectedAccount = useSelectedAccount();
	const api = useCENNZApi();
	const [tokenIds, setTokenIds] = useState<Array<NFTId>>([...DEFAULT_STATE]);
	const [sortedTokenIds, setSortedTokenIds] = useState<Array<NFTId>>([
		...DEFAULT_STATE,
	]);
	const [sortOrder, setSortOrder] = useState<SortOrder>("DESC");
	const { startMinting } = useMintFlow();

	useEffect(() => {
		setTokenIds([...DEFAULT_STATE]);
	}, [selectedAccount?.address]);

	useEffect(() => {
		if (!api || !selectedAccount?.address) return;

		const address = selectedAccount.address;

		const fetchAllTokens = async function () {
			const tokenOwnerEntries = await api.query.nft.tokenOwner.entries();

			const tokenIds = tokenOwnerEntries
				.filter((entry) => entry[1].toString() === address)
				.map((entry) => {
					const token = entry[0].args;

					return [
						token[0][0].toNumber(),
						token[0][1].toNumber(),
						(token[1] as any).toNumber(),
					] as NFTId;
				});

			setTokenIds(tokenIds);
		};

		fetchAllTokens();
	}, [api, selectedAccount?.address]);

	useEffect(() => {
		if (!tokenIds?.length) return setSortedTokenIds([]);
		if (tokenIds[0] === null) return setSortedTokenIds([...tokenIds]);

		const sortedListingIds = [
			...tokenIds.sort((a: NFTId, b: NFTId) => {
				const multiplier: number = sortOrder === "ASC" ? 1 : -1;
				const diffBySeriesId: number = a[1] - b[1];
				if (diffBySeriesId !== 0) return multiplier * diffBySeriesId;
				const diffBySerialNumber: number = a[2] - b[2];
				return multiplier * diffBySerialNumber;
			}),
		];

		setSortedTokenIds(sortedListingIds as Array<NFTId>);
	}, [tokenIds, sortOrder]);

	const onDropdownChange = useCallback((event) => {
		setSortOrder(event.target.value);
	}, []);

	const [busy, setBusy] = useState<boolean>(false);
	const scrollToWallet = useScrollToWallet();

	const onConnectClick = () => {
		setBusy(true);
		scrollToWallet();
	};

	return (
		<div className={bem("root", className)} {...props}>
			{!!selectedAccount && (
				<NFTGrid tokenIds={sortedTokenIds}>
					<div className={bem("header")}>
						<Text variant="headline3">My NFTs</Text>

						{!!tokenIds?.length && tokenIds[0] !== null && (
							<Dropdown
								className={bem("sortDropdown")}
								defaultLabel="Newest First"
								defaultValue={sortOrder}
								value={sortOrder}
								onChange={onDropdownChange}>
								<option value="DESC">Newest First</option>
								<option value="ASC">Oldest First</option>
							</Dropdown>
						)}
					</div>

					{!tokenIds?.length && (
						<div className={bem("message")}>
							<Text variant="headline6" className={bem("headline")}>
								You don't have any NFTs yet.
							</Text>

							<Button className={bem("button")} onClick={startMinting}>
								Start Minting
							</Button>
						</div>
					)}
				</NFTGrid>
			)}

			{!selectedAccount && (
				<div className={bem("message")}>
					<Button
						className={bem("button")}
						disabled={busy}
						onClick={onConnectClick}>
						{busy ? "Connecting" : "Connect Wallet"}
					</Button>
				</div>
			)}
		</div>
	);
}
