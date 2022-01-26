import { DOMComponentProps } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import { useCallback, useState, useRef, useEffect } from "react";

const bem = createBEMHelper(require("./Video.module.scss"));

type ComponentProps = {};

export default function Video({
	className,
	onCanPlay,
	...props
}: DOMComponentProps<ComponentProps, "video">) {
	const [show, setShow] = useState<boolean>(false);
	const onLoadingComplete = useCallback(
		(event?) => {
			setTimeout(() => {
				setShow(true);
				if (onCanPlay) onCanPlay(event);
			}, 100);
		},
		[onCanPlay]
	);
	const ref = useRef<HTMLVideoElement>(null);
	useEffect(() => {
		if (!ref.current) return;
		if (ref.current.readyState >= 3) onLoadingComplete();
	}, [onLoadingComplete]);

	return (
		<video
			ref={ref}
			className={bem("root", { show }, className)}
			onCanPlay={onLoadingComplete}
			{...props}
		/>
	);
}
