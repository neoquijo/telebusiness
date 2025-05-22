import { BaseModule, RouteConfig } from "../../core/Module";

import AuthPage from "../../pages/auth/AuthPage";
import LoginPage from "../../pages/auth/LoginPage";
import UnauthorizedPage from "../../pages/unauthorized/UnauthorizedPage";

const routes: RouteConfig[] = [{
  path: "/auth",
  component: AuthPage,
  props: {},
  title: "auth"
},
{
  path: "/login",
  component: LoginPage,
  title: "Login"
},
{
  path: "/unauthorized",
  component: UnauthorizedPage,
  title: "Доступ запрещен"
}]

export const authModule = new BaseModule('authModule', routes)

// export class AuthModule extends BaseModule {
//   constructor(routes: RouteConfig[]) {
//     super(routes)
//     this.token = mainStore.getState().auth.token
//   }
//   token: string | null
//   name = "AuthModule";
//   getRoutes(): RouteConfig[] {
//     return [
//       ...this.routes.map(route => route)
//     ];
//   }
// }

// export const authModule = new AuthModule(routes)
