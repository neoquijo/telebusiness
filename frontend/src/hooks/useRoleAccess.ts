import { useCallback } from 'react';
import { useAppSelector } from '../core/store/MainStore';

/**
 * Хук для проверки доступа пользователя на основе ролей
 * @returns Объект с методами для проверки ролей и авторизации
 */
export const useRoleAccess = () => {
  const { user, isAuth } = useAppSelector(state => state.auth);

  /**
   * Проверяет, имеет ли пользователь любую из перечисленных ролей
   * @param allowedRoles - Массив разрешенных ролей
   * @returns true, если у пользователя есть хотя бы одна из разрешенных ролей или он является админом
   */
  const hasRole = useCallback((allowedRoles: string[]): boolean => {
    // Если пользователь не авторизован или нет данных о пользователе
    if (!isAuth || !user || !user.role) {
      return false;
    }

    // Проверка на админа (админы имеют доступ ко всему)
    if (user.role === 'admin') {
      return true;
    }

    // Проверка роли пользователя среди разрешенных
    return allowedRoles.includes(user.role);
  }, [isAuth, user]);

  /**
   * Проверяет, авторизован ли пользователь
   * @returns true, если пользователь авторизован
   */
  const isAuthenticated = useCallback((): boolean => {
    return isAuth && !!user;
  }, [isAuth, user]);

  return {
    hasRole,
    isAuthenticated,
    userRole: user?.role || null
  };
}; 