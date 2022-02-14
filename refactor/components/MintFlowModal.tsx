import { useCallback, useEffect, useState } from "react";
import { DOMComponentProps, NFTCollectionId } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import { Props as ModalProps } from "react-modal";
import Modal from "@refactor/components/Modal";
import Text from "@refactor/components/Text";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import AttributesList from "@refactor/components/AttributesList";
import Button from "@refactor/components/Button";
import useGasEstimate from "@refactor/hooks/useGasEstimate";

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
	const [formData, setFormData] = useState<Array<FormData>>([]);
	const onFormSubmit = useCallback((step, event) => {
		event.preventDefault();
		const formData = new FormData(event.target);
		setFormData((current) => {
			const next = [...current];
			next[step] = formData;
			return next;
		});

		if (step < 2) return setCurrentStep((current) => current + 1);
	}, []);

	console.log(formData);

	return (
		<Modal
			{...props}
			className={bem("content")}
			innerClassName={bem("inner")}
			overlayClassName={bem("overlay")}
			shouldCloseOnEsc={false}
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
					<div className={bem("form")}>
						<TabPanel className={bem("tabPanel")}>
							<NFTAbout onSubmit={onFormSubmit.bind(null, 0)} />
						</TabPanel>
						<TabPanel className={bem("tabPanel")}>
							<NFTUpload onSubmit={onFormSubmit.bind(null, 1)} />
						</TabPanel>
						<TabPanel className={bem("tabPanel")}>
							<NFTPreview formData={formData} />
						</TabPanel>
					</div>
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

		if (file.type.indexOf("image/") < 0 && file.type.indexOf("video/") < 0)
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
						We support: gif, jpeg, png, svg, tiff, webp, mp4, ogv, mov, webm up
						to 10MB
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

type NFTPreviewProps = {
	formData: Array<FormData>;
};
type NFTRenderer = {
	name: string;
	url: string;
	contentType: string;
	quantity: number;
};

function NFTPreview({
	formData,
	...props
}: DOMComponentProps<NFTPreviewProps, "form">) {
	const [aboutForm, uploadForm] = formData;
	const [nftRenderer, setNFTRenderer] = useState<NFTRenderer>(
		{} as NFTRenderer
	);

	useEffect(() => {
		if (!uploadForm) return;

		const reader = new FileReader();
		const onReaderLoad = (event) => {
			const url = event.target.result;
			setNFTRenderer({
				name: aboutForm.get("name") as string,
				url,
				contentType: uploadForm.get("encoding_format") as string,
				quantity: parseInt(aboutForm.get("quantity") as string, 10),
			});
		};
		reader.addEventListener("load", onReaderLoad);
		reader.readAsDataURL(uploadForm.get("image") as Blob);

		return () => reader.removeEventListener("load", onReaderLoad);
	}, [uploadForm, aboutForm]);

	const { name, url, contentType, quantity } = nftRenderer;

	const { estimateMintFee } = useGasEstimate();
	const [gasFee, setGasFee] = useState<number>();
	useEffect(() => {
		if (!estimateMintFee) return;

		estimateMintFee().then(setGasFee);
	}, [estimateMintFee]);

	if (!url) return null;

	return (
		<form {...props}>
			<div className={bem("card", { asStack: quantity > 1 })}>
				<div className={bem("renderer")}>
					{contentType.indexOf("video/") === 0 && (
						<video
							src={url}
							title={name}
							className={bem("rendererItem")}
							autoPlay
							loop
							muted
							controlsList="nodownload"
						/>
					)}

					{contentType.indexOf("image/") === 0 && (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							className={bem("rendererItem")}
							src={url}
							title={name}
							alt={name}
						/>
					)}
				</div>

				<div className={bem("details")}>
					<Text variant="headline5" className={bem("name")}>
						{name}
					</Text>
					<Text variant="subtitle2" className={bem("quantity")}>
						x{quantity}
					</Text>
				</div>
			</div>

			<div className={bem("formAction")}>
				<Button type="submit">Mint</Button>

				{gasFee && (
					<p className={bem("inputNote")}>
						Estimated transaction fee: {gasFee} CPAY
					</p>
				)}
			</div>
		</form>
	);
}
