import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './header.module.css';

type Props = {
     title: string;
     isAuthenticated: boolean;  
};

const Header: React.FC<Props> = ({ title, isAuthenticated }) => {
     const [menuOpen, setMenuOpen] = useState(false);
     const navigate = useNavigate();

     const toggleMenu = () => {
          setMenuOpen(prev => !prev);
     };

     const handleRegisterClick = () => {
          navigate('/auth?mode=register');
     };

     const handleLoginClick = () => {
          navigate('/auth?mode=login');
     };

     const handleLogoutClick = () => {
          localStorage.removeItem('token');
          navigate('/');
     };

     return (
          <header className={styles.header}>
               <button className={styles.menu} onClick={toggleMenu}>☰</button>
               <div className={styles.logo}>{title}</div>
               <nav className={`${styles.nav} ${menuOpen ? styles.active : ''}`}>
                    {!isAuthenticated ? (
                         <>
                              <button className={styles.register} onClick={handleRegisterClick}>Регистрация</button>
                              <button className={styles.login} onClick={handleLoginClick}>Вход</button>
                         </>
                    ) : (
                         <button className={styles.logout} onClick={handleLogoutClick}>Выход</button>
                    )}
               </nav>
          </header>
     );
};

export default Header;
