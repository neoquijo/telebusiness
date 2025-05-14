import { FC } from 'react';
import css from './Topbar.module.css';
import { useAppSelector } from '../../../../core/store/MainStore';
import { CiBellOn, CiLight } from 'react-icons/ci';
import { MdDarkMode } from 'react-icons/md';
import { useTheme } from '../../../../hooks/useTheme';
import PopInfo from '../../UI/PopInfo/PopInfo';

interface IProps {
  Widget: FC<any>
}

const Topbar: FC<IProps> = ({ Widget = () => '' }) => {

  const { user } = useAppSelector(s => s.auth)
  const { theme, toggle } = useTheme()

  return (
    <div className={css.wrapper}>
      <div className={css.st}>
        <Widget />
      </div>
      <div className={css.nd}>

        <div onClick={() => toggle()} className={css.themePicker}>
          Тема:
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
        <div className={css.col}>
          <div className={css.crypto}>USDT: 0.0000</div>
          <div className={css.crypto}>YFMC: 0.0000</div>
        </div>
        <div className={css.user}>
          {/* @ts-ignore */}
          <div style={{ backgroundImage: `url('${user?.avatar}')` }} className={css.avatar}>
            {user?.email[0]} {user?.email.split('@')[1][0]}
          </div>
          <div className={css.email}>
            {user?.email}
            {/* <FaAngleDown /> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;