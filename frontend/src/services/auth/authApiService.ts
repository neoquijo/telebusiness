// import { authApi } from "../../API/authApi";
// import { mainStore } from "../../core/store/MainStore";

// class AuthApiService {
//   async checkAuth(token: string): Promise<any> {
//     const {data:result} = await authApi.endpoints.checkAuth.initiate(token);
//     return result.data;
//   }

//   async login(credentials: { username: string; password: string }): Promise<any> {
//     const { data: result } = await mainStore.dispatch(authApi.endpoints.login.initiate(credentials));
//     console.log(result)
//     return result?.data;
//   }

//   async logout(): Promise<void> {
//     //Техдолг: Написать на бэке удаление рефреш тоцена
//   }
// }

// export const authApiService = new AuthApiService();
