import { DOMComponentProps } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import ChevronDownSVG from "@refactor/assets/vectors/chevron-down.svg";
import { useEffect, useState, useRef, useCallback } from "react";

const bem = createBEMHelper(require("./Dropdown.module.scss"));

type ComponentProps = {
	defaultLabel: string;
};

export default function Dropdown({
	className,
	defaultLabel,
	defaultValue,
	children,
	onChange,
	value,
	...props
}: DOMComponentProps<ComponentProps, "select">) {
	const ref = useRef<HTMLSelectElement>();
	const [selectedLabel, setSelectedLabel] = useState<string>(defaultLabel);

	const onSelectChange = useCallback(
		(event) => {
			if (!ref.current) return;
			const select: HTMLSelectElement = event.target;
			const selectedLabel = select.options[select.selectedIndex].innerText;

			setSelectedLabel(selectedLabel);
			if (onChange) onChange(event);
		},
		[onChange]
	);

	return (
		<div className={bem("root", className)}>
			<div className={bem("trigger")}>
				<span>{selectedLabel}</span>

				<span className={bem("chevron")}>
					<ChevronDownSVG />
				</span>
			</div>
			<select
				{...props}
				className={bem("select")}
				defaultValue={defaultValue}
				onChange={onSelectChange}
				ref={ref}>
				{children}
			</select>
		</div>
	);
}
