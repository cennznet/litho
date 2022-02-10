import { DOMComponentProps } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import { Props as ModalProps } from "react-modal";
import Modal from "@refactor/components/Modal";
import Text from "@refactor/components/Text";

const bem = createBEMHelper(require("./DialogModal.module.scss"));

type ComponentProps = {
	title: string;
	message: string | JSX.Element;
	action: JSX.Element;
} & Pick<
	ModalProps,
	"onRequestClose" | "isOpen" | "shouldCloseOnOverlayClick" | "shouldCloseOnEsc"
>;

export default function DialogModal({
	className,
	title,
	message,
	action,
	...props
}: DOMComponentProps<ComponentProps, "div">) {
	return (
		<Modal
			{...props}
			className={bem("content")}
			innerClassName={bem("inner")}
			overlayClassName={bem("overlay")}>
			<div className={bem("header")}>
				<Text variant="headline3" className={bem("title")}>
					{title}
				</Text>
			</div>
			<div className={bem("body")}>{message}</div>
			<div className={bem("footer")}>{action}</div>
		</Modal>
	);
}
