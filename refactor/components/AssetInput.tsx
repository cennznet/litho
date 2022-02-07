import { useAssets } from "@refactor/providers/SupportedAssetsProvider";
import { DOMComponentProps } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import { IMaskInput } from "react-imask";
import { useCallback, useMemo, useState } from "react";
import throttle from "lodash/throttle";
import useCoinGeckoRate from "@refactor/hooks/useCoinGeckoRate";
import Text from "@refactor/components/Text";

const bem = createBEMHelper(require("./AssetInput.module.scss"));

type ComponentProps = {
	assetId: number;
	focusOnInit: boolean;
};

export default function AssetInput({
	className,
	assetId,
	focusOnInit,
	...props
}: DOMComponentProps<ComponentProps, "input">) {
	const { getMinimumStep, displayAsset } = useAssets();
	const [step, scale] = getMinimumStep?.(assetId) || [1, 0];
	const [, symbol] = displayAsset(assetId, 0);
	const [, displayInCurrency] = useCoinGeckoRate("usd");
	const [usdValue, setUSDValue] = useState<string>();

	const onInputReady = useCallback(
		(el) => {
			if (!focusOnInit) return;
			el?.focus?.();
		},
		[focusOnInit]
	);

	const throttledInputAccept = useMemo(
		() =>
			throttle((value: number) => {
				setUSDValue(displayInCurrency(value));
			}, 500),
		[displayInCurrency]
	);

	return (
		<div className={bem("root", className)}>
			<div className={bem("inner")}>
				<IMaskInput
					className={bem("input")}
					mask={Number}
					type="number"
					radix="."
					step={step}
					scale={scale}
					{...props}
					inputRef={onInputReady}
					onAccept={throttledInputAccept}
				/>
				<span className={bem("symbol")}>{symbol}</span>
			</div>

			{!!usdValue && (
				<Text variant="headline6" className={bem("usdValue")}>
					({usdValue} USD)
				</Text>
			)}
		</div>
	);
}
