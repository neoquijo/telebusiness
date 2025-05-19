import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { IoIosChatboxes } from 'react-icons/io';
import { FaUserCircle, FaCircle, FaExclamationCircle, FaInfoCircle, FaRedo, FaPencilAlt } from 'react-icons/fa';
import { Account } from '../../../types/Account';
import { setCurrentAccount, startEditAccount } from '../../../core/store/slices/accountSlice';
import { useModalManager } from '../../../core/providers/modal/ModalProvider';
import css from './AccountItem.module.css';
import EditAccountModal from '../modals/EditAccount/EditAccountModal';

interface IProps {
  item: Account;
}

const AccountItem: React.FC<IProps> = ({ item }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const modal = useModalManager();

  const handleNavigateToChats = () => {
    dispatch(setCurrentAccount(item));
    navigate(`/accountChats/${item.id}`);
  };

  const handleEditAccount = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(startEditAccount(item));
    modal.openModal('editAccount', <EditAccountModal account={item} />, {
      title: 'Редактирование аккаунта'
    });
  };

  const getStatusInfo = () => {
    switch (item.status) {
      case 'alive':
        return {
          icon: FaCircle,
          label: 'Онлайн',
          color: '#4caf50',
          className: css.statusAlive
        };
      case 'error':
        return {
          icon: FaExclamationCircle,
          label: 'Ошибка',
          color: '#f44336',
          className: css.statusError
        };
      case 'expired':
        return {
          icon: FaInfoCircle,
          label: 'Сессия истекла',
          color: '#ff9800',
          className: css.statusExpired
        };
      default:
        return {
          icon: FaCircle,
          label: 'Неизвестно',
          color: '#9e9e9e',
          className: css.statusUnknown
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className={css.item}>
      <div className={css.avatar}>
        {item.avatar ? (
          <img src={item.avatar} alt={item.name} className={css.avatarImage} />
        ) : (
          <FaUserCircle className={css.avatarIcon} />
        )}
      </div>

      <div className={css.name}>
        {item.name}
      </div>

      <div className={css.username}>
        {item.username ? `@${item.username}` : '-'}
      </div>

      <div className={css.status}>
        <StatusIcon
          className={`${css.statusIcon} ${statusInfo.className}`}
          style={{ color: statusInfo.color }}
        />
        <span className={css.statusText}>{statusInfo.label}</span>
      </div>

      <div className={css.phone}>
        +{item.phone}
      </div>

      <div className={css.actions}>
        <button
          onClick={handleEditAccount}
          className={css.actionButton}
          title="Редактировать аккаунт"
        >
          <FaPencilAlt className={css.actionIcon} />
          <span>Изменить</span>
        </button>

        {item.status === 'alive' && (
          <button
            onClick={handleNavigateToChats}
            className={css.actionButton}
            title="Просмотреть чаты"
          >
            <IoIosChatboxes className={css.actionIcon} />
            <span>Чаты</span>
          </button>
        )}

        {item.status === 'expired' && (
          <button
            onClick={handleEditAccount}
            className={`${css.actionButton} ${css.renewButton}`}
            title="Обновить сессию"
          >
            <FaRedo className={css.actionIcon} />
            <span>Обновить</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AccountItem;