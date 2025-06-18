import React, { useState } from "react";
import ScheduleEditor from "../../components/Schedule/ScheduleEditor";
import WorksEditor from "../../components/Works/WorksEditor";
import UserAppointmentsList from "../../components/Appointments/UserAppointmentsList";
import { RootState } from "../../store/store";
import { useSelector } from "react-redux";
import MasterEditable from "../../components/Masters/MasterEditable";


const TABS = [
     { id: "appointments", label: "Appointments" },
     { id: "schedule", label: "Schedule Editor" },
     { id: "works", label: "Works Editor" },
];

const ProfilePage: React.FC = () => {
     const [activeTab, setActiveTab] = useState("appointments");
     const user = useSelector((state: RootState) => state.auth.user);

     if(!user) { return }

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
          <div className="max-w-4xl mx-auto p-6 space-y-6">
               <MasterEditable masterId={user.id.toString()}/>

               <div>
                    <div className="flex space-x-4 border-b pb-2">
                         {TABS.map((tab) => (
                              <button
                                   key={tab.id}
                                   onClick={() => setActiveTab(tab.id)}
                                   className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${activeTab === tab.id
                                             ? "bg-blue-500 text-white"
                                             : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                              >
                                   {tab.label}
                              </button>
                         ))}
                    </div>

                    <div className="mt-4">{renderTabContent()}</div>
               </div>
          </div>
     );
};

export default ProfilePage;
