import React from 'react';
import styles from './welcome.module.css';

const Welcome: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Добро пожаловать!</h1>
      <p className={styles.description}>
        Это приложение поможет вам удобно отслеживать и управлять вашими записями —
        будь то визит к врачу, встреча с мастером или любая другая запись.
      </p>
      <p className={styles.secondaryText}>
        Начните с добавления новой записи или просмотра текущих.
      </p>
    </div>
  );
};

export default Welcome;
