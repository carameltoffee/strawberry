import React from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../Auth/Auth.thunks";
import { RootState } from "../../store/store";
import styles from './Header.module.css';
import Avatar from "../Avatar/Avatar";
import { useAppDispatch } from "../../hooks/hooks";

const Header: React.FC = () => {
     const dispatch = useAppDispatch();
     const navigate = useNavigate();

     const { user, loading } = useSelector((state: RootState) => state.auth);
     if (loading) return null; 

     const handleLogout = () => {
          dispatch(logout());
          navigate("/login");
     };

     return (
          <header className={styles.header}>
               <Link to="/" className={styles.logo}>
                    МойСайт
               </Link>
               <nav className={styles.nav}>
                    {user ? (
                         <>
                              <Avatar userId={user.id.toString()} size={50}/>
                              <button onClick={handleLogout} className={styles.logoutButton}>
                                   Выйти
                              </button>
                         </>
                    ) : (
                         <>
                              <Link to="/login" className={styles.link}>
                                   Войти
                              </Link>
                              <Link to="/register" className={styles.link}>
                                   Регистрация
                              </Link>
                         </>
                    )}
               </nav>
          </header>
     );
};

export default Header;
