import { useState } from "react";
import { DOMComponentProps, NFTCollectionId } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import { Props as ModalProps } from "react-modal";
import Modal from "@refactor/components/Modal";
import Text from "@refactor/components/Text";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";

const bem = createBEMHelper(require("./MintFlowModal.module.scss"));

type ComponentProps = {
	collectionId: NFTCollectionId;
} & Pick<
	ModalProps,
	"onRequestClose" | "isOpen" | "shouldCloseOnOverlayClick" | "shouldCloseOnEsc"
>;

export default function MintFlowModal({
	className,
	collectionId,
	onRequestClose,
	...props
}: DOMComponentProps<ComponentProps, "div">) {
	const [busy, setBusy] = useState<boolean>(false);
	const [currentStep, setCurrentStep] = useState<number>(0);

	return (
		<Modal
			{...props}
			className={bem("content")}
			innerClassName={bem("inner")}
			overlayClassName={bem("overlay")}
			shouldCloseOnEsc={!busy}
			shouldCloseOnOverlayClick={!busy}
			onRequestClose={onRequestClose}>
			<div className={bem("header")}>
				<Text variant="headline3">Create a single NFT</Text>
			</div>
			<div className={bem("body")}>
				<Tabs
					forceRenderTabPanel={true}
					className={bem("tabs")}
					selectedTabClassName={bem("tab", { selected: true })}
					disabledTabClassName={bem("tab", { disabled: true })}
					selectedTabPanelClassName={bem("tabPanel", { selected: true })}
					defaultIndex={0}>
					<TabList className={bem("tabList")}>
						{["About your NFT", "Upload assets", "Preview"].map(
							(label, index) => (
								<Tab
									key={index}
									className={bem("tab")}
									disabled={index > currentStep}>
									{`${index + 1}. ${label}`}
								</Tab>
							)
						)}
					</TabList>
					<form className={bem("form")}>
						<TabPanel className={bem("tabPanel")}>
							<NFTAbout />
						</TabPanel>
						<TabPanel className={bem("tabPanel")}>
							<NFTUpload />
						</TabPanel>
						<TabPanel className={bem("tabPanel")}>
							<NFTPreview />
						</TabPanel>
					</form>
				</Tabs>
			</div>
		</Modal>
	);
}

type NFTAboutProps = {};
function NFTAbout({}: DOMComponentProps<NFTAboutProps, "fieldset">) {
	return null;
}

type NFTUploadProps = {};
function NFTUpload({}: DOMComponentProps<NFTUploadProps, "fieldset">) {
	return null;
}

type NFTPreviewProps = {};
function NFTPreview({}: DOMComponentProps<NFTPreviewProps, "fieldset">) {
	return null;
}
