import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../../store/MainStore";
import { useDispatch } from "react-redux";
import { setAuth, setUser } from "../../store/slices/authSlice";
import { authService } from "../../../services/auth/authService";

interface PrivateRouteProps {
  allowedRoles: string[]
  redirectPath?: string;
  redirectUrl: string;
  children: React.ReactNode;
  props?: any
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const { user, isAuth } = useAppSelector(s => s.auth)
  const location = useLocation()
  const dispatch = useDispatch()

  // Проверяем токен при каждом рендере защищенного маршрута
  useEffect(() => {
    const checkTokenValidity = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const isValid = await authService.checkAuth(token);
        if (!isValid) {
          // Если токен невалидный, очищаем состояние
          dispatch(setAuth(false));
          dispatch(setUser(undefined));
        }
      } else if (isAuth) {
        // Если токена нет, но пользователь помечен как авторизованный
        dispatch(setAuth(false));
        dispatch(setUser(undefined));
      }
    };
    
    checkTokenValidity();
  }, [dispatch, isAuth]);

  // Если пользователь не аутентифицирован, перенаправляем на страницу авторизации
  if (!isAuth || !user) {
    // Сохраняем весь путь с параметрами поиска для возврата после авторизации
    const returnTo = location.pathname + location.search;
    return <Navigate to={`/auth?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }

  // Проверяем права доступа на основе ролей
  const hasAccess = allowedRoles.some((role) => user?.role === role || user?.role === 'admin');
  if (!hasAccess) {
    // Пользователь аутентифицирован, но нет доступа к странице
    return <Navigate to={'/unauthorized'} replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;