import { FormEvent, useCallback, useState } from "react";
import { DOMComponentProps, NFTCollectionId } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import { Props as ModalProps } from "react-modal";
import Modal from "@refactor/components/Modal";
import Text from "@refactor/components/Text";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import AttributesList from "@refactor/components/AttributesList";
import Button from "@refactor/components/Button";

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
	const onFormSubmit = useCallback((step, event) => {
		event.preventDefault();
		if (step < 2) return setCurrentStep((current) => current + 1);
	}, []);

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
					selectedIndex={currentStep}
					onSelect={setCurrentStep}>
					<TabList className={bem("tabList")}>
						{["About your NFT", "Upload asset", "Preview"].map(
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

					<TabPanel className={bem("tabPanel")}>
						<NFTAbout
							onSubmit={onFormSubmit.bind(null, 0)}
							className={bem("form")}
						/>
					</TabPanel>
					<TabPanel className={bem("tabPanel")}>
						<NFTUpload
							onSubmit={onFormSubmit.bind(null, 0)}
							className={bem("form")}
						/>
					</TabPanel>
					<TabPanel className={bem("tabPanel")}>
						<NFTPreview />
					</TabPanel>
				</Tabs>
			</div>
		</Modal>
	);
}

type NFTAboutProps = {};
function NFTAbout(props: DOMComponentProps<NFTAboutProps, "form">) {
	return (
		<form {...props}>
			<div className={bem("field")}>
				<div className={bem("input")}>
					<label htmlFor="TitleInput">Title</label>
					<input
						type="text"
						className={bem("textInput")}
						id="TitleInput"
						name="name"
						placeholder="Enter a name for your NFT"
						required
					/>
				</div>
			</div>

			<div className={bem("field")}>
				<div className={bem("input")}>
					<label htmlFor="DescriptionInput">Description</label>
					<textarea
						className={bem("textInput")}
						id="DescriptionInput"
						rows={4}
						name="description"
						placeholder="Enter a short description of your NFT to accompany your marketplace listing"
						required
					/>
				</div>
			</div>

			<div className={bem("field")}>
				<div className={bem("input")}>
					<label htmlFor="CopiesInput">Number of copies</label>
					<input
						type="number"
						step={1}
						className={bem("textInput")}
						id="CopiesInput"
						name="quantity"
						defaultValue={1}
						required={true}
						min={1}
					/>
				</div>
				<div className={bem("spacer")} />
				<div className={bem("input")}>
					<label htmlFor="RoyaltyInput">Royalty</label>
					<div className={bem("textInput", { prefix: true })}>
						<input
							type="number"
							step={1}
							name="royalty"
							id="RoyaltyInput"
							defaultValue={10}
							required={true}
							min={1}
						/>
						<span>%</span>
					</div>
				</div>
			</div>

			<div className={bem("field")}>
				<div className={bem("input")}>
					<label htmlFor="attributesList">Attributes (optional)</label>
					<p className={bem("inputNote")}>
						Describe and organise your NFT using attributes, e.g Background: Sky
						Blue. You can add up 16 attributes.
					</p>
					<AttributesList max={16} />
				</div>
			</div>

			<div className={bem("formAction")}>
				<Button type="submit">Next: Upload Asset</Button>
			</div>
		</form>
	);
}

type NFTUploadProps = {};
function NFTUpload(props: DOMComponentProps<NFTUploadProps, "form">) {
	const [fileType, setFileType] = useState<string>();

	const onFileChange = useCallback((event) => {
		const target = event.target;
		const file = target?.files?.[0];

		setFileType(file?.type);
		// check for size;
		const max = 10 * 1024 * 1024;
		if (file.size > max)
			return target.setCustomValidity(
				"Please select a file that is less than 10MB"
			);

		if (file.type.indexOf("image/") < 0 || file.type.indexOf("video/"))
			return target.setCustomValidity(
				"Please select file that is either an image or a video"
			);

		target.setCustomValidity("");
	}, []);

	return (
		<form {...props}>
			<div className={bem("field")}>
				<div className={bem("input")}>
					<label htmlFor="UploadInput">Upload Asset</label>
					<input
						type="file"
						name="image"
						className={bem("textInput")}
						id="UploadInput"
						required={true}
						onChange={onFileChange}
					/>
					<input type="hidden" name="encoding_format" defaultValue={fileType} />
					<p className={bem("inputNote")}>
						We support: bmp, gif, jpeg, png, svg, tiff, webp, mp4, ogv, mov,
						webm up to 10MB
					</p>
				</div>
			</div>

			<div className={bem("field")}>
				<div className={bem("input")}>
					<label htmlFor="ContentInput">Content Storage</label>
					<input
						type="text"
						className={bem("textInput")}
						disabled
						value="IPFS"
						id="ContentInput"
					/>
				</div>
			</div>
			<div className={bem("formAction")}>
				<Button type="submit">Next: Preview</Button>
			</div>
		</form>
	);
}

type NFTPreviewProps = {};
function NFTPreview({}: DOMComponentProps<NFTPreviewProps, "fieldset">) {
	return null;
}
