import { Route, Routes } from "react-router-dom";
import { Login } from "../components/Auth/Login";
import { Register } from "../components/Auth/Register";
import MastersList from "../components/Masters/MastersList";
import Reservation from "../pages/Reservation/Reservation";
import UserAppointmentsList from "../components/Appointments/UserAppointmentsList";
import ScheduleEditor from "../components/Schedule/ScheduleEditor";
import WorksEditor from "../components/Works/WorksEditor";

export const InitRoutes = () => {
     return (
          <Routes>
               <Route path="/login" element={<Login />} />
               <Route path="/register" element={<Register />} />
               <Route path="/" element={<MastersList/>}/>
               <Route path="/res/:id" element={<Reservation/>}/>
               <Route path="/appointments" element={<UserAppointmentsList/>}/>
               <Route path="/scheduleeditor" element={<ScheduleEditor/>}/>
               <Route path="/workseditor" element={<WorksEditor/>}/>
          </Routes>
     );
};
