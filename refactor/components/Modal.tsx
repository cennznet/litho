import { useCallback, useEffect } from "react";
import { DOMComponentProps } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import ReactModal, { Props as ModalProps } from "react-modal";
import { ReactComponent as XSVG } from "@refactor/assets/vectors/x.svg";
import { disablePageScroll, enablePageScroll } from "scroll-lock";

import styles from "./Modal.module.scss";
const bem = createBEMHelper(styles);

type ComponentProps = {};

export default function Modal({
	className,
	children,
	onRequestClose,
	isOpen,
}: DOMComponentProps<
	ComponentProps & Pick<ModalProps, "onRequestClose" | "isOpen">,
	"div"
>) {
	const onCloseClick = useCallback(
		(event) => onRequestClose && onRequestClose(event),
		[onRequestClose]
	);

	useEffect(() => {
		if (isOpen) return disablePageScroll();
		enablePageScroll();
	}, [isOpen]);

	return (
		<ReactModal
			isOpen={isOpen}
			portalClassName={bem("container")}
			overlayClassName={bem("overlay")}
			className={bem("content", className)}
			onRequestClose={onRequestClose}>
			<XSVG className={bem("close")} onClick={onCloseClick} />
			{children}
		</ReactModal>
	);
}
