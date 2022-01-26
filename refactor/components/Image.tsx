import { useCallback, useState } from "react";
import NextImage, { ImageProps as NextImageProps } from "next/image";
import { DOMComponentProps } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";

const bem = createBEMHelper(require("./Image.module.scss"));

type ComponentProps = {} & NextImageProps;

export default function Image({
	className,
	onLoadingComplete,
	...props
}: DOMComponentProps<ComponentProps, "div">) {
	const [show, setShow] = useState<boolean>(false);
	const onImageLoadingComplete = useCallback(
		(event) => {
			setTimeout(() => {
				setShow(true);
				if (onLoadingComplete) onLoadingComplete(event);
			}, 100);
		},
		[onLoadingComplete]
	);

	return (
		<NextImage
			{...props}
			onLoadingComplete={onImageLoadingComplete}
			className={bem("root", { show }, className)}
		/>
	);
}

function imageKitLoader({ src, width, quality }) {
	if (src[0] === "/") src = src.slice(1);
	const params = [`w-${width}`];
	if (quality) {
		params.push(`q-${quality}`);
	}
	const paramsString = params.join(",");
	return `${src}?tr=${paramsString}`;
}

export function ImageKit(props: DOMComponentProps<ComponentProps, "div">) {
	// eslint-disable-next-line jsx-a11y/alt-text
	return <Image {...props} loader={imageKitLoader} />;
}
