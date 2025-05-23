// frontend/src/modules/LeadsModule/LeadsModule.ts
import { BaseModule, RouteConfig } from "../../core/Module";
import DashboardLayout from "../../Layouts/Dashboard/DashboardLayout";
import LeadDetailPage from "./Pages/LeadDetailPage";
import LeadsPage from "./Pages/LeadsPage";
import { FaUserTie } from "react-icons/fa";
import { Role } from '../../types/User';

const routes: RouteConfig[] = [
  {
    path: "/leads",
    component: LeadsPage,
    props: {},
    title: 'Лиды',
    layout: DashboardLayout,
    navigable: true,
    icon: FaUserTie,
    allowedRoles: [Role.ADMIN, Role.USER],
    subModules: [
      {
        path: "/:id",
        component: LeadDetailPage,
        props: {},
        title: 'Детали лида',
        layout: DashboardLayout,
        navigable: false,
        allowedRoles: [Role.ADMIN, Role.USER],
      }
    ]
  },
]

export const leadsModule = new BaseModule('leadsModule', routes);
