import { DOMComponentProps, NFT } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import isVideoType from "@refactor/utils/isVideoType";
import Image from "next/image";

const bem = createBEMHelper(require("./NFTRenderer.module.scss"));

type ComponentProps = {
	token: NFT;
};

export default function NFTRenderer({
	className,
	token,
	...props
}: DOMComponentProps<ComponentProps, "div">) {
	const isVideo = isVideoType(token?.metadata?.properties?.extension);

	return (
		<div className={bem("root", className)} {...props}>
			<div className={bem("inner")}>
				{isVideo && (
					<video
						className={bem("video")}
						src={token.metadata.image}
						autoPlay
						loop
						controlsList="nodownload"></video>
				)}

				{!isVideo && (
					<Image
						src={token.metadata.image}
						layout="fill"
						alt={token?.metadata?.name}
						objectFit="contain"
						objectPosition="center"
						sizes="25vw"
					/>
				)}
			</div>
		</div>
	);
}
