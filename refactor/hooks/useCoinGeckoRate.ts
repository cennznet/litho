import { useCallback, useEffect, useState } from "react";

export default function useCoinGeckoRate(
	to: string,
	from: string = "centrality"
): [number, (value: number) => string] {
	const [rate, setRate] = useState<number>();

	useEffect(() => {
		const coinGeckoUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${from}&vs_currencies=${to}`;
		async function fetchRate() {
			const response = await fetch(coinGeckoUrl).then((response) =>
				response.json()
			);

			setRate(response?.[from]?.[to]);
		}

		fetchRate();
	}, [from, to]);

	const displayInCurrency = useCallback(
		(value: number) => {
			if (!rate) return;
			const numberFormat = new Intl.NumberFormat("en-NZ", {
				style: "currency",
				currency: to,
				currencyDisplay: "narrowSymbol",
			});

			return numberFormat.format(value * rate);
		},
		[rate, to]
	);

	return [rate, displayInCurrency];
}
