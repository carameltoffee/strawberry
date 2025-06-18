import { ThunkAction } from "redux-thunk";
import { RootState } from "../../store/store";
import {
     AvatarActionTypes,
     uploadAvatarRequest,
     uploadAvatarSuccess,
     uploadAvatarFailure,
} from "./Avatar.actions";

export type AppThunk<ReturnType = void> = ThunkAction<
     ReturnType,
     RootState,
     unknown,
     AvatarActionTypes
>;

export const uploadAvatar =
     (file: File, token: string): AppThunk =>
          async (dispatch) => {
               dispatch(uploadAvatarRequest());

               try {
                    const formData = new FormData();
                    formData.append("avatar", file);

                    const response = await fetch(`${__BASE_API_URL__}/users/avatar`, {
                         method: "POST",
                         headers: {
                              Authorization: `Bearer ${token}`,
                         },
                         body: formData,
                    });

                    if (!response.ok) {
                         const data = await response.json();
                         throw new Error(data.error || "Ошибка загрузки аватара");
                    }

                    dispatch(uploadAvatarSuccess());
               } catch (error) {
                    dispatch(uploadAvatarFailure(error instanceof Error ? error.message : "Неизвестная ошибка"));
               }
          };
