import React, { FC, useState, useEffect } from 'react';
import css from './Navbar.module.css';
import { ModuleRegistry } from '../../../../core/Registry';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoMdExit } from 'react-icons/io';
import { authService } from '../../../../services/auth/authService';
import { useAppSelector } from '../../../../core/store/MainStore';
import { useMediaQuery } from '../../../../hooks/useMediaQuery';
import { FaTimes } from 'react-icons/fa';
import { Role } from '../../../../types/User';

// Избегаем частой проверки токена - делаем это только при монтировании компонента
let navbarMounted = false;

interface IProps { 
  onClose?: () => void;
}

const Sidebar: FC<IProps> = ({ onClose }) => {
  const routes = ModuleRegistry.getInstance().getAllRoutes()
  const [title, setTitle] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuth } = useAppSelector(s => s.auth)
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Проверяем токен только ОДИН раз при монтировании компонента
  useEffect(() => {
    // Если проверка уже была выполнена, не запускаем ее снова
    if (navbarMounted) return;
    
    const validateSession = async () => {
      const token = localStorage.getItem('token');
      
      // Простая проверка - если в состоянии есть авторизация, но нет токена
      if (isAuth && !token) {
        authService.logout();
        navigate('/auth');
      }
      
      // Отмечаем, что проверка была выполнена 
      navbarMounted = true;
    };
    
    validateSession();
  }, [navigate, isAuth]);

  // Фильтруем маршруты для отображения только доступных текущему пользователю
  const filteredRoutes = routes.filter(route => {
    // Если маршрут не должен отображаться в навигации, сразу пропускаем
    if (!route.navigable) return false;
    
    // Если у маршрута нет требований по ролям, показываем его всем авторизованным
    if (!route.allowedRoles) return true;
    
    // Если пользователь не авторизован или не имеет роли, скрываем маршрут
    if (!user || !user.role) return false;
    
    // Проверяем роль - админ имеет доступ ко всему
    return user.role === Role.ADMIN || route.allowedRoles.includes(user.role);
  });

  // Функция выхода с подтверждением
  const handleLogout = () => {
    if (confirm('Вы действительно хотите выйти?')) {
      // Сбрасываем флаг проверки при выходе
      navbarMounted = false;
      authService.logout();
      navigate('/auth');
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile && onClose) {
      onClose();
    }
  };

  // Проверяем наличие аватара у пользователя
  const hasAvatar = user && 'avatar' in user && user.avatar;
  const userInitial = user?.email ? user.email[0].toUpperCase() : 'U';

  return (
    <div onMouseOut={() => !isMobile && setTitle('')} className={css.wrapper}>
      {isMobile && (
        <div className={css.mobileHeader}>
          <div className={css.mobileUserInfo}>
            {hasAvatar ? (
              <img src={String(hasAvatar)} alt="Avatar" className={css.mobileAvatar} />
            ) : (
              <div className={css.mobileAvatarPlaceholder}>
                {userInitial}
              </div>
            )}
            <div className={css.mobileUserDetails}>
              <div className={css.mobileUserEmail}>{user?.email}</div>
              <div className={css.mobileUserRole}>{user?.role || 'Пользователь'}</div>
            </div>
          </div>
          {onClose && (
            <button className={css.closeButton} onClick={onClose}>
              <FaTimes />
            </button>
          )}
        </div>
      )}
      
      <div className={css.st}>
        <div className={css.links}>
          {filteredRoutes.map((el, index) => {
            const isActive = location.pathname === el.path || 
                            (el.path !== '/' && location.pathname.startsWith(el.path));
            const delay = isMobile ? (index + 1) * 50 : 0;
            
            return (
              <div 
                key={el.path}
                onMouseOver={() => !isMobile && setTitle(el.title)} 
                className={`${css.link} ${isActive ? css.activeLink : ''}`}
                onClick={() => handleNavigation(el.path)}
                style={isMobile ? { animationDelay: `${delay}ms` } : {}}
              >
                lol
                {React.createElement(el.icon!, { 
                  className: `${css.icon} ${isActive ? css.activeIcon : ''}` 
                })}
                {isMobile && (
                  <span className={css.linkText}>
                    {el.title}
                  </span>
                )}
                {isActive && <div className={css.activeMark} />}
              </div>
            );
          })}
        </div>
      </div>

      <div className={css.nd}>
        {!isMobile && (
          <div className={css.sectionTitle}>
            {title}
            
          </div>
        )}
        
        <div 
          onClick={handleLogout} 
          className={css.link}
          style={isMobile ? { animationDelay: `${(filteredRoutes.length + 1) * 50}ms` } : {}}
        >
          <IoMdExit className={css.icon} />
          {isMobile && <span className={css.linkText}>Выйти</span>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;