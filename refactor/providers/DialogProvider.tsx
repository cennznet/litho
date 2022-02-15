import { useMemo } from "react";
import {
	createContext,
	PropsWithChildren,
	useCallback,
	useContext,
	useState,
} from "react";
import Button from "@refactor/components/Button";
import DialogModal from "@refactor/components/DialogModal";

type DialogContent = {
	title: string;
	message: string | JSX.Element;
	action?: JSX.Element;
};

type DialogContext = {
	showDialog: (content: DialogContent) => Promise<void>;
	closeDialog: () => void;
};

const DialogContext = createContext<DialogContext>({} as DialogContext);

type ProviderProps = {};

export default function DialogProvider({
	children,
}: PropsWithChildren<ProviderProps>) {
	const [modalOpened, setModalOpened] = useState<{ resolve: () => void }>();
	const onModalRequestClose = useCallback(() => {
		setModalOpened((previous) => {
			previous?.resolve?.();
			return null;
		});
	}, []);
	const defaultAction = useMemo(() => {
		return <Button onClick={onModalRequestClose}>Okay</Button>;
	}, [onModalRequestClose]);

	const [content, setContent] = useState<DialogContent>({} as DialogContent);

	const showDialog = useCallback(
		async (content) => {
			setContent({ ...content, action: content.action || defaultAction });
			return new Promise<void>((resolve) => {
				setModalOpened({ resolve });
			});
		},
		[defaultAction]
	);

	return (
		<>
			<DialogContext.Provider
				value={{ showDialog, closeDialog: onModalRequestClose }}>
				{children}
			</DialogContext.Provider>
			<DialogModal
				title={content.title}
				message={content.message}
				action={content.action}
				isOpen={!!modalOpened}
				shouldCloseOnEsc={true}
				shouldCloseOnOverlayClick={false}
				onRequestClose={onModalRequestClose}
			/>
		</>
	);
}

export function useDialog(): DialogContext {
	return useContext(DialogContext);
}
