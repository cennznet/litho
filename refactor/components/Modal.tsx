import { useCallback, useEffect, useState } from "react";
import { DOMComponentProps } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import ReactModal, { Props as ModalProps } from "react-modal";
import { ReactComponent as XSVG } from "@refactor/assets/vectors/x.svg";
import { disablePageScroll, enablePageScroll } from "scroll-lock";

const bem = createBEMHelper(require("./Modal.module.scss"));

type ComponentProps = {};

export default function Modal({
	className,
	children,
	onRequestClose,
	isOpen,
	...props
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

	const [contentRef, setContentRef] = useState<HTMLDivElement>();
	// add a workaround to close modal when click on empty space around `content`
	useEffect(() => {
		if (!contentRef) return;

		const onContentClick = (event: Event) => {
			if (event.composedPath()[0] !== contentRef) return;
			onCloseClick(event);
		};
		contentRef.addEventListener("click", onContentClick);
		return () => contentRef.removeEventListener("click", onContentClick);
	}, [contentRef, onCloseClick]);

	return (
		<ReactModal
			isOpen={isOpen}
			portalClassName={bem("container")}
			overlayClassName={bem("overlay")}
			className={bem("inner")}
			onRequestClose={onRequestClose}
			shouldCloseOnEsc={true}
			shouldCloseOnOverlayClick={true}
			contentRef={setContentRef}>
			<div className={bem("content", className)} {...props}>
				<XSVG className={bem("close")} onClick={onCloseClick} />
				{children}
			</div>
		</ReactModal>
	);
}

export function Hr() {
	return <hr className={bem("hr")} />;
}
