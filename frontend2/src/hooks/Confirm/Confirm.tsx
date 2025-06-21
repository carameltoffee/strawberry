import React, { createContext, useCallback, useContext, useState } from "react";
import styles from './Confirm.module.css';

type ConfirmOptions = {
     message: string;
     onConfirm: () => void;
     onCancel?: () => void;
};

type ConfirmContextType = (options: ConfirmOptions) => void;

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
     const [options, setOptions] = useState<ConfirmOptions | null>(null);

     const confirm = useCallback((opts: ConfirmOptions) => {
          setOptions(opts);
     }, []);

     const handleConfirm = () => {
          options?.onConfirm();
          setOptions(null);
     };

     const handleCancel = () => {
          options?.onCancel?.();
          setOptions(null);
     };

     return (
          <ConfirmContext.Provider value={confirm}>
               {children}
               {options && (
                    <div className={styles.overlay}>
                         <div className={styles.modal}>
                              <p className={styles.message}>{options.message}</p>
                              <div className={styles.buttons}>
                                   <button className={`${styles.button} ${styles.cancel}`} onClick={handleCancel}>
                                        Отмена
                                   </button>
                                   <button className={`${styles.button}`} onClick={handleConfirm}>
                                        Подтвердить
                                   </button>
                              </div>
                         </div>
                    </div>
               )}
          </ConfirmContext.Provider>
     );
};

export const useConfirm = (): ConfirmContextType => {
     const context = useContext(ConfirmContext);
     if (!context) {
          throw new Error("useConfirm должен использоваться внутри <ConfirmProvider>");
     }
     return context;
};
