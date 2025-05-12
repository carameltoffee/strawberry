import React, { useState } from 'react';
import styles from './header.module.css';


type Props = {
     title: string;
};

const Header: React.FC<Props> = ({title}) => {
     const [menuOpen, setMenuOpen] = useState(false);

     const toggleMenu = () => {
          setMenuOpen(prev => !prev);
     };

     return (
          <header className={styles.header}>
               <button className={styles.menu} onClick={toggleMenu}>☰</button>
               <div className={styles.logo}>{title}</div>
               <nav className={`${styles.nav} ${menuOpen ? styles.active : ''}`}>
                    <button className={styles.register}>Регистрация</button>
                    <button className={styles.login}>Вход</button>
               </nav>
          </header>
     );
};

export default Header;
