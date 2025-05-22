import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../../store/MainStore";
import { useDispatch } from "react-redux";
import { setAuth, setUser } from "../../store/slices/authSlice";
import { validateToken } from "../../../utils/tokenValidator";

interface PrivateRouteProps {
  allowedRoles: string[]
  redirectPath?: string;
  redirectUrl: string;
  children: React.ReactNode;
  props?: any
}

// Глобальная переменная для отслеживания маршрутов
let lastPathChecked = "";
let isCurrentlyChecking = false;

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const { user, isAuth } = useAppSelector(s => s.auth)
  const location = useLocation()
  const dispatch = useDispatch()
  const [isChecking, setIsChecking] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);
  const currentPath = location.pathname;

  // Выполняем проверку только при смене маршрута и не чаще 1 раза в 30 секунд
  useEffect(() => {
    // Если проверка уже выполняется, не запускаем еще одну
    if (isCurrentlyChecking) return;

    // Проверяем только при смене маршрута
    if (currentPath === lastPathChecked) return;
    
    const checkAccess = async () => {
      // Установка флага проверки
      isCurrentlyChecking = true;
      setIsChecking(true);
      
      try {
        const token = localStorage.getItem('token');
        
        // Простая проверка на наличие токена
        if (!token) {
          dispatch(setAuth(false));
          dispatch(setUser(undefined));
          setHasAccess(false);
          lastPathChecked = currentPath;
          return;
        }
        
        // Проверка валидности токена (происходит редко благодаря дебаунсу)
        const isTokenValid = await validateToken(token);
        
        // Если токен недействителен
        if (!isTokenValid) {
          dispatch(setAuth(false));
          dispatch(setUser(undefined));
          setHasAccess(false);
          lastPathChecked = currentPath;
          return;
        }
        
        // Если пользователь есть и у него есть роль, проверяем доступ
        if (user && user.role) {
          const roleMatches = allowedRoles.length === 0 || 
            user.role === 'admin' || 
            allowedRoles.includes(user.role);
          
          setHasAccess(roleMatches);
        } else {
          // Если пользователя нет, считаем что доступа нет
          setHasAccess(false);
        }
      } finally {
        // Сброс флага проверки и сохранение проверенного пути
        isCurrentlyChecking = false;
        setIsChecking(false);
        lastPathChecked = currentPath;
      }
    };
    
    checkAccess();
  }, [currentPath, dispatch, allowedRoles, user]);

  // Если проверка все еще в процессе при первоначальном монтировании
  if (isChecking && lastPathChecked !== currentPath) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Проверка доступа...
      </div>
    );
  }

  // Если нет авторизации вообще
  if (!isAuth || !user) {
    const returnTo = location.pathname + location.search;
    return <Navigate to={`/auth?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }

  // Если нет доступа по ролям
  if (!hasAccess) {
    return <Navigate to={'/unauthorized'} replace />;
  }

  // Если все проверки пройдены
  return <>{children}</>;
};

export default PrivateRoute;