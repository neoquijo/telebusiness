import { BaseModule, RouteConfig } from "../../core/Module";
import DashboardLayout from "../../Layouts/Dashboard/DashboardLayout";
import BackToAccounts from "./Components/Widgets/BackToChatsWidget";
import AccountDialogsPage from "./Pages/AccountDialogsPage";
import AccountsPage from "./Pages/AccountsPage";
import { FaKey } from "react-icons/fa6";


const routes: RouteConfig[] = [
  {
    path: "/",
    component: AccountsPage,
    props: {},
    title: 'Аккаунты',
    layout: DashboardLayout,
    navigable: true,
    icon: FaKey,
    allowedRoles: ['admin'],
    subModules: [
      {
        path: "/accountChats/:id",
        component: AccountDialogsPage,
        props: {},
        title: 'Аккаунты',
        layout: DashboardLayout,
        topWidget: BackToAccounts,
        navigable: false,
        icon: FaKey,
        allowedRoles: ['admin'],
      }
    ]
    // subModules: [
    //   {
    //     path: "/admin",
    //     component: ShiftsAdmin,
    //     props: {},
    //     title: 'Смена',
    //     layout: DashboardLayout,
    //     navigable: false,
    //     icon: TiMediaPlay,
    //     allowedRoles: ['admin'],
    //     topWidget: ShiftsAdminWidget,
    //   },
    // ]
  },
]


export const accountsModule = new BaseModule('accountsModule', routes)