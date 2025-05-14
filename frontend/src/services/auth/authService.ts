import { authApi } from "../../API/authApi"
import { mainStore } from "../../core/store/MainStore";
import { authSlice } from "../../core/store/slices/authSlice"

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

  async logout() {
    mainStore.dispatch(authSlice.actions.logOut())
    localStorage.removeItem('token')
  }

  async checkAuth(token: string | undefined) {
    try {
      if (token) {
        this.setToken('token')
        localStorage.setItem('token', token)
        const { isError, data: response } = await mainStore.dispatch(authApi.endpoints.checkAuth.initiate(token))

        if (isError) {
          mainStore.dispatch(authSlice.actions.setAuth(false))
          mainStore.dispatch(authSlice.actions.setUser(undefined))
          alert('backenderror')
          return false
        }
        else {
          mainStore.dispatch(authSlice.actions.setUser(response))
          mainStore.dispatch(authSlice.actions.setAuth(true))
          return true
        }
      }


    } catch (error) {
      console.log(error)
      alert('error!!!')
    }
  }
}

export const authService = new AuthService()