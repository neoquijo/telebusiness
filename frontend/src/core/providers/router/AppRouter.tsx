import React from "react";
import { Routes, Route } from "react-router-dom";
import { RouteConfig } from "../../Module";
import PrivateRoute from "./PrivateRoute";
import DefaultLayout from "../../../Layouts/DefaultLayout/DefaultLayout";

export class AppRouter {
  private routes: RouteConfig[] = [];

  addRoutes(routes: RouteConfig[]) {
    this.routes = [...this.routes, ...routes];
  }

  getRouter(): React.FC {
    return () => (

      <Routes>
        {this.routes.map((route, index) => {
          if (route.allowedRoles) {
            return (<>
              <Route
                key={index}
                path={route.path}
                element={
                  <PrivateRoute redirectUrl={route.path} allowedRoles={route.allowedRoles}>
                    {route.layout ? <route.layout TopbarWidget={route.topWidget} Component={route.component} {...route.props} /> : <DefaultLayout Component={route.component} {...route.props} />}
                  </PrivateRoute>
                }
              >

              </Route>
              {route.subModules?.map((sub, subIndex) => (
                <Route
                  key={`${index}-${subIndex}`}
                  path={`${route.path}${sub?.path}`}
                  element={
                    <PrivateRoute
                      redirectUrl={`${route.path}${sub?.path}`}
                      allowedRoles={sub?.allowedRoles || route.allowedRoles || []}
                    >
                      {sub?.layout ? (
                        <sub.layout TopbarWidget={sub.topWidget} Component={sub.component} {...sub.props} />
                      ) : (
                        <DefaultLayout Component={sub!.component} {...sub!.props} />
                      )}
                    </PrivateRoute>
                  }
                />
              ))}


            </>
            );
          } else {
            return (<>
              <Route
                key={index}
                path={route.path}
                element={route.layout ? <route.layout TopbarWidget={route.topWidget} Component={route.component} {...route.props} /> : <DefaultLayout Component={route.component} {...route.props} />}
              />

              {route.subModules?.map((sub, index) => {
                return (
                  <Route
                    key={index}
                    path={route.path + sub?.path}
                    element={route.layout ? <route.layout TopbarWidget={sub?.topWidget} Component={sub?.component} {...sub?.props} /> : <DefaultLayout Component={sub!.component} {...sub?.props} />}
                  />

                )
              })}
            </>
            );
          }
        })}
      </Routes>

    );
  }
}
