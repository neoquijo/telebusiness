import { FC } from 'react';
import css from './Topbar.module.css';
import { useAppSelector } from '../../../../core/store/MainStore';
import { CiBellOn, CiLight } from 'react-icons/ci';
import { MdDarkMode } from 'react-icons/md';
import { useTheme } from '../../../../hooks/useTheme';
import PopInfo from '../../UI/PopInfo/PopInfo';

interface IProps {
  Widget: FC<any>;
  isMobile?: boolean;
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

const Topbar: FC<IProps> = ({ 
  Widget = () => '', 
  isMobile = false, 
  onMenuToggle, 
  isMobileMenuOpen = false 
}) => {
  const { user } = useAppSelector(s => s.auth)
  const { theme, toggle } = useTheme()
  
  // Безопасный доступ к аватару
  const hasAvatar = user && 'avatar' in user && user.avatar;
  
  // Создаем инициалы пользователя из email
  const getInitials = () => {
    if (!user?.email) return 'U';
    const parts = user.email.split('@');
    return `${parts[0][0].toUpperCase()}${parts[1]?.[0]?.toUpperCase() || ''}`;
  };

  return (
    <div className={css.wrapper}>
      <div className={css.st}>
        {isMobile && (
          <button 
            className={`${css.menuButton} ${isMobileMenuOpen ? css.menuActive : ''}`}
            onClick={onMenuToggle}
            aria-label={isMobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
          >
            <div className={css.hamburger}>
              <span className={css.hamburgerLine}></span>
              <span className={css.hamburgerLine}></span>
              <span className={css.hamburgerLine}></span>
            </div>
          </button>
        )}
        <Widget />
      </div>
      <div className={css.nd}>
        <div onClick={() => toggle()} className={css.themePicker}>
          {!isMobile && "Тема:"}
          {theme == 'dark' ?
            <MdDarkMode className={css.themeIcon} />
            : <CiLight className={css.themeIcon} />
          }
        </div>
        
        <div className={css.notifications}>
          <PopInfo text={'Нет новых уведомлений'} position='bottom'>
            <CiBellOn className={css.icon} />
          </PopInfo>
        </div>
        
        {!isMobile && (
          <div className={css.col}>
            <div className={css.crypto}>USDT: 0.0000</div>
            <div className={css.crypto}>YFMC: 0.0000</div>
          </div>
        )}
        
        <div className={css.user}>
          {hasAvatar ? (
            <div 
              style={{ backgroundImage: `url('${String(hasAvatar)}')` }} 
              className={css.avatar}
            ></div>
          ) : (
            <div className={css.avatar}>
              {getInitials()}
            </div>
          )}
          {!isMobile && (
            <div className={css.email}>
              {user?.email}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;