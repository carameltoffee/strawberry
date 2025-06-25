import React from "react";
import styles from "./WorkPreview.module.css";

type WorkPreviewProps = {
     imageUrl: string;
     onClose: () => void;
};

const WorkPreview: React.FC<WorkPreviewProps> = ({ imageUrl, onClose }) => {
     return (
          <div className={styles.overlay} onClick={onClose}>
               <div className={styles.previewContent}>
                    <img src={imageUrl} alt="Предпросмотр работы" className={styles.previewImage} />
                    <button className={styles.closeButton} onClick={onClose} aria-label="Закрыть">
                         ×
                    </button>
               </div>
          </div>
     );
};

export default WorkPreview;
