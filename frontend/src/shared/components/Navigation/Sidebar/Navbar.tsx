import React, { FC, useState } from 'react';
import css from './Navbar.module.css';
import { ModuleRegistry } from '../../../../core/Registry';
import { useNavigate } from 'react-router-dom';
import { IoMdExit } from 'react-icons/io';
import { authService } from '../../../../services/auth/authService';
import { useAppSelector } from '../../../../core/store/MainStore';

interface IProps { }

const Sidebar: FC<IProps> = () => {

  const routes = ModuleRegistry.getInstance().getAllRoutes()
  const [title, setTitle] = useState('')
  const navigate = useNavigate()
  const { user } = useAppSelector(s => s.auth)

  return (
    <div onMouseOut={() => setTitle('')} className={css.wrapper}>
      <div className={css.st}>

        <div className={css.links}>
          {routes.filter(el => el.navigable && (!el.allowedRoles || el.allowedRoles?.includes(user?.role || '1337'))).map(el => {
            return <div onMouseOver={() => setTitle(el.title)} className={css.link} onClick={() => navigate(el.path)}>
              {React.createElement(el.icon!, { className: css.icon })}
            </div>
          })}
        </div>


      </div>

      <div className={css.nd}>

        <div className={css.sectionTitle}>
          {title}
        </div>

        <div onClick={() => authService.logout()} className={css.link}>
          <IoMdExit className={css.icon} />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;