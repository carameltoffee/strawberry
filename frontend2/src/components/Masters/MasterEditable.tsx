import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { GetMasterById } from "./Masters.thunks";
import Avatar from "../Avatar/Avatar";
import { useAppDispatch } from "../../hooks/hooks";
import styles from "./Master.module.css";

type MasterProps = {
     masterId: string;
};

const MasterEditable: React.FC<MasterProps> = ({ masterId }) => {
     const dispatch = useAppDispatch();

     const master = useSelector(
          (state: RootState) => state.masters.mastersById[masterId]
     );
     const isLoading = useSelector((state: RootState) => state.masters.loading);
     const error = useSelector((state: RootState) => state.masters.error);
     
     useEffect(() => {
          if (!master) {
               dispatch(GetMasterById(masterId));
          }
     }, [dispatch, masterId, master]);

     if (isLoading) return <div>Загрузка мастера...</div>;
     if (error || !master) return <div style={{ color: "red" }}>Ошибка: {error}</div>;

     return (
          <div className={styles.container}>
               <Avatar userId={masterId} editable={true} />
               <h1>{master.full_name}</h1>
               <p><strong>Username:</strong> {master.username}</p>
               {master.specialization && (
                    <p><strong>Специализация:</strong> {master.specialization}</p>
               )}
               <p><strong>Зарегистрирован:</strong> {new Date(master.registered_at).toLocaleDateString()}</p>
          </div>
     );
};

export default MasterEditable;
