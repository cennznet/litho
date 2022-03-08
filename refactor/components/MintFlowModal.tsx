import { useCallback, useEffect, useState } from "react";
import {
	DOMComponentProps,
	NFTAttribute271,
	NFTCollectionId,
	NFTMetadata271,
} from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import { Props as ModalProps } from "react-modal";
import Modal from "@refactor/components/Modal";
import Text from "@refactor/components/Text";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import AttributesList from "@refactor/components/AttributesList";
import Button from "@refactor/components/Button";
import useGasEstimate from "@refactor/hooks/useGasEstimate";
import usePinataIPFS from "@refactor/hooks/usePinataIPFS";
import useNFTMint from "@refactor/hooks/useNFTMint";
import { useDialog } from "@refactor/providers/DialogProvider";
import Link from "@refactor/components/Link";
import { useWallet } from "@refactor/providers/SupportedWalletProvider";
import { NextSeo } from "next-seo";

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
	const { pinFile, pinMetadata } = usePinataIPFS();
	const { account } = useWallet();
	const mintNFT = useNFTMint();
	const { showDialog, closeDialog } = useDialog();
	const showSuccessDialog = useCallback(async () => {
		const action = (
			<>
				<Button variant="hollow" onClick={closeDialog}>
					Dismiss
				</Button>
				<Link href="/me" onClick={closeDialog}>
					<Button>View my NFTs</Button>
				</Link>
			</>
		);

		return await showDialog({
			title: "Congratulations!",
			message:
				"Your NFTs have successfully minted and should be displayed in your wallet shortly.",
			action,
		});
	}, [closeDialog, showDialog]);

	const [aboutForm, uploadForm] = formData;
	const onFormData = useCallback((step, formData) => {
		setFormData((current) => {
			const next = [...current];
			next[step] = formData;
			return next;
		});

		return setCurrentStep((current) => current + 1);
	}, []);

	const onFormSubmit = useCallback(
		async (event) => {
			event.preventDefault();
			setBusy(true);

			// Pin the upload asset to Pinata IPFS
			const { IpfsHash: imageHash } = await pinFile(
				uploadForm.get("image") as Blob
			);

			const quantity = parseInt(aboutForm.get("quantity") as string, 10);

			const metadata: NFTMetadata271 = {
				name: aboutForm.get("name") as string,
				description: aboutForm.get("description") as string,
				image: `ipfs://${imageHash}`,
				encoding_format: uploadForm.get("encoding_format") as string,
				attributes: JSON.parse(
					aboutForm.get("attributes") as string
				) as Array<NFTAttribute271>,
				quantity,
				creator: account.address,
				source: "Lithoverse",
			};

			// Pint the metadata folder to Pinata IPFS
			const { IpfsHash: metadataHash } = await pinMetadata(
				metadata,
				parseInt(aboutForm.get("quantity") as string, 10)
			);

			const status = await mintNFT(
				collectionId,
				`ipfs://${metadataHash}/metadata.json`,
				quantity,
				parseInt(aboutForm.get("royalty") as string, 10)
			);

			if (status === "cancelled" || status === "error") return setBusy(false);
			onRequestClose?.(null);
			setBusy(false);
			setFormData([]);
			setCurrentStep(0);
			await showSuccessDialog();
		},
		[
			pinFile,
			pinMetadata,
			aboutForm,
			uploadForm,
			collectionId,
			mintNFT,
			onRequestClose,
			showSuccessDialog,
			account?.address,
		]
	);

	return (
		<Modal
			{...props}
			className={bem("content")}
			innerClassName={bem("inner")}
			overlayClassName={bem("overlay")}
			shouldCloseOnEsc={!busy}
			shouldCloseOnOverlayClick={!busy}
			onRequestClose={onRequestClose}>
			<NextSeo title="Create NFTs" />
			<div className={bem("header")}>
				<Text variant="headline3">Create NFTs</Text>
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
									disabled={index > currentStep || (index <= 1 && busy)}>
									{`${index + 1}. ${label}`}
								</Tab>
							)
						)}
					</TabList>
					<div className={bem("form")}>
						<TabPanel className={bem("tabPanel")}>
							<NFTAbout onFormData={onFormData.bind(null, 0)} />
						</TabPanel>
						<TabPanel className={bem("tabPanel")}>
							<NFTUpload onFormData={onFormData.bind(null, 1)} />
						</TabPanel>
						<TabPanel className={bem("tabPanel")}>
							<NFTPreview
								formData={formData}
								busy={busy}
								onSubmit={onFormSubmit}
							/>
						</TabPanel>
					</div>
				</Tabs>
			</div>
		</Modal>
	);
}

type NFTAboutProps = {
	onFormData?: (data: FormData) => void;
};
function NFTAbout({
	onFormData,
	...props
}: DOMComponentProps<NFTAboutProps, "form">) {
	const onFormSubmit = useCallback(
		(event) => {
			event.preventDefault();
			const data = new FormData(event.target);
			const attributeTypes = data.getAll("attribute_types");
			const attribueValues = data.getAll("attribute_values");

			data.append(
				"attributes",
				JSON.stringify(
					attributeTypes.reduce((attributes, value, index) => {
						attributes.push({
							trait_type: value,
							value: attribueValues[index],
						});

						return attributes;
					}, [])
				)
			);
			onFormData?.(data);
		},
		[onFormData]
	);

	return (
		<form {...props} onSubmit={onFormSubmit}>
			<div className={bem("field")}>
				<div className={bem("input")}>
					<label htmlFor="TitleInput">Name</label>
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

type NFTUploadProps = {
	onFormData?: (data: FormData) => void;
};
function NFTUpload({
	onFormData,
	...props
}: DOMComponentProps<NFTUploadProps, "form">) {
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

	const onFormSubmit = useCallback(
		(event) => {
			event.preventDefault();
			const data = new FormData(event.target);

			onFormData?.(data);
		},
		[onFormData]
	);

	return (
		<form {...props} onSubmit={onFormSubmit}>
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
	busy: boolean;
};
type NFTRenderer = {
	name: string;
	url: string;
	contentType: string;
	quantity: number;
};

function NFTPreview({
	formData,
	busy,
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

	// Get gas estimate
	const { estimateMintFee } = useGasEstimate();
	const [gasFee, setGasFee] = useState<number>();
	useEffect(() => {
		if (!estimateMintFee) return;

		estimateMintFee().then(setGasFee);
	}, [estimateMintFee]);

	return (
		<form {...props}>
			<div className={bem("card", { asStack: quantity > 1 })}>
				<div className={bem("renderer")}>
					{!!url && contentType.indexOf("video/") === 0 && (
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

					{!!url && contentType.indexOf("image/") === 0 && (
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
				<Button type="submit" disabled={busy}>
					{busy ? "Processing" : "Mint"}
				</Button>

				{gasFee && (
					<p className={bem("inputNote")}>
						Estimated transaction fee: {gasFee} CPAY
					</p>
				)}
			</div>
		</form>
	);
}
