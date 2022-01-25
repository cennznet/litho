import { DOMComponentProps, NFT } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import isVideoType from "@refactor/utils/isVideoType";
import Image from "@refactor/components/Image";

const bem = createBEMHelper(require("./NFTRenderer.module.scss"));

type ComponentProps = {
	value: NFT;
};

export default function NFTRenderer({
	className,
	value,
	...props
}: DOMComponentProps<ComponentProps, "div">) {
	const isVideo = isVideoType(value?.metadata?.properties?.extension);

	return (
		<div className={bem("root", className)} {...props}>
			<div className={bem("inner")}>
				{isVideo && (
					<video
						className={bem("video")}
						src={value.metadata.image}
						autoPlay
						loop
						controlsList="nodownload"></video>
				)}

				{!isVideo && (
					<Image
						src={value.metadata.image}
						layout="fill"
						alt={value?.metadata?.name}
						objectFit="contain"
						objectPosition="center"
						sizes="25vw"
					/>
				)}
			</div>
		</div>
	);
}
