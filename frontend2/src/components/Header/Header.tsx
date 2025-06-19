import React from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../Auth/Auth.thunks";
import { RootState } from "../../store/store";
import styles from './Header.module.css';
import Avatar from "../Avatar/Avatar";
import { useAppDispatch } from "../../hooks/hooks";
import Logo from "../../assets/logo.png"

const Header: React.FC = () => {
     const dispatch = useAppDispatch();
     const navigate = useNavigate();

     const { user, loading } = useSelector((state: RootState) => state.auth);
     if (loading) return null; 

     const handleLogout = () => {
          dispatch(logout());
          navigate("/login");
     };

     const handleProfile = () => {
          navigate("/me");
     }

     return (
          <header className={styles.header}>
               <Link to="/" className={styles.logo}>
                    <img src={Logo}/>
                    <strong>Бон Бон Записи</strong>
               </Link>
               <nav className={styles.nav}>
                    {user ? (
                         <>
                              <div onClick={handleProfile}>
                                   <Avatar userId={user.id.toString()} size={50} clickable={true}/>
                              </div>
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
