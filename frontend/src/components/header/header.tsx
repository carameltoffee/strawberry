import React, { useState } from "react";
import styles from "./header.module.css";
// import { Link } from "react-router-dom";

type Props = {
     title: string;
     isAuthenticated: boolean;
     onLogout: () => void;
};

const Header: React.FC<Props> = ({ title, isAuthenticated, onLogout }) => {
     const [menuOpen, setMenuOpen] = useState(false);

     const toggleMenu = () => {
          setMenuOpen((prev) => !prev);
     };

     const handleLogoutClick = () => {
          onLogout();
     };

     return (
          <header className={styles.header}>
               <button className={styles.menu} onClick={toggleMenu}>
                    ☰
               </button>
               <div className={styles.logo}>
                    <a href="/" className={styles.logoLink}>{title}</a>
               </div>
               <nav className={`${styles.nav} ${menuOpen ? styles.active : ""}`}>
                    {!isAuthenticated ? (
                         <>
                              <button
                                   className={styles.register}
                                   onClick={() => {
                                        window.location.href = "/auth/register";
                                   }}
                              >
                                   Регистрация
                              </button>
                              <button
                                   className={styles.login}
                                   onClick={() => {
                                        window.location.href = "/auth/login";
                                   }}
                              >
                                   Вход
                              </button>
                         </>
                    ) : (
                         <>
                              <button className={styles.logout} onClick={handleLogoutClick}>
                                   Выход
                              </button>
                              <button
                                   className={styles.profile}
                                   onClick={() => {
                                        window.location.href = "/user";
                                   }}
                              >
                                   Мой профиль
                              </button>
                         </>
                    )}
               </nav>
          </header>
     );
};

export default Header;
