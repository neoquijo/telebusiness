import { FC } from 'react';
import css from './AccountsPage.module.css';
import Accounts from '../Components/Accounts';

interface IProps { }

const AccountsPage: FC<IProps> = () => {
  return (
    <div className={css.wrapper}>
      <Accounts />
    </div>
  );
};

export default AccountsPage;