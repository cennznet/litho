import { useCallback, useState } from "react";
import NextImage, { ImageProps as NextImageProps } from "next/image";
import { DOMComponentProps } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";

const bem = createBEMHelper(require("./Image.module.scss"));

type ComponentProps = {} & NextImageProps;

export default function Image({
	className,
	...props
}: DOMComponentProps<ComponentProps, "div">) {
	const [show, setShow] = useState<boolean>(false);
	const onLoadingComplete = useCallback(() => {
		setTimeout(() => {
			setShow(true);
		}, 100);
	}, []);

	return (
		<NextImage
			{...props}
			onLoadingComplete={onLoadingComplete}
			className={bem("root", { show }, className)}
		/>
	);
}
