import { FC, useEffect, useState } from 'react';
import css from './ReLoginAccountModal.module.css';
import Input from '../../../../shared/components/UI/Input/Input';
import Button from '../../../../shared/components/UI/Button/Button';
import { useAppDispatch, useAppSelector } from '../../../../core/store/MainStore';
import { setAccountInfo, setAccountName, setCode, setHash, setPassword, setPhone, setSessionString, resetAccountForm } from '../../../../core/store/slices/accountSlice';
import { useCreateAccountMutation, useSendCodeMutation, useUpdateAccountSessionMutation, useVerifyCodeMutation } from '../../../../API/accountsApi';
import { infoError, infoSuccess } from '../../../../shared/lib/toastWrapper';
import { AccountData } from '../../../../types/Account';
import { MdEdit } from 'react-icons/md';
import { CgEnter } from 'react-icons/cg';
import { IoIosSend } from 'react-icons/io';
import { useModalManager } from '../../../../core/providers/modal/ModalProvider';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

interface ReLoginAccountModalProps {
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

const ReLoginAccountModal: FC<ReLoginAccountModalProps> = ({ account }) => {
  const dispatch = useAppDispatch();
  const accountState = useAppSelector(s => s.account);
  const [sendCode, { data, isSuccess: gotCode, error: sendError, isLoading: isSendingCode }] = useSendCodeMutation();
  const [verifyCode, { data: verifyData, isSuccess: accountVerified, error: verifyError, isLoading: isVerifying }] = useVerifyCodeMutation();
  const [updateSession, { isSuccess: sessionUpdated, isLoading: isUpdating }] = useUpdateAccountSessionMutation();
  const modal = useModalManager();

  const [needPassword, setNeedPassword] = useState(false);
  const [avatar, setAvatar] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  // Устанавливаем телефон аккаунта при монтировании компонента
  useEffect(() => {
    dispatch(resetAccountForm());
    dispatch(setPhone(account.phone));
    dispatch(setAccountName(account.name));
    
    // Автоматически отправляем код при загрузке компонента
    handleSubmit();
  }, [account, dispatch]);

  const handleSubmit = async () => {
    try {
      // Передаем параметр relogin=true чтобы обойти проверку на существование аккаунта
      await sendCode({ phone: account.phone, relogin: true }).unwrap();
      setCodeSent(true);
      infoSuccess(`SMS-код отправлен на номер +${account.phone}`);
    } catch (error: any) {
      // Типизируем error как any для доступа к свойствам
      if (error?.data?.message === 'PHONE_NUMBER_INVALID') {
        infoError("Неверный номер телефона");
      } else {
        infoError(`Ошибка при отправке кода: ${error?.data?.message || 'Неизвестная ошибка'}`);
      }
    }
  };

  useEffect(() => {
    if (sessionUpdated) {
      infoSuccess('Аккаунт успешно обновлен!');
      modal.closeAllModals();
    }
  }, [sessionUpdated, modal]);

  useEffect(() => {
    if (gotCode && data) {
      dispatch(setHash(data.phoneCodeHash));
      dispatch(setCode(''));
      setNeedPassword(false);
      setCodeSent(true);
      infoSuccess(`SMS-код отправлен на номер +${account.phone}`);
    }
  }, [gotCode, data, dispatch, account.phone]);

  useEffect(() => {
    if (sendError) {
      let msg = "Ошибка при отправке кода";
      
      // Проверяем тип ошибки и наличие данных
      if ('data' in sendError && sendError.data) {
        const errorData = sendError.data as any;
        msg = errorData.message || msg;
      }
      
      if (msg === "PHONE_NUMBER_INVALID") {
        infoError("Неверный номер телефона");
      } else if (msg !== 'ACCOUNT_ALREADY_EXIST') {
        infoError(msg);
      }
    }
  }, [sendError]);

  useEffect(() => {
    if (verifyError) {
      let msg = "Ошибка при верификации";
      
      // Проверяем тип ошибки и наличие данных
      if ('data' in verifyError && verifyError.data) {
        const errorData = verifyError.data as any;
        msg = errorData.message || msg;
      }
      
      if (msg === "PASSWORD_HASH_INVALID") {
        infoError("Неверный пароль");
        setNeedPassword(true);
      } else if (msg === "PHONE_CODE_INVALID") {
        infoError("Неверный код авторизации");
      } else if (msg === "PHONE_CODE_EXPIRED") {
        infoError("Время действия кода истекло");
      } else if (msg === "SESSION_PASSWORD_NEEDED") {
        setNeedPassword(true);
        infoError("Введите пароль для двухфакторной аутентификации");
      }
      else {
        infoError(msg);
      }
    }
  }, [verifyError]);

  const handleUpdateAccount = async () => {
    try {
      // Используем updateSession вместо create для обновления существующего аккаунта
      await updateSession({
        id: account.id,
        session: accountState.session,
        accountName: accountState.accountName || account.name
      }).unwrap();
      infoSuccess('Сессия аккаунта успешно обновлена!');
    } catch (error: any) {
      infoError(`Ошибка при обновлении сессии: ${error?.data?.message || 'Неизвестная ошибка'}`);
    }
  };

  useEffect(() => {
    if (accountVerified && verifyData) {
      infoSuccess('Авторизация успешна!');
      setAvatar(verifyData.avatar);
      dispatch(setSessionString(verifyData.session));
      dispatch(setAccountInfo(verifyData.accountInfo));
    }
  }, [accountVerified, verifyData, dispatch]);

  const handleVerify = async () => {
    try {
      await verifyCode({
        code: accountState.code,
        phone: accountState.phone,
        hash: accountState.phoneCodeHash,
        password: accountState.password
      }).unwrap();
    } catch (error) {
      // Ошибки обрабатываются в useEffect выше
    }
  };

  const handleResetNumber = () => {
    dispatch(setCode(''));
    setNeedPassword(false);
    handleSubmit();
  };

  return (
    <div className={css.wrapper}>
      <h3 className={css.title}>Повторный вход в аккаунт</h3>
      
      <div className={css.avatarWrap}>
        {!avatar ? 
          <img className={css.avatarImage} alt='telegramLogo' src='/img/tg-logo.svg' /> : 
          <img className={css.avatarImage} src={avatar} />
        }
      </div>
      
      {!accountState.accountInfo ? (
        <div className={css.form}>
          <div className={css.phoneInfo}>
            <span className={css.label}>Номер телефона:</span>
            <span className={css.phoneNumber}>+{account.phone}</span>
          </div>

          {codeSent && (
            <div className={css.codeInfo}>
              <p>SMS-код отправлен на указанный номер</p>
              <Input
                inputClassname={css.input}
                value={accountState.code}
                onChange={e => dispatch(setCode(e.target.value))}
                label='Код активации'
                placeholder='Введите код из SMS'
              />
            </div>
          )}

          {needPassword && (
            <Input
              inputClassname={css.input}
              value={accountState.password}
              onChange={e => dispatch(setPassword(e.target.value))}
              label='Пароль'
              type='password'
              placeholder='Введите пароль для 2FA'
            />
          )}

          <div className={css.actions}>
            <Button 
              icon={CgEnter} 
              onClick={handleVerify} 
              disabled={!accountState.code || isVerifying}
              className={css.button}
            >
              {isVerifying ? 'Проверка...' : 'Войти'}
            </Button>

            <Button 
              icon={IoIosSend} 
              variant='ghost' 
              onClick={handleResetNumber}
              disabled={isSendingCode}
              className={css.button}
            >
              {isSendingCode ? 'Отправка...' : 'Отправить код повторно'}
            </Button>
          </div>
        </div>
      ) : (
        <div className={css.details}>
          <div className={css.userInfo}>
            <div className={css.username}>
              @{accountState?.accountInfo.username}
            </div>
            <div className={css.userField}>
              ID: {accountState?.accountInfo.id}
            </div>
            {accountState.accountInfo.firstName && <div className={css.userField}>
              Имя: {accountState.accountInfo.firstName}
            </div>}
            {accountState.accountInfo.lastName && <div className={css.userField}>
              Фамилия: {accountState.accountInfo.lastName}
            </div>}
            <div className={css.userField}>
              Телефон: +{accountState.accountInfo.phone}
            </div>
          </div>

          <div className={css.saveAction}>
            <Button 
              onClick={handleUpdateAccount} 
              disabled={isUpdating}
              className={css.button}
            >
              {isUpdating ? 'Обновление...' : 'Сохранить'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReLoginAccountModal; 