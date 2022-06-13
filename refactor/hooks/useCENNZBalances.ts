import { useCallback } from "react";
import { useCENNZApi } from "@refactor/providers/CENNZApiProvider";
import { useWalletProvider } from "@refactor/providers/WalletProvider";
import useSelectedAccount from "@refactor/hooks/useSelectedAccount";
import { useAssets } from "@refactor/providers/SupportedAssetsProvider";

interface CENNZBalancesHook {
	updateCENNZBalances: () => void;
	checkSufficientFund: (
		requiredFund: number,
		paymentAssetId: number
	) => boolean;
}

export default function useCENNZBalances(): CENNZBalancesHook {
	const api = useCENNZApi();
	const { assets } = useAssets();
	const { cennzBalances, setCennzBalances } = useWalletProvider();

	const selectedAccount = useSelectedAccount();

	const updateCENNZBalances = useCallback(async () => {
		if (!assets || !api || !selectedAccount) return;

		const balances = (
			await api.query.genericAsset.freeBalance.multi(
				assets.map(({ assetId }) => [assetId, selectedAccount.address])
			)
		).map((balance, index) => {
			const asset = assets[index];
			return {
				...asset,
				rawValue: balance as any,
				value: (balance as any) / Math.pow(10, asset.decimals),
			};
		});

		setCennzBalances(balances);
	}, [assets, api, selectedAccount?.address]);

	const checkSufficientFund = useCallback(
		(requiredFund, paymentAssetId) => {
			if (!cennzBalances?.length) return;
			const balance = cennzBalances.find(
				(balance) => balance.assetId === paymentAssetId
			);
			if (!balance) throw new Error(`Asset "${paymentAssetId}" is not found`);

			return (balance.rawValue?.toJSON?.() as number) >= requiredFund;
		},
		[cennzBalances]
	);

	return { updateCENNZBalances, checkSufficientFund };
}
