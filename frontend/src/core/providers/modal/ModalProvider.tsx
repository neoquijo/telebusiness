import { createContext, useContext, useState, ReactNode, FC } from 'react';
import css from './ModalProvider.module.css';
import { FcCancel } from 'react-icons/fc';
import { IconType } from 'react-icons';

interface ModalOptions {
  title?: ReactNode | string;
  icon?: IconType;
}

type ModalProps = {
  id: string;
  component: ReactNode;
  options?: ModalOptions;
};

type ModalManagerContextType = {
  openModal: (id: string, component: ReactNode, options?: ModalOptions) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
};

const ModalManagerContext = createContext<ModalManagerContextType | undefined>(undefined);

export const ModalProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [modals, setModals] = useState<ModalProps[]>([]);

  const openModal = (id: string, component: ReactNode, options?: ModalOptions) => {
    setModals((prev) => [...prev, { id, component, options }]);
  };

  const closeModal = (id: string) => {
    setModals((prev) => prev.filter((modal) => modal.id !== id));
  };

  const closeAllModals = () => {
    setModals([]);
  };

  const lastModal = modals.length > 0 ? modals[modals.length - 1] : null;

  return (
    <ModalManagerContext.Provider value={{ openModal, closeModal, closeAllModals }}>
      {children}
      <div className={modals.length > 0 ? css.wrapperActive : css.wrapper}>
        {lastModal && (
          <>
            <div className={css.close}>
              <div className={css.modalTitle}>
                {lastModal.options?.icon && <lastModal.options.icon />}
                {lastModal.options?.title}
              </div>
              <div onClick={() => closeModal(lastModal.id)} className={css.closeButton}>
                <FcCancel />
                Отменить
              </div>
            </div>
            <div className={css.modalActive} key={lastModal.id}>
              {lastModal.component}
            </div>
          </>
        )}
      </div>
    </ModalManagerContext.Provider>
  );
};

export const useModalManager = (): ModalManagerContextType => {
  const context = useContext(ModalManagerContext);
  if (!context) {
    throw new Error('useModalManager must be used within a ModalProvider');
  }
  return context;
};
