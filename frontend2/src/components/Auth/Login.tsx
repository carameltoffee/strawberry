import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { loginUser } from './Auth.thunks';
import styles from './Login.module.css';
import { useAppDispatch } from '../../hooks/hooks';
import { useNavigate } from 'react-router-dom';


export const Login: React.FC = () => {
     const navigate = useNavigate();
     const dispatch = useAppDispatch();
     const loading = useSelector((state: RootState) => state.auth.loading)
     const user = useSelector((state: RootState) => state.auth.user);

     const [identifier, setEmail] = useState('');
     const [password, setPassword] = useState('');

     const submitHandler = (e: { preventDefault: () => void; }) => {
          e.preventDefault();
          dispatch(loginUser({ username: identifier, password }));
     };

     useEffect(() => {
          if (user) {
               navigate("/");
          }
     }, [user, navigate]);

     return (
          <form className={styles.form} onSubmit={submitHandler}>
               <h1 className={styles.title}>Вход</h1>
               <input
                    type="text"
                    className={styles.input}
                    value={identifier}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Логин или почта"
                    required
               />
               <input
                    type="password"
                    className={styles.input}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Пароль"
                    required
               />
               <button type="submit" className={styles.button} disabled={loading}>
                    {loading ? 'Загрузка...' : 'Войти'}
               </button>
          </form>

     );
}
