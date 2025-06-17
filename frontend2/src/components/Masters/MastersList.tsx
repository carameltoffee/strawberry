import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { GetMasters } from "./Masters.thunks";
import { Spinner } from "../Spinner/Spinner";
import { useAppDispatch } from "../../hooks/hooks";
import { useNavigate } from "react-router-dom";

const MastersList: React.FC = () => {
     const dispatch = useAppDispatch();
     const navigate = useNavigate();

     const { mastersById, loading, error } = useSelector((state: RootState) => state.masters);

     useEffect(() => {
          dispatch(GetMasters());
     }, [dispatch]);

     return (
          <div className="p-6">
               {loading && <Spinner />}
               {!loading && error && (
                    <p className="text-red-500">Ошибка загрузки мастеров.</p>
               )}
               {!loading && !error && (!mastersById || Object.keys(mastersById).length === 0) && (
                    <p className="text-gray-500">Мастера не найдены.</p>
               )}

               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {mastersById &&
                         Object.values(mastersById).map((master: IUser) => (
                              <div
                                   key={master.id}
                                   onClick={() => navigate(`/res/${master.id}`)}
                                   className="p-4 bg-white border rounded-2xl shadow hover:shadow-lg transition cursor-pointer"
                              >
                                   <h2 className="text-lg font-semibold mb-1">{master.full_name}</h2>
                                   <p className="text-sm text-gray-600">{master.specialization}</p>
                              </div>
                         ))}
               </div>
          </div>
     );
};

export default MastersList;
