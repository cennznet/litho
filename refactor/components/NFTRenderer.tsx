import { DOMComponentProps } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import isVideoType from "@refactor/utils/isVideoType";
import { ImageKit } from "@refactor/components/Image";
import Video from "@refactor/components/Video";
import { useCallback, useState } from "react";

const bem = createBEMHelper(require("./NFTRenderer.module.scss"));

type ComponentProps = {
	name: string;
	url: string;
	extension?: string;
	contentType?: string;
};

export default function NFTRenderer({
	className,
	name,
	url,
	extension,
	contentType,
	...props
}: DOMComponentProps<ComponentProps, "div">) {
	const isVideo = extension
		? isVideoType(extension)
		: contentType
		? contentType.indexOf("video/") === 0
		: false;
	const [loading, setLoading] = useState<boolean>(true);
	const onLoadingComplete = useCallback(() => {
		setLoading(false);
	}, []);

	return (
		<div className={bem("root", className)} {...props}>
			<div className={bem("inner", { loading })}>
				{isVideo && (
					<Video
						onCanPlay={onLoadingComplete}
						className={bem("video")}
						src={url}
						title={name}
						autoPlay
						loop
						muted
						controlsList="nodownload"
					/>
				)}

				{!isVideo && (
					<ImageKit
						onLoadingComplete={onLoadingComplete}
						src={url}
						layout="fill"
						title={name}
						alt={name}
						objectFit="contain"
						objectPosition="center"
						sizes="25vw"
					/>
				)}
			</div>
		</div>
	);
}
