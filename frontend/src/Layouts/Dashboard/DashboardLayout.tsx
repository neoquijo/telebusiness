import { FC, useEffect } from 'react';
import css from './DashboardLayout.module.css';
import Sidebar from '../../shared/components/Navigation/Sidebar/Navbar';
import Topbar from '../../shared/components/Navigation/Topbar/Topbar';
import { useAppSelector } from '../../core/store/MainStore';
import { useNavigate } from 'react-router-dom';



interface IProps<T = any, P = any> {
  Component: FC<T>;
  props: P;
  TopbarWidget: FC<any>
}

const DashboardLayout = ({ Component, TopbarWidget, ...props }: IProps) => {

  const { isAuth } = useAppSelector(s => s.auth)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuth) {
      navigate('/auth')
    }
  }, [isAuth])


  return (
    <div className={css.wrapper}>
      <Sidebar />
      <div className={css.container}>
        <div className={css.topbar}>
          <Topbar Widget={TopbarWidget} />
        </div>
        <div className={css.component}>
          <Component {...props} />
        </div>
      </div>
    </div>
  );
};


export default DashboardLayout;
