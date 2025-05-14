import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../../store/MainStore";
import { useDispatch } from "react-redux";
import { setAuth, setUser } from "../../store/slices/authSlice";
import { Role } from "../../../types/User";

interface PrivateRouteProps {
  allowedRoles: Role[]
  redirectPath?: string;
  redirectUrl: string;
  children: React.ReactNode;
  props?: any
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const { user } = useAppSelector(s => s.auth)
  const location = useLocation()
  const dispatch = useDispatch()



  const hasAccess = allowedRoles.some((role) => user?.role == role || user?.role == 'admin');
  if (!hasAccess) {
    // localStorage.removeItem('token')
    dispatch(setAuth(false))
    dispatch(setUser(undefined))
    return <Navigate to={'/auth?to=' + location.pathname} replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;