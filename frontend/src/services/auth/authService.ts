import { authApi } from "../../API/authApi"
import { mainStore } from "../../core/store/MainStore";
import { authSlice } from "../../core/store/slices/authSlice"
import { toast } from "react-toastify";

export class AuthService {
  // private token: string | undefined | null;
  // constructor() {
  //   this.token = localStorage.getItem('token')
  // }
  // async getInitialUser() {
  //   if (this.token) {
  //     const result = await mainStore.dispatch(authApi.endpoints.checkAuth.initiate(this.token))
  //     if (result.isSuccess) {
  //       mainStore.dispatch(setAuth(true))
  //       return result.data.data
  //     }
  //     if (result.isError) {
  //       alert('error')
  //       mainStore.dispatch(setAuth(false))
  //       return null
  //     }
  //   }
  //   else {
  //     return null
  //   }
  // }

  private setToken(token: string) {
    localStorage.setItem('token', token)
  }

  private removeToken() {
    localStorage.removeItem('token')
  }

  async logout() {
    mainStore.dispatch(authSlice.actions.logOut())
    this.removeToken()
    // Дополнительно добавляем уведомление
    toast.info('Вы вышли из системы')
  }

  async checkAuth(token: string | undefined): Promise<boolean> {
    try {
      if (!token) {
        mainStore.dispatch(authSlice.actions.setAuth(false))
        mainStore.dispatch(authSlice.actions.setUser(undefined))
        return false
      }
      
      this.setToken(token)
      const apiCall = authApi.endpoints.checkAuth.initiate(token);
      const result = await mainStore.dispatch(apiCall);
      const { isError, data: response, error } = result;

      if (isError) {
        mainStore.dispatch(authSlice.actions.setAuth(false))
        mainStore.dispatch(authSlice.actions.setUser(undefined))
        this.removeToken()
        // @ts-ignore
        const errorMessage = error?.data?.message || 'Ошибка проверки авторизации'
        toast.error(errorMessage)
        return false
      } else {
        // Проверяем, что ответ содержит данные пользователя
        if (response) {
          console.log("User data received:", response);
          mainStore.dispatch(authSlice.actions.setUser(response))
          mainStore.dispatch(authSlice.actions.setAuth(true))
          return true
        } else {
          mainStore.dispatch(authSlice.actions.setAuth(false))
          mainStore.dispatch(authSlice.actions.setUser(undefined))
          this.removeToken()
          toast.error('Ошибка получения данных пользователя')
          return false
        }
      }
    } catch (error) {
      console.error('Authentication error:', error)
      mainStore.dispatch(authSlice.actions.setAuth(false))
      mainStore.dispatch(authSlice.actions.setUser(undefined))
      this.removeToken()
      toast.error('Непредвиденная ошибка авторизации')
      return false
    }
  }

  // Метод для проверки роли пользователя
  hasRole(allowedRoles: string[]): boolean {
    const user = mainStore.getState().auth.user;
    
    // Проверяем, что пользователь существует и у него есть роль
    if (!user || !user.role) {
      console.log("User or user role is undefined", user);
      return false;
    }
    
    // Проверяем, является ли пользователь админом или имеет одну из разрешенных ролей
    const isAdmin = user.role === 'admin';
    const hasAllowedRole = allowedRoles.includes(user.role);
    
    console.log(`User: ${user.login}, Role: ${user.role}, isAdmin: ${isAdmin}, hasAllowedRole: ${hasAllowedRole}`);
    
    return isAdmin || hasAllowedRole;
  }
}

export const authService = new AuthService()