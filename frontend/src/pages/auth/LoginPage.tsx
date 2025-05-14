import css from './Auth.module.css'
import { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../../API/authApi';
import { authService } from '../../services/auth/authService';
import { useAppDispatch, useAppSelector } from '../../core/store/MainStore';
import { setAuth } from '../../core/store/slices/authSlice';


interface IPProps {

}
const LoginPage: FC<IPProps> = () => {

  const [login, setLogin] = useState<string>()
  const [password, setPassword] = useState<string>()
  const { isAuth } = useAppSelector(s => s.auth)
  const dispatch = useAppDispatch()
  const [doLogin, { data, isSuccess: successLogin }] = useLoginMutation()
  const navigate = useNavigate()

  useEffect(() => {
    if (successLogin && data) {
      authService.checkAuth(data.access_token)
      dispatch(setAuth(true))
    }
  }, [successLogin, navigate])
  useEffect(() => {
    if (isAuth) {
      navigate('/')
    }
  }, [isAuth])

  const handleLogin = async () => {
    if (login && password)
      doLogin({ username: login, password })
  }

  // const [verify, { isSuccess: gotToken }] = useVerifyBusinessTokenMutation()
  // const { message } = useAppSelector(s => s.nav)

  // const handleSubmit = useCallback(() => {
  //   if (!login || !password) {
  //     message('Для продолжения, заполните все данные');
  //     return;
  //   }
  //   doLogin({ login, password });
  // }, [login, password, doLogin]);
  // useEffect(() => {
  //   if (isSuccess) {
  //     if (data) {
  //       dispatch(setAuth(true))
  //       dispatch(setUser(data.user))
  //       localStorage.setItem('token', data.token)
  //     }
  //   }
  //   if (isError) {
  //     // @ts-ignore
  //     message(error.data.message);
  //   }
  // }, [isSuccess, isError, data])

  // useEffect(() => {
  //   if (isAuth)
  //     navigate('/')
  //   if (!isAuth) {
  //     const token = localStorage.getItem('token')
  //     if (token)
  //       verify({ token })
  //   }
  //   if (gotToken) {
  //     navigate('/')
  //   }
  // }, [isAuth, gotToken])




  return (<div onKeyDown={(e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  }} className={css.wrapper}>
    <div className={css.form}>

      <div className={css.nd}>
        {/* <div className={css.langPicker}>
          <LangPicker />
        </div> */}
        <div className={css.title}>Зарабатывай вместе с нами</div>
        <div className={css.icons}></div>
        <div className={css.text}>
          Для перехода в личный кабинет, укажите данные указанные при регистрации
        </div>
        <div className={css.inputs}>

          <input onChange={e => setLogin(e.target.value)} placeholder={'Email или номер телефона:'} className={css.input} />
          <input type='password' onChange={e => setPassword(e.target.value)} placeholder={'Пароль для входа в систему'} className={css.input} />
        </div>
        <div onClick={handleLogin} className={css.button}>Вход в личный кабинет</div>
      </div>
      <div className={css.st}>
        <div className={css.logo}></div>
        {/* <div className={css.title}>Мы рады вашему визиту!</div> */}
        <div className={css.text}>Пройдите простую продседуру регистрации чтобы начать пользоваться сервисом</div>
        <div onClick={() => navigate('/reg')} className={css.button}>Создать учётную запись</div>
      </div>
    </div>
  </div >)
}

export default LoginPage