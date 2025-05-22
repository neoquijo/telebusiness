import React, { FC, useState, useEffect } from 'react';
import css from './Navbar.module.css';
import { ModuleRegistry } from '../../../../core/Registry';
import { useNavigate } from 'react-router-dom';
import { IoMdExit } from 'react-icons/io';
import { authService } from '../../../../services/auth/authService';
import { useAppSelector } from '../../../../core/store/MainStore';

// Избегаем частой проверки токена - делаем это только при монтировании компонента
let navbarMounted = false;

interface IProps { }

const Sidebar: FC<IProps> = () => {
  const routes = ModuleRegistry.getInstance().getAllRoutes()
  const [title, setTitle] = useState('')
  const navigate = useNavigate()
  const { user, isAuth } = useAppSelector(s => s.auth)

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
    return user.role === 'admin' || route.allowedRoles.includes(user.role);
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

  return (
    <div onMouseOut={() => setTitle('')} className={css.wrapper}>
      <div className={css.st}>
        <div className={css.links}>
          {filteredRoutes.map(el => {
            return <div 
              key={el.path}
              onMouseOver={() => setTitle(el.title)} 
              className={css.link} 
              onClick={() => navigate(el.path)}
            >
              {React.createElement(el.icon!, { className: css.icon })}
            </div>
          })}
        </div>
      </div>

      <div className={css.nd}>
        <div className={css.sectionTitle}>
          {title}
        </div>
        
        <div onClick={handleLogout} className={css.link}>
          <IoMdExit className={css.icon} />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;