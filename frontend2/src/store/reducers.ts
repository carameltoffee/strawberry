import { combineReducers } from "@reduxjs/toolkit";
import { authReducer } from "../components/Auth/Auth.reducers";
import { alertReducer } from "../components/Alert/Alert.reducers";
import { mastersReducer } from "../components/Masters/Masters.reducers";
import { scheduleReducer } from "../components/Schedule/Schedule.reducers";
import { worksReducer } from "../components/Works/Works.reducers";
import { reviewsReducer } from "../components/Reviews/Reviews.reducers";
import { appointmentsReducer } from "../components/Appointments/Appointments.reducers";
import { avatarReducer } from "../components/Avatar/Avatar.reducers";
import { userSearchReducer } from "../components/Search/Search.reducers";

export const RootReducer = combineReducers({
     auth: authReducer,
     alert: alertReducer,
     masters: mastersReducer,
     schedule: scheduleReducer,
     works: worksReducer,
     reviews: reviewsReducer,
     appointments: appointmentsReducer,
     avatar: avatarReducer,
     search: userSearchReducer,
});