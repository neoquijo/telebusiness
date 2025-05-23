import { FC, useEffect, useState } from 'react';
import css from './DashboardLayout.module.css';
import Sidebar from '../../shared/components/Navigation/Sidebar/Navbar';
import Topbar from '../../shared/components/Navigation/Topbar/Topbar';
import { useAppSelector } from '../../core/store/MainStore';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '../../hooks/useMediaQuery';

interface IProps<T = any, P = any> {
  Component: FC<T>;
  props: P;
  TopbarWidget: FC<any>
}

const DashboardLayout = ({ Component, TopbarWidget, ...props }: IProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { isAuth } = useAppSelector(s => s.auth)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuth) {
      navigate('/auth')
    }
  }, [isAuth])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Блокируем прокрутку body при открытом меню
    document.body.style.overflow = !isMobileMenuOpen ? 'hidden' : '';
  };

  // Закрываем мобильное меню при переходе на новую страницу
  useEffect(() => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = '';
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [location.pathname]);

  return (
    <div className={css.wrapper}>
      {!isMobile && <Sidebar />}
      
      {isMobile && (
        <div 
          className={`${css.mobileMenuOverlay} ${isMobileMenuOpen ? css.mobileMenuVisible : ''}`} 
          onClick={toggleMobileMenu}
        >
          <div className={css.mobileMenu} onClick={e => e.stopPropagation()}>
            <Sidebar onClose={toggleMobileMenu} />
          </div>
        </div>
      )}
      
      <div className={css.container}>
        <div className={css.topbar}>
          <Topbar 
            Widget={TopbarWidget} 
            isMobile={isMobile}
            onMenuToggle={toggleMobileMenu}
            isMobileMenuOpen={isMobileMenuOpen}
          />
        </div>
        <div className={css.component}>
          <Component {...props} />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
