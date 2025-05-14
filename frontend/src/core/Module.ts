import React from "react";

import { IconType } from "react-icons";
import { Role } from "../types/User";

export interface Module {
  name: string;
  register(): void;
  getRoutes(): RouteConfig[];
}

export interface RouteConfig<T = any> {
  captions?: Record<string, string>
  path: string;
  topWidget?: React.FC<any>;
  title: string;
  navigable?: boolean;
  icon?: IconType;
  lazyComponent?: string;
  subModules?: Array<Omit<RouteConfig<T>, 'subModules'> | undefined>,
  component: React.ComponentType<any>;
  props?: Record<string, T>;
  allowedRoles?: Array<Role>
  layout?: React.FC<any>
}

export class BaseModule<T = any> implements Module {
  routes: RouteConfig<T>[];
  name: string;
  constructor(name: string, routes: RouteConfig<T>[]) {
    this.name = name
    this.routes = routes;
  }

  register(): void {
    console.log(`${this.name} registered`);
  }

  getRoutes(): RouteConfig[] {
    return this.routes.map(route => route);
  }
}
