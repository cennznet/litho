import { SyntheticEvent, useCallback } from "react";
import isValidAddress from "@refactor/utils/isValidAddress";

export default function useAddressValidation(): (
	event: SyntheticEvent
) => void {
	const onInputChange = useCallback(
		(event: SyntheticEvent<HTMLInputElement, InputEvent>) => {
			const target = event.target as HTMLInputElement;
			const valid = isValidAddress(target.value);

			return target.setCustomValidity(
				valid ? "" : "Please fill in a valid CENNZnet address"
			);
		},
		[]
	);

	return onInputChange;
}
