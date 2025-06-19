import { RootState } from "../../store/store";
import {
     userSearchRequest,
     userSearchSuccess,
     userSearchFailure,
     UserSearchActionTypes,
} from "./Search.actions";
import { setErrorAlert } from "../Alert/Alert.thunks";
import { ThunkAction } from "redux-thunk";

export type AppThunk<ReturnType = void> = ThunkAction<
     ReturnType,
     RootState,
     unknown,
     UserSearchActionTypes
>;

export const searchUsers =
     (query: string): AppThunk =>
          async (dispatch) => {
               dispatch(userSearchRequest());

               try {
                    const response = await fetch(`${__BASE_API_URL__}/search?key=${encodeURIComponent(query)}`);
                    if (!response.ok) {
                         const data = await response.json();
                         throw new Error(data.error || "Ошибка при поиске пользователей");
                    }

                    const users: IUser[] = await response.json();
                    dispatch(userSearchSuccess(users));
               } catch (error) {
                    if (error instanceof Error) {
                         dispatch(userSearchFailure(error.message));
                         dispatch(setErrorAlert(error.message));
                    }
               }
          };
