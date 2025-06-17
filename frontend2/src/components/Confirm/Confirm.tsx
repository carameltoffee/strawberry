import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { hideConfirm } from './Confirm.actions';
import { useAppDispatch } from '../../hooks/hooks';

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
          <div style={{
               position: 'fixed',
               top: 0, left: 0, right: 0, bottom: 0,
               backgroundColor: 'rgba(0,0,0,0.5)',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               zIndex: 9999,
          }}>
               <div style={{
                    backgroundColor: '#fff',
                    padding: 20,
                    borderRadius: 8,
                    maxWidth: 400,
                    width: '90%',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
               }}>
                    <p>{message}</p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                         <button onClick={handleCancel}>Отмена</button>
                         <button onClick={handleConfirm} style={{ backgroundColor: '#007bff', color: '#fff' }}>
                              Подтвердить
                         </button>
                    </div>
               </div>
          </div>
     );
};

export default Confirm;
