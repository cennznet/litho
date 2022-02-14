import { DOMComponentProps } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import Button from "@refactor/components/Button";
import { useCallback, useState } from "react";
import XSVG from "@refactor/assets/vectors/x.svg";

const bem = createBEMHelper(require("./AttributesList.module.scss"));

type ComponentProps = {
	max?: number;
};

export default function AttributesList({
	className,
	max = 16,
	...props
}: DOMComponentProps<ComponentProps, "div">) {
	const [items, setItems] = useState<Array<{ id: number }>>([]);

	const onAddClick = useCallback(() => {
		setItems((prev) => [...prev, { id: Date.now() }]);
	}, []);

	const onRemoveClick = useCallback((id) => {
		setItems((prev) => prev.filter((item) => item.id !== id));
	}, []);

	return (
		<div className={bem("root", className)} {...props}>
			<ul className={bem("list")}>
				{items.map(({ id }, index) => {
					return (
						<li key={id} className={bem("listItem")}>
							<input
								type="text"
								className={bem("textInput")}
								placeholder="Attribute Type"
								required
								name={`attributes[${index}}][trait_type]`}
							/>

							<input
								type="text"
								className={bem("textInput")}
								placeholder="Attribute Value"
								required
								name={`attributes[${index}}][value]`}
							/>

							<span
								className={bem("listItemRemove")}
								onClick={onRemoveClick.bind(null, id)}>
								<XSVG />
							</span>
						</li>
					);
				})}
			</ul>

			<Button
				variant="hollow"
				type="button"
				disabled={items?.length >= max}
				showProgress={false}
				className={bem("addButton")}
				onClick={onAddClick}>
				+ Add attribute
			</Button>
		</div>
	);
}
