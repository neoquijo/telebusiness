import { BaseModule, RouteConfig } from "../../core/Module";
import DashboardLayout from "../../Layouts/Dashboard/DashboardLayout";
import { IoMdChatboxes } from "react-icons/io";
// import ChatPage from "./Pages/ChatPage";
import DialogsPage from "./Pages/DialogsPage";
import { Role } from '../../types/User';


const routes: RouteConfig[] = [
  {
    path: "/chats",
    component: DialogsPage,
    props: {},
    title: 'Чаты',
    layout: DashboardLayout,
    navigable: true,
    icon: IoMdChatboxes,
    allowedRoles: [Role.ADMIN],
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


export const dialogsModule = new BaseModule('dialogsModule', routes)