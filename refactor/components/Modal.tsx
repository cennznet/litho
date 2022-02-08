import { useCallback, useEffect, useState } from "react";
import { DOMComponentProps } from "@refactor/types";
import createBEMHelper from "@refactor/utils/createBEMHelper";
import ReactModal, { Props as ModalProps } from "react-modal";
import XSVG from "@refactor/assets/vectors/x.svg";
import { disablePageScroll, enablePageScroll } from "scroll-lock";

const bem = createBEMHelper(require("./Modal.module.scss"));

type ComponentProps = {
	innerClassName?: string;
} & Pick<
	ModalProps,
	| "onRequestClose"
	| "isOpen"
	| "shouldCloseOnOverlayClick"
	| "shouldCloseOnEsc"
	| "overlayClassName"
>;

export default function Modal({
	className,
	innerClassName,
	overlayClassName,
	children,
	onRequestClose,
	isOpen,
	shouldCloseOnOverlayClick = true,
	shouldCloseOnEsc = true,
	...props
}: DOMComponentProps<ComponentProps, "div">) {
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
		if (!contentRef || !shouldCloseOnOverlayClick) return;

		const onContentClick = (event: Event) => {
			if (event.composedPath()[0] !== contentRef) return;
			onCloseClick(event);
		};
		contentRef.addEventListener("click", onContentClick);
		return () => contentRef.removeEventListener("click", onContentClick);
	}, [contentRef, onCloseClick, shouldCloseOnOverlayClick]);

	return (
		<ReactModal
			isOpen={isOpen}
			closeTimeoutMS={200}
			portalClassName={bem("container")}
			overlayClassName={bem("overlay", overlayClassName)}
			className={bem("content", className)}
			onRequestClose={onRequestClose}
			shouldCloseOnEsc={shouldCloseOnEsc}
			shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
			contentRef={setContentRef}>
			<div className={bem("inner", innerClassName)}>
				<XSVG className={bem("close")} onClick={onCloseClick} />
				{children}
			</div>
		</ReactModal>
	);
}

export function Hr() {
	return <hr className={bem("hr")} />;
}
