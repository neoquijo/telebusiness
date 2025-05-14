import { FC } from 'react';
import css from './AccountItem.module.css';
import { Account } from '../../../types/Account';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCurrentAccount } from '../../../core/store/slices/accountSlice';
import { IoIosChatboxes } from 'react-icons/io';

interface IProps {
  item: Account
}

const AccountItem: FC<IProps> = ({ item }) => {

  const navigate = useNavigate()
  const dispatch = useDispatch()

  return (
    <div className={css.wrapper}>
      <div className={css.info}>
        <div className={css.name}>
          {item.name}

          <div className={css.status}>
            {item.status == 'alive' && <>
              <div className={css.online}></div>
              <div className={css.statusText}>Онлайн</div>
            </>}


            {item.status == 'error' && <>
              <div className={css.error}></div>
              <div className={css.statusText}>Ошибка</div>
            </>}


            {item.status == 'expired' && <>
              <div className={css.expired}></div>
              <div className={css.statusText}>Сессия истекла</div>
            </>}
          </div>
        </div>
        {item.username ? <>
          <div className={css.username}>
            @{item.username}
          </div>

          <div className={css.phone}>
            +{item.phone}
          </div>
        </>

          : <div className={css.phone}>
            +{item.phone}
          </div>}
      </div>

      <div className={css.actions}>
        {item.status == 'alive' && <div onClick={() => {
          navigate('/accountChats/' + item.id)
          dispatch(setCurrentAccount(item))
        }} className={css.chats}> <IoIosChatboxes />
        </div>}
      </div>
    </div>
  );
};

export default AccountItem;