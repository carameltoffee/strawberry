import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useEffect } from 'react';
import { hideAlert } from './Alert.actions';
import styles from './Alert.module.css';
import classNames from 'classnames';
import { useAppDispatch } from '../../hooks/hooks';

export const Alert = () => {
     const dispatch = useAppDispatch();
     const { message, isError } = useSelector((state: RootState) => state.alert);

     useEffect(() => {
          if (message) {
               const timer = setTimeout(() => {
                    dispatch(hideAlert());
               }, 2000);

               return () => clearTimeout(timer);
          }
     }, [message, dispatch]);

     if (!message) return null;

     return (
          <div className={classNames(styles.alert, isError ? styles.error : styles.success)}>
               {message}
          </div>
     );
};
