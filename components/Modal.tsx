import React from "react";

interface Props {
  onClose?: () => void;
  styles?: {
    modalBody?: string;
    modalContainer?: string;
  };
  hideClose?: boolean;
  disableOutsideClick?: boolean;
}

const Modal: React.FC<React.PropsWithChildren<Props>> = ({
  onClose,
  styles,
  children,
  hideClose = false,
  disableOutsideClick = false,
}) => {
  const outsideClickHandler: React.EventHandler<React.SyntheticEvent> = (
    event: React.SyntheticEvent
  ) => {
    const { currentTarget, target } = event;

    if (currentTarget.id === (target as HTMLElement).id) {
      onClose();
    }
  };

  React.useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 h-full w-full bg-litho-cream bg-opacity-75 flex items-center justify-center ${
        styles ? styles.modalContainer : ""
      }`}
      onClick={!disableOutsideClick ? outsideClickHandler : null}
      id="modal-container"
    >
      <div
        className={`bg-white shadow-md absolute py-10 px-6 ${
          styles ? styles.modalBody : ""
        }`}
      >
        {!hideClose && (
          <div
            className="absolute top-5 right-5 cursor-pointer"
            onClick={onClose}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z"
                fill="#191B1D"
                fillOpacity="0.6"
              />
            </svg>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;
