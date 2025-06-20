import React, { useState } from "react";
import ScheduleEditor from "../../components/Schedule/ScheduleEditor";
import WorksEditor from "../../components/Works/WorksEditor";
import UserAppointmentsList from "../../components/Appointments/UserAppointmentsList";
import { RootState } from "../../store/store";
import { useSelector } from "react-redux";
import MasterEditable from "../../components/Masters/MasterEditable";
import styles from "./Profile.module.css";

const ProfilePage: React.FC = () => {
     const [activeTab, setActiveTab] = useState("appointments");
     const user = useSelector((state: RootState) => state.auth.user);

     if (!user) return null;

     const TABS = [{ id: "appointments", label: "Записи" }];

     if (user.specialization !== "user") {
          TABS.push(
               { id: "schedule", label: "Расписание" },
               { id: "works", label: "Работы" }
          );
     }

     const renderTabContent = () => {
          switch (activeTab) {
               case "appointments":
                    return <UserAppointmentsList />;
               case "schedule":
                    return <ScheduleEditor />;
               case "works":
                    return <WorksEditor />;
               default:
                    return null;
          }
     };

     return (
          <div className={styles.container}>
               <aside className={styles.sidebar}>
                    <MasterEditable masterId={user.id.toString()} />
               </aside>

               <section className={styles.mainContent}>
                    <div className={styles.tabs}>
                         {TABS.map((tab) => (
                              <button
                                   key={tab.id}
                                   onClick={() => setActiveTab(tab.id)}
                                   className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabButtonActive : ""
                                        }`}
                                   type="button"
                              >
                                   {tab.label}
                              </button>
                         ))}
                    </div>

                    <div className={styles.tabContent}>{renderTabContent()}</div>
               </section>
          </div>
     );
};

export default ProfilePage;
