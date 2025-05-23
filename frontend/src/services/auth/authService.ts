import { authApi } from "../../API/authApi"
import { mainStore } from "../../core/store/MainStore";
import { authSlice } from "../../core/store/slices/authSlice"
import { toast } from "react-toastify";
import { Role } from '../../types/User';

// Дебаунс переменные для снижения нагрузки
let lastAuthCheck = 0;
let cachedResult: boolean | null = null;

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

      // Дебаунс проверки - не чаще чем раз в 10 секунд
      const now = Date.now();
      if (now - lastAuthCheck < 10000 && cachedResult !== null) {
        return cachedResult;
      }
      
      this.setToken(token);
      lastAuthCheck = now;
      
      // Использование стандартного initiate без лишних параметров
      const result = await mainStore.dispatch(authApi.endpoints.checkAuth.initiate(token));
      
      if ('error' in result) {
        mainStore.dispatch(authSlice.actions.setAuth(false))
        mainStore.dispatch(authSlice.actions.setUser(undefined))
        this.removeToken()
        
        // Запоминаем результат для дебаунса
        cachedResult = false;
        return false;
      } else if (result.data) {
        // Проверяем, что ответ содержит данные пользователя
        mainStore.dispatch(authSlice.actions.setUser(result.data))
        mainStore.dispatch(authSlice.actions.setAuth(true))
        
        // Запоминаем результат для дебаунса
        cachedResult = true;
        return true;
      } else {
        mainStore.dispatch(authSlice.actions.setAuth(false))
        mainStore.dispatch(authSlice.actions.setUser(undefined))
        this.removeToken()
        
        // Запоминаем результат для дебаунса
        cachedResult = false;
        return false;
      }
    } catch (error) {
      console.error('Authentication error:', error)
      mainStore.dispatch(authSlice.actions.setAuth(false))
      mainStore.dispatch(authSlice.actions.setUser(undefined))
      this.removeToken()
      
      // Запоминаем результат для дебаунса
      cachedResult = false;
      return false;
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
    const isAdmin = user.role === Role.ADMIN;
    const hasAllowedRole = allowedRoles.includes(user.role);
    
    console.log(`User: ${user.login}, Role: ${user.role}, isAdmin: ${isAdmin}, hasAllowedRole: ${hasAllowedRole}`);
    
    // Админ всегда имеет доступ + проверка на наличие разрешенной роли
    return isAdmin || hasAllowedRole;
  }
}

export const authService = new AuthService()