import { FaPlay } from "react-icons/fa6";
import { BaseModule, RouteConfig } from "../../core/Module";
import DashboardLayout from "../../Layouts/Dashboard/DashboardLayout";
import TasksPage from "./pages/TasksPage";
import { Role } from '../../types/User';


const routes: RouteConfig[] = [
  {
    path: "/tasks",
    component: TasksPage,
    props: {},
    title: 'Залачи',
    layout: DashboardLayout,
    navigable: true,
    icon: FaPlay,
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


export const tasksModule = new BaseModule('tasksModule', routes)