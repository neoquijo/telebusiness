import { BaseModule, RouteConfig } from "../../core/Module";
import DashboardLayout from "../../Layouts/Dashboard/DashboardLayout";
import { IoMdChatboxes } from "react-icons/io";
import ChatPage from "./Pages/ChatPage";


const routes: RouteConfig[] = [
  {
    path: "/chats",
    component: ChatPage,
    props: {},
    title: 'Чаты',
    layout: DashboardLayout,
    navigable: true,
    icon: IoMdChatboxes,
    allowedRoles: ['admin'],
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