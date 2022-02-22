import { useEffect, useState, useCallback } from "react";

export default function useExchangeRate(
	assetSymbol: string
): [number, (value: number) => string] {
	const [rate, setRate] = useState<number>();
	const pair = `${assetSymbol}_USDT`;

	useEffect(() => {
		const mexcApiUrl = `/api/exchangeRate?symbol=${pair}`;
		async function fetchRate() {
			const response = await fetch(mexcApiUrl).then((response) =>
				response.json()
			);
			setRate(Number(response?.last));
		}

		fetchRate();
	}, [pair]);

	const displayInCurrency = useCallback(
		(value: number) => {
			if (!rate) return;
			const numberFormat = new Intl.NumberFormat("en-NZ", {
				style: "currency",
				currency: "usd",
				currencyDisplay: "narrowSymbol",
			});

			return numberFormat.format(value * rate);
		},
		[rate]
	);

	return [rate, displayInCurrency];
}
