import { useAssets } from "@refactor/providers/SupportedAssetsProvider";
import { DOMComponentProps } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import { IMaskInput } from "react-imask";
import { useCallback, useEffect, useMemo, useState } from "react";
import throttle from "lodash/throttle";
import useExchangeRate from "@refactor/hooks/useExchangeRate";
import Text from "@refactor/components/Text";

const bem = createBEMHelper(require("./AssetInput.module.scss"));

type ComponentProps = {
	assetId: number;
	focusOnInit?: boolean;
	disabled?: boolean;
};

export default function AssetInput({
	className,
	assetId,
	focusOnInit,
	min,
	disabled,
	...props
}: DOMComponentProps<ComponentProps, "input">) {
	const { getMinimumStep, displayAsset, findAsset } = useAssets();
	const asset = findAsset(assetId);
	const [step, scale] = getMinimumStep?.(assetId) || [1, 0];
	const [, symbol] = displayAsset(assetId, 0);
	const [, displayInCurrency] = useExchangeRate(asset.symbol);
	const [usdValue, setUSDValue] = useState<string>("$0.00");
	const [value, setValue] = useState<number>();

	const onInputReady = useCallback(
		(el) => {
			if (!focusOnInit) return;
			el?.focus?.();
		},
		[focusOnInit]
	);

	const throttledInputAccept = useMemo(() => throttle(setValue, 500), []);

	useEffect(() => {
		if (!value) return;
		setUSDValue(displayInCurrency(value));
	}, [displayInCurrency, value]);

	return (
		<div className={bem("root", className)}>
			<div className={bem("inner", { disabled })}>
				<IMaskInput
					className={bem("input")}
					mask={Number}
					type="number"
					radix="."
					min={min || step}
					step={step}
					scale={scale}
					{...props}
					inputRef={onInputReady}
					onAccept={throttledInputAccept}
					disabled={disabled}
				/>
				<span className={bem("symbol")}>{symbol}</span>
			</div>

			<Text variant="headline6" className={bem("usdValue")}>
				({usdValue} USD)
			</Text>
		</div>
	);
}
