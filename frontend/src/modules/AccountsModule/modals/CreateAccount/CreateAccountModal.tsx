import { FC, useEffect, useState } from 'react';
import css from './CreateAccountModal.module.css';
import Input from '../../../../shared/components/UI/Input/Input';
import Button from '../../../../shared/components/UI/Button/Button';
import { useAppDispatch, useAppSelector } from '../../../../core/store/MainStore';
import { setAccountInfo, setAccountName, setCode, setHash, setPassword, setPhone, setSessionString } from '../../../../core/store/slices/accountSlice';
import { useCreateAccountMutation, useSendCodeMutation, useVerifyCodeMutation } from '../../../../API/accountsApi';
import { infoError, infoSuccess } from '../../../../shared/lib/toastWrapper';
import { AccountData } from '../../../../types/Account';
import { MdEdit } from 'react-icons/md';
import { CgEnter } from 'react-icons/cg';
import { IoIosSend } from 'react-icons/io';
import { useModalManager } from '../../../../core/providers/modal/ModalProvider';

interface IProps { }

const CreateAccountModal: FC<IProps> = () => {
  const dispatch = useAppDispatch();
  const account = useAppSelector(s => s.account);
  const [sendCode, { data, isSuccess: gotCode, error: sendError }] = useSendCodeMutation();
  const [verifyCode, { data: verifyData, isSuccess: accountVerified, error: verifyError }] = useVerifyCodeMutation();
  const [create, { isSuccess: accountCreated }] = useCreateAccountMutation()
  const modal = useModalManager()

  const [needPassword, setNeedPassword] = useState(false);


  const [avatar, setAvatar] = useState('')
  const [accountData, setAccountData] = useState<AccountData>()

  const handleSubmit = async () => {
    sendCode({ phone: account.phone });
  };

  useEffect(() => {
    if (accountCreated) {
      infoSuccess('Аккаунт добавлен!')
      modal.closeAllModals()
    }
  }, [accountCreated])


  useEffect(() => {
    if (gotCode && data) {
      dispatch(setHash(data.phoneCodeHash));
      dispatch(setCode(''));
      setNeedPassword(false);
    }
  }, [gotCode, data, dispatch]);

  useEffect(() => {
    if (sendError) {
      let msg = "Ошибка при отправке кода";
      if ("data" in sendError && sendError.data) {
        msg = (sendError.data as { message?: string }).message || msg;
      }
      if (msg === "PHONE_NUMBER_INVALID") {
        infoError("Неверный номер телефона");
      }
      else if (msg === "ACCOUNT_ALREADY_EXIST") {
        infoError("Этот аккаунт уже добавлен!")
      }
      else {
        infoSuccess(msg);
      }
    }
  }, [sendError]);

  useEffect(() => {
    if (verifyError) {
      let msg = "Ошибка при верификации";
      if ("data" in verifyError && verifyError.data) {
        msg = (verifyError.data as { message?: string }).message || msg;
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
        infoError("Введите пароль для двухфакторной аутентификации")
      }
      else {
        infoSuccess(msg);
      }
    }
  }, [verifyError]);

  const handleCreateAccount = async () => {
    await create({

      session: account.session,
      accountName: account.accountName
    })
  }

  useEffect(() => {
    if (accountVerified && verifyData) {
      infoSuccess('Авторизация успешна!');
      console.log("Данные аккаунта:", verifyData.accountInfo);
      setAvatar(verifyData.avatar)
      setAccountData(verifyData)
      dispatch(setSessionString(verifyData.session))
      dispatch(setAccountInfo(verifyData.accountInfo))
    }
  }, [accountVerified, verifyData]);

  const handleVerify = async () => {
    await verifyCode({
      code: account.code,
      phone: account.phone,
      hash: account.phoneCodeHash,
      password: account.password
    });
  };

  const handleResetNumber = () => {
    dispatch(setHash(''));
    dispatch(setCode(''));
    dispatch(setPhone(''));
    setNeedPassword(false);
  };

  return (
    <div className={css.wrapper}>
      {!avatar ? <img height={350} className={css.avatar} alt='telegramLogo' src='/img/tg-logo.svg' /> : <img className={css.avatar} height={350} src={avatar} />}
      {!account.accountInfo ? <div className={css.form}>
        {account.phoneCodeHash ? (
          <>

            <Input
              inputClassname={css.input}
              value={account.code}
              onChange={e => dispatch(setCode(e.target.value))}
              label='Код активации'
              placeholder='Введите код, полученный в SMS'
            />


          </>
        ) : (<>
          {/* <Input
            required
            label='Примечание(Название аккаунта)'
            // inputClassname={css.input}
            value={account.phone}
            onChange={e => dispatch(setAccountn(e.target.value))}
            style={{ width: '100%' }}
          /> */}
          <Input
            required
            inputClassname={css.input}
            value={account.phone}
            onChange={e => dispatch(setPhone(e.target.value))}
            style={{ width: '100%' }}
            label='Номер телефона'
            placeholder='+7XXXXXXXXXX'
          />
        </>
        )}

        {needPassword && (
          <Input
            inputClassname={css.input}
            value={account.password}
            onChange={e => dispatch(setPassword(e.target.value))}
            label='Пароль'
            type='password'
            placeholder='Введите пароль'
          />
        )}

        {!account.phoneCodeHash && (
          <Button icon={IoIosSend} onClick={handleSubmit} style={{ marginTop: '2em' }}>
            Отправить код
          </Button>
        )}

        {account.phoneCodeHash && (
          <div style={{ alignItems: 'flex-end', justifyContent: 'space-between' }} className={css.row}>

            <Button icon={CgEnter} onClick={handleVerify} style={{ marginTop: '2em' }}>
              Войти
            </Button>
            <button onClick={() => console.log(accountData)}>a</button>
            <Button icon={MdEdit} variant='ghost' onClick={handleResetNumber} style={{ marginTop: '1em' }}>
              Ввести другой номер
            </Button>
          </div>
        )}
      </div> :
        <div className={css.details}>
          <div className={css.username}>
            @{account?.accountInfo.username}
          </div>
          <div className={css.id}>
            ID: {account?.accountInfo.id}
          </div>
          {account!.accountInfo.firstName && <div className={css.firstname}>
            Имя: {verifyData?.accountInfo.firstName}
          </div>}
          {account!.accountInfo.lastName && <div className={css.lastname}>
            Фамилия: {verifyData?.accountInfo.lastName}
          </div>}
          <div className={css.phone}>
            Телефон: +{account!.accountInfo.phone}
          </div>

          <div style={{ marginTop: '1em' }} className={css.accountName}>
            <Input onChange={e => dispatch(setAccountName(e.target.value))} inputClassname={css.input} label='Примечание:' required />
            <Button onClick={handleCreateAccount} style={{ marginTop: '1em' }}>Сохранить</Button>
          </div>

        </div>

      }
    </div>
  );
};

export default CreateAccountModal;
