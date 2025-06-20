import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { hideConfirm } from './Confirm.actions';
import { useAppDispatch } from '../../hooks/hooks';
import styles from './Confirm.module.css';

const Confirm: React.FC = () => {
     const dispatch = useAppDispatch();

     const { visible, message, onConfirm, onCancel } = useSelector(
          (state: RootState) => state.confirm
     );

     if (!visible) return null;

     const handleConfirm = () => {
          if (onConfirm) onConfirm();
          dispatch(hideConfirm());
     };

     const handleCancel = () => {
          if (onCancel) onCancel();
          dispatch(hideConfirm());
     };

     return (
          <div className={styles.overlay}>
               <div className={styles.modal}>
                    <p className={styles.message}>{message}</p>
                    <div className={styles.buttons}>
                         <button
                              className={`${styles.button} ${styles.cancel}`}
                              onClick={handleCancel}
                         >
                              Отмена
                         </button>
                         <button
                              className={`${styles.button} ${styles.confirm}`}
                              onClick={handleConfirm}
                         >
                              Подтвердить
                         </button>
                    </div>
               </div>
          </div>
     );
};

export default Confirm;
