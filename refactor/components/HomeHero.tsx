import { DOMComponentProps } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import Text from "@refactor/components/Text";
import Button from "@refactor/components/Button";
import Link from "@refactor/components/Link";
import Image from "@refactor/components/Image";
import MarketplacePNG from "@refactor/assets/bitmaps/marketplace.png";
import MintingPNG from "@refactor/assets/bitmaps/minting.png";
import { useMintFlow } from "@refactor/providers/MintFlowProvider";
import useSelectedAccount from "@refactor/hooks/useSelectedAccount";
import useScrollToWallet from "@refactor/hooks/useScrollToWallet";

const bem = createBEMHelper(require("./HomeHero.module.scss"));

type ComponentProps = {};

export default function HomeHero({
	className,
}: DOMComponentProps<ComponentProps, "div">) {
	const { startMinting } = useMintFlow();
	const selectedAccount = useSelectedAccount();
	const scrollToWallet = useScrollToWallet();

	return (
		<div className={bem("root", className)}>
			<div className={bem("intro")}>
				<Text variant="headline2" className={bem("introText")}>
					Launch into the <strong>Lithoverse</strong>. Your place to{" "}
					<strong>create and exchange NFTs</strong>.
				</Text>
			</div>
			<div className={bem("mint")}>
				<div className={bem("mintImage")}>
					<Image src={MintingPNG} alt="Minting An NFT" layout="responsive" />
				</div>
				<div className={bem("action")}>
					<Text variant="headline4" className={bem("headline")}>
						CREATE NFTs
					</Text>
					<br />
					{!!selectedAccount && (
						<Button className={bem("button")} onClick={startMinting}>
							Start Minting
						</Button>
					)}
					{!selectedAccount && (
						<Button className={bem("button")} onClick={() => scrollToWallet()}>
							Connect Wallet
						</Button>
					)}
				</div>
			</div>
			<div className={bem("marketplace")}>
				<div className={bem("marketplaceImage")}>
					<Image
						src={MarketplacePNG}
						alt="Litho Marketplace"
						layout="responsive"
					/>
				</div>
				<div className={bem("action")}>
					<Text variant="headline4" className={bem("headline")}>
						MARKETPLACE
					</Text>
					<br />
					<Link href="/marketplace">
						<Button className={bem("button")}>Browse NFTs</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
