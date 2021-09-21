import React from "react";
import Link from "next/link";

import Text from "../Text";
import { useRouter } from "next/router";
import Modal from "../Modal";

interface Props {
  successLink: string;
  errorLink: string;
  modalState: string;
  setModalState: (status: string) => void;
}

const TxStatusModal: React.FC<Props> = ({
  successLink,
  errorLink,
  modalState,
  setModalState,
}) => {
  const router = useRouter();

  const modalStates = {
    txInProgress: {
      message: "PLEASE STAY ON THIS PAGE",
      subText: "Please stay on the page until it has been successfully sent.",
      onClose: () => setModalState(null),
    },
    success: {
      message: "CONGRATULATIONS!",
      subText: "Your transaction was successfully proccessed.",
      buttons: [
        {
          text: "OK",
          isPrimary: true,
          type: "link",
          link: successLink,
        },
      ],
      onClose: () => router.push(successLink),
    },
    error: {
      message: "OOPS... SOMETHING WENT WRONG",
      subText: "Your transaction failed to proccess. Please try again.",
      buttons: [
        {
          text: "CANCEL",
          isPrimary: false,
          type: "link",
          link: errorLink,
        },
        {
          text: "TRY AGAIN",
          onClick: () => setModalState(null),
          isPrimary: true,
          type: "button",
        },
      ],
      onClose: () => setModalState(null),
    },
  };

  return (
    <Modal
      onClose={modalStates[modalState].onClose}
      hideClose={modalStates[modalState].hideClose}
      styles={{
        modalBody: "w-3/6 flex flex-col",
        modalContainer: "z-10",
      }}
      disableOutsideClick
    >
      <Text variant="h4" color="litho-blue" component="h2" className="mb-6">
        {modalStates[modalState].message}
      </Text>
      <Text
        variant="body1"
        color="black"
        className="mt-2 border-b border-black border-opacity-20 pb-6"
      >
        {modalStates[modalState].subText}
      </Text>
      <div className="self-end flex items-center mt-8 space-x-4">
        {modalStates[modalState].buttons &&
          modalStates[modalState].buttons.length > 0 &&
          modalStates[modalState].buttons.map((button) => {
            if (button.type === "button") {
              return (
                <button
                  className={`${
                    button.isPrimary
                      ? "rounded-sm bg-litho-blue text-white"
                      : ""
                  } px-4 py-3 uppercase`}
                  onClick={button.onClick}
                  key={button.text}
                >
                  <Text
                    variant="button"
                    color={`${button.isPrimary ? "white" : "litho-blue"}`}
                  >
                    {button.text}
                  </Text>
                </button>
              );
            }
            return (
              <Link href={button.link} key={button.text}>
                <a
                  className={`${
                    button.isPrimary
                      ? "rounded-sm bg-litho-blue"
                      : "text-litho-blue"
                  } px-4 py-3 uppercase`}
                >
                  <Text
                    variant="button"
                    color={`${button.isPrimary ? "white" : "litho-blue"}`}
                  >
                    {button.text}
                  </Text>
                </a>
              </Link>
            );
          })}
      </div>
    </Modal>
  );
};

export default TxStatusModal;
