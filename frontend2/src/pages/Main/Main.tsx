import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import TodaySchedule from "../../components/Schedule/TodaySchedule";
import MastersList from "../../components/Masters/MastersList";

const MainPage: React.FC = () => {
     const user = useSelector((state: RootState) => state.auth.user);
     const isMaster = !(user?.specialization === "user");

     return (
          <div>
               {isMaster && user?.id && (
                    <section>
                         <TodaySchedule userId={user.id.toString()} />
                    </section>
               )}

               <section>
                    <MastersList />
               </section>
          </div>
     );
};

export default MainPage;
