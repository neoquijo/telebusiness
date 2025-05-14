import { FC } from 'react';
import css from './Accounts.module.css';
import SearchInput from '../../../shared/components/UI/SearchInput/SearchInput';
import Button from '../../../shared/components/UI/Button/Button';
import { FaTelegram } from 'react-icons/fa6';
import { useModalManager } from '../../../core/providers/modal/ModalProvider';
import { useGetAccountsQuery } from '../../../API/accountsApi';
import { Account } from '../../../types/Account';
import AccountItem from './AccountItem';
import CreateAccountModal from '../modals/CreateAccount/CreateAccountModal';

interface IProps { }

const Accounts: FC<IProps> = () => {

  const modal = useModalManager()
  const { data } = useGetAccountsQuery('')

  return (
    <div className={css.wrapper}>
      <div className={css.col}>
        <div className={css.title}>
          <div className={css.row}>
            <div className={css.text}>Поиск аккаунта:</div>
            <SearchInput cb={e => alert(e)} />
          </div>

        </div>
        <div className={css.st}>
          <div className={css.users}>
            {data?.map((el: Account) => {
              return <AccountItem item={el} />
            })}
            {/* {centers?.map(el => <CentreItem item={el} />)} */}
          </div>

          <div className={css.actions}>
            <Button icon={() => <><FaTelegram style={{ color: 'blue' }} /></>} onClick={() => {
              modal.openModal('addAccount', <CreateAccountModal />, {
                title: 'Добавление аккаунта'
              })
            }}>Добавить аккаунт</Button>
            {/* <Pagination totalItems={users?.totalItems!} /> */}
          </div>


        </div>
      </div>

      {/* <div className={css.nd}>
        <div className={css.info}>
          <div className={css.title}>
         
            <div className={css.text}>информация</div>
          </div>
        </div>
      </div> */}

    </div>
  );
};

export default Accounts;