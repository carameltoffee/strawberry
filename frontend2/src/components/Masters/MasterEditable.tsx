import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { GetMasterById, UpdateMaster } from "./Masters.thunks";
import Avatar from "../Avatar/Avatar";
import { useAppDispatch } from "../../hooks/hooks";
import styles from "./Master.module.css";
import { setErrorAlert } from "../Alert/Alert.thunks";

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
     const token = useSelector((state: RootState) => state.auth.token);

     const [form, setForm] = useState({
          id: 0,
          full_name: "",
          bio: "",
          username: "",
          email: "",
          specialization: "",
          registered_at: "",
     });

     useEffect(() => {
          if (!master) {
               dispatch(GetMasterById(masterId));
          } else {
               setForm({
                    id: Number(masterId),
                    full_name: master.full_name || "",
                    bio: master.bio || "",
                    username: master.username || "",
                    email: master.email || "",
                    specialization: master.specialization || "",
                    registered_at: master.registered_at,
               });
          }
     }, [dispatch, masterId, master]);

     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          setForm({ ...form, [e.target.name]: e.target.value });
     };

     const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          if (!token) {
               dispatch(setErrorAlert("Вы не авторизованы"));
               return;
          }
          dispatch(UpdateMaster(form, token));
     };

     if (isLoading) return <div>Загрузка мастера...</div>;
     if (error || !master) return <div>Ошибка: {error}</div>;

     return (
          <div className={styles.container}>
               <Avatar userId={masterId} editable={true} />
               <form onSubmit={handleSubmit} className={styles.form}>
                    <label>
                         Имя:
                         <input name="full_name" value={form.full_name} onChange={handleChange} />
                    </label>
                    <label>
                         Логин:
                         <input name="username" value={form.username} onChange={handleChange} />
                    </label>
                    <label>
                         Почта:
                         <input name="email" value={form.email} onChange={handleChange} />
                    </label>
                    <label>
                         Специализация:
                         <input name="specialization" value={form.specialization} onChange={handleChange} />
                    </label>
                    <button type="submit">Сохранить</button>
               </form>
               <p><strong>Зарегистрирован:</strong> {new Date(master.registered_at).toLocaleDateString()}</p>
          </div>
     );
};

export default MasterEditable;
