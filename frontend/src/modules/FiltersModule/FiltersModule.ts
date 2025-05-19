// src/modules/FiltersModule/FiltersModule.ts
import { BaseModule, RouteConfig } from "../../core/Module";
import DashboardLayout from "../../Layouts/Dashboard/DashboardLayout";
import { FaFilter } from "react-icons/fa";
import FiltersPage from "./pages/FiltersPage";
// import CreateFilterPage from "./pages/CreateFilterPage";
// import FilterDetailPage from "./pages/FilterDetailPage";
import BackToFilters from "./components/widgets/BackToFilters";
import FilterDetailPage from "./pages/FilterDetailPage";
import CreateFilterPage from "./pages/CreateFilterPage";

const routes: RouteConfig[] = [
  {
    path: "/filters",
    component: FiltersPage,
    props: {},
    title: 'Фильтры',
    layout: DashboardLayout,
    navigable: true,
    icon: FaFilter,
    allowedRoles: ['admin'],
    subModules: [
      {
        path: "/create",
        component: CreateFilterPage,
        props: {},
        title: 'Создать фильтр',
        layout: DashboardLayout,
        topWidget: BackToFilters,
        navigable: false,
        allowedRoles: ['admin'],
      },
      {
        path: "/:id",
        component: FilterDetailPage,
        props: {},
        title: 'Детали фильтра',
        layout: DashboardLayout,
        topWidget: BackToFilters,
        navigable: false,
        allowedRoles: ['admin'],
      }
    ]
  },
];

export const filtersModule = new BaseModule('filtersModule', routes);