import { useContext, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ModalContext } from "./context/ModalContext";

const MenuModal = ({ children }: { children: ReactNode }) => {
  const { showModal } = useContext(ModalContext);
  return (
    <div>
      {showModal &&
        createPortal(
          <div className="modal-overlay">
            <div className="modal-content">{children}</div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default MenuModal;
