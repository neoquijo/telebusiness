import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../../../../core/store/MainStore';
import {
  resetAccountForm,
  cancelEdit
} from '../../../../core/store/slices/accountSlice';
import {
  useEditAccountMutation,
  useRefreshSessionMutation
} from '../../../../API/accountsApi';
import { infoError, infoSuccess } from '../../../../shared/lib/toastWrapper';
import { useModalManager } from '../../../../core/providers/modal/ModalProvider';
import Input from '../../../../shared/components/UI/Input/Input';
import Button from '../../../../shared/components/UI/Button/Button';
import {
  FaTelegram,
  FaUser,
  FaSave,
  FaRedo,
  FaExclamationTriangle
} from 'react-icons/fa';
import css from './EditAccountModal.module.css';

interface EditAccountModalProps {
  account: {
    id: string;
    name: string;
    phone: string;
    username?: string;
    firstname?: string;
    lastname?: string;
    status: string;
  };
}

const EditAccountModal: React.FC<EditAccountModalProps> = ({ account }) => {
  const dispatch = useAppDispatch();
  const modal = useModalManager();

  const [name, setName] = useState(account.name);
  const [isFormValid, setIsFormValid] = useState(true);

  const [editAccount, { isLoading: isEditing, isSuccess: editSuccess }] = useEditAccountMutation();
  const [refreshSession, { isLoading: isRefreshing }] = useRefreshSessionMutation();

  // Валидация формы
  useEffect(() => {
    setIsFormValid(name.trim().length >= 3);
  }, [name]);

  // Обработка успешного редактирования
  useEffect(() => {
    if (editSuccess) {
      infoSuccess('Аккаунт успешно обновлен!');
      dispatch(resetAccountForm());
      modal.closeAllModals();
    }
  }, [editSuccess, dispatch, modal]);

  const handleSave = async () => {
    if (!isFormValid) return;

    try {
      await editAccount({
        id: account.id,
        name
      }).unwrap();
    } catch (error) {
      infoError('Не удалось обновить аккаунт');
    }
  };

  const handleRefreshSession = async () => {
    try {
      const result = await refreshSession({ id: account.id }).unwrap();
      if (result.success) {
        infoSuccess('Сессия успешно обновлена!');
        modal.closeAllModals();
      } else {
        infoError('Не удалось обновить сессию');
      }
    } catch (error) {
      infoError('Произошла ошибка при обновлении сессии');
    }
  };

  const handleCancel = () => {
    dispatch(cancelEdit());
    modal.closeAllModals();
  };

  return (
    <div className={css.container}>
      <div className={css.header}>
        <FaTelegram className={css.telegramIcon} />
        <h1 className={css.title}>Редактирование аккаунта</h1>
      </div>

      <div className={css.content}>
        <div className={css.accountPreview}>
          <div className={css.accountStatus}>
            {account.status === 'alive' ? (
              <div className={css.statusAlive}>
                <span className={css.statusDot}></span>
                Онлайн
              </div>
            ) : account.status === 'expired' ? (
              <div className={css.statusExpired}>
                <FaExclamationTriangle className={css.statusIcon} />
                Сессия истекла
              </div>
            ) : (
              <div className={css.statusError}>
                <FaExclamationTriangle className={css.statusIcon} />
                Ошибка
              </div>
            )}
          </div>

          <div className={css.accountInfo}>
            <div className={css.accountAvatar}>
              <FaUser className={css.avatarPlaceholder} />
            </div>
            <div className={css.accountDetails}>
              {account.username && (
                <div className={css.username}>@{account.username}</div>
              )}
              {account.firstname && (
                <div className={css.fullName}>
                  {account.firstname} {account.lastname}
                </div>
              )}
              <div className={css.phone}>+{account.phone}</div>
            </div>
          </div>
        </div>

        <div className={css.formGroup}>
          <Input
            label="Название аккаунта"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Введите название аккаунта"
            required
          />
        </div>

        {account.status === 'expired' && (
          <div className={css.warningBox}>
            <FaExclamationTriangle className={css.warningIcon} />
            <div className={css.warningText}>
              <h3>Сессия этого аккаунта истекла</h3>
              <p>Для восстановления работы аккаунта необходимо обновить сессию.</p>
            </div>
          </div>
        )}

        <div className={css.actions}>
          <Button
            variant="secondary"
            onClick={handleCancel}
          >
            Отмена
          </Button>

          {account.status === 'expired' && (
            <Button
              variant="warning"
              icon={FaRedo}
              onClick={handleRefreshSession}
              disabled={isRefreshing}
            >
              {isRefreshing ? 'Обновление...' : 'Обновить сессию'}
            </Button>
          )}

          <Button
            variant="primary"
            icon={FaSave}
            onClick={handleSave}
            disabled={!isFormValid || isEditing}
          >
            {isEditing ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditAccountModal;