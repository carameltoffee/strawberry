import { Route, Routes } from "react-router-dom";
import { Login } from "../components/Auth/Login";
import { Register } from "../components/Auth/Register";
import MastersList from "../components/Masters/MastersList";
import Reservation from "../pages/Reservation/Reservation";
import ProfilePage from "../pages/Profile/Profile";

export const InitRoutes = () => {
     return (
          <Routes>
               <Route path="/login" element={<Login />} />
               <Route path="/register" element={<Register />} />
               <Route path="/" element={<MastersList/>}/>
               <Route path="/res/:id" element={<Reservation/>}/>
               <Route path="/me" element={<ProfilePage/>}/>
          </Routes>
     );
};
