import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';

// Предположим, у вас есть такой хук или способ получить данные аутентификации
// import { useAuth } from '../hooks/useAuth'; // Замените на ваш реальный путь

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const location = useLocation();
  // const { isAuthenticated, userRoles } = useAuth(); // Пример использования хука
  
  // Используем более надежный способ проверки аутентификации
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;
  
  // Получаем роли пользователя из localStorage или из Redux store (предпочтительнее)
  const userRolesString = localStorage.getItem('roles') || '[]';
  let userRoles: string[] = [];
  
  try {
    userRoles = JSON.parse(userRolesString);
  } catch (error) {
    console.error('Failed to parse user roles:', error);
  }

  if (!isAuthenticated) {
    // Сохраняем полный путь включая search параметры
    const returnTo = location.pathname + (location.search || '');
    return <Navigate to={`/auth?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasRequiredRole = userRoles.some(role => allowedRoles.includes(role));
    if (!hasRequiredRole) {
      // Сохраняем путь для возможного возврата после получения нужной роли
      const returnTo = location.pathname + (location.search || '');
      return <Navigate to={`/unauthorized?from=${encodeURIComponent(returnTo)}`} replace />;
    }
  }

  return <Outlet />; // Или рендерим дочерние компоненты: children
};

export default ProtectedRoute; 