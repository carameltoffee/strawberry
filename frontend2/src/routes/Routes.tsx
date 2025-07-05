import { Route, Routes } from "react-router-dom";
import { Login } from "../components/Auth/Login";
import { Register } from "../components/Auth/Register";
import Reservation from "../pages/Reservation/Reservation";
import ProfilePage from "../pages/Profile/Profile";
import MainPage from "../pages/Main/Main";
import { Restore } from "../components/Auth/Restore";

export const InitRoutes = () => {
     return (
          <Routes>
               <Route path="/login" element={<Login />} />
               <Route path="/register" element={<Register />} />
               <Route path="/" element={<MainPage/>}/>
               <Route path="/res/:id" element={<Reservation/>}/>
               <Route path="/me" element={<ProfilePage/>}/>
               <Route path="/restore" element={<Restore/>}/>
          </Routes>
     );
};
