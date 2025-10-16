import {
  createContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

type ModalContextType = {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const ModalContext = createContext<ModalContextType>({
  showModal: false,
  setShowModal: () => {},
});

type ModalContextProviderType = {
  children: ReactNode;
};

export const ModalContextProvider = ({
  children,
}: ModalContextProviderType) => {
  const [showModal, setShowModal] = useState(false);
  return (
    <ModalContext.Provider value={{ showModal, setShowModal }}>
      {children}
    </ModalContext.Provider>
  );
};
