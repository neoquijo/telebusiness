// src/modules/MessagesModule/MessagesModule.ts
import { BaseModule, RouteConfig } from "../../core/Module";
import DashboardLayout from "../../Layouts/Dashboard/DashboardLayout";
import { FaEnvelope } from "react-icons/fa";
import MessagesPage from "./pages/MessagesPage";
import FilteredMessagesPage from "./pages/FilteredMessagePage";
import MessageStatisticsPage from "./pages/MessageStatisticsPage";
import { Role } from '../../types/User';

// import FilteredMessagesPage from "./pages/FilteredMessagesPage";
// import MessageStatisticsPage from "./pages/MessageStatisticsPage";

const routes: RouteConfig[] = [
  {
    path: "/messages",
    component: MessagesPage,
    props: {},
    title: 'Сообщения',
    layout: DashboardLayout,
    navigable: true,
    icon: FaEnvelope,
    allowedRoles: [Role.ADMIN],
    subModules: [
      {
        path: "/filtered",
        component: FilteredMessagesPage,
        props: {},
        title: 'Отфильтрованные сообщения',
        layout: DashboardLayout,
        navigable: false,
        allowedRoles: [Role.ADMIN],
      },
      {
        path: "/statistics",
        component: MessageStatisticsPage,
        props: {},
        title: 'Статистика сообщений',
        layout: DashboardLayout,
        navigable: false,
        allowedRoles: [Role.ADMIN],
      }
    ]
  },
];

export const messagesModule = new BaseModule('messagesModule', routes);