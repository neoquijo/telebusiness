import css from './Auth.module.css'
import { FC, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLoginMutation } from '../../API/authApi';
import { authService } from '../../services/auth/authService';
import { useAppDispatch, useAppSelector } from '../../core/store/MainStore';
import { setAuth } from '../../core/store/slices/authSlice';
import { toast } from 'react-toastify';
import { FaTelegram, FaUserAlt, FaLock, FaArrowRight, FaSun, FaMoon } from 'react-icons/fa';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const LoginPage: FC = () => {
  const [login, setLogin] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [shakeError, setShakeError] = useState<boolean>(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const { isAuth, user } = useAppSelector(s => s.auth)
  const dispatch = useAppDispatch()
  const [doLogin, { data, isSuccess: successLogin, isError, error }] = useLoginMutation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Получаем предпочитаемую системную тему при загрузке
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
    
    // Добавляем атрибут темы к body
    document.body.setAttribute('data-auth-theme', prefersDark ? 'dark' : 'light');
    
    return () => {
      // Удаляем атрибут при размонтировании
      document.body.removeAttribute('data-auth-theme');
    }
  }, []);
  
  // Переключение темы
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.body.setAttribute('data-auth-theme', newTheme);
  }

  useEffect(() => {
    if (successLogin && data) {
      authService.checkAuth(data.access_token)
        .then(success => {
          if (success) {
            setLoading(false)
            dispatch(setAuth(true))
          } else {
            setLoading(false)
            toast.error('Ошибка при проверке авторизации')
          }
        })
    }
  }, [successLogin, data, dispatch])

  useEffect(() => {
    if (isError) {
      setLoading(false)
      setShakeError(true)
      setTimeout(() => setShakeError(false), 500)
      // @ts-ignore
      const errorMessage = error?.data?.message || 'Ошибка авторизации. Проверьте логин и пароль.';
      toast.error(errorMessage);
    }
  }, [isError, error])

  useEffect(() => {
    // Только если пользователь авторизован и у него есть роль
    if (isAuth && user?.role) {
      if (returnTo && !returnTo.startsWith('/auth') && !returnTo.startsWith('/login')) {
        navigate(returnTo);
      } else {
        navigate('/');
      }
    }
  }, [isAuth, user, returnTo, navigate])

  const handleLogin = async () => {
    if (!login || !password) {
      setShakeError(true)
      setTimeout(() => setShakeError(false), 500)
      toast.warning('Введите логин и пароль');
      return;
    }
    try {
      setLoading(true)
      doLogin({ username: login, password })
    } catch (err) {
      setLoading(false)
      toast.error('Ошибка при попытке входа');
    }
  }

  return (
    <div 
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          handleLogin();
        }
      }} 
      className={`${css.wrapper} ${css[`theme-${theme}`]}`}
    >
      <button 
        onClick={toggleTheme} 
        className={css.themeToggle}
        aria-label="Переключить тему"
      >
        {theme === 'light' ? <FaMoon /> : <FaSun />}
      </button>
      
      <div className={`${css.form} ${shakeError ? css.shakeAnimation : ''}`}>
        <div className={css.nd}>
          <div className={css.title}>Добро пожаловать!</div>
          <div className={css.text}>
            Для входа в личный кабинет укажите данные, указанные при регистрации
          </div>
          
          <div className={css.inputs}>
            <div className={css.inputWrapper}>
              <FaUserAlt className={css.inputIcon} />
              <input 
                onChange={e => setLogin(e.target.value)} 
                value={login}
                placeholder="Email или номер телефона" 
                className={css.input} 
              />
            </div>
            
            <div className={css.inputWrapper}>
              <FaLock className={css.inputIcon} />
              <input 
                type="password" 
                onChange={e => setPassword(e.target.value)} 
                value={password}
                placeholder="Пароль для входа в систему" 
                className={css.input} 
              />
            </div>
          </div>
          
          <div className={css.forgotPassword}>
            Забыли пароль?
          </div>
          
          <button 
            onClick={handleLogin} 
            className={`${css.button} ${loading ? css.loading : ''}`}
            disabled={loading}
          >
            {loading ? (
              <span className={css.loadingSpinner}></span>
            ) : (
              <>
                Войти в кабинет 
                <FaArrowRight className={css.buttonIcon} />
              </>
            )}
          </button>
        </div>
        
        <div className={css.st}>
          <div className={css.logo}>
            <FaTelegram className={css.logoIcon} />
          </div>
          <div className={css.title}>
            {isMobile ? 'Нет аккаунта?' : 'Telegram Client'}
          </div>
          <div className={css.text}>
            {isMobile 
              ? 'Создайте новую учётную запись, чтобы начать пользоваться сервисом.'
              : 'Пройдите простую процедуру регистрации, чтобы начать пользоваться всеми возможностями нашего сервиса'}
          </div>
          <button onClick={() => navigate('/reg')} className={css.button}>
            Создать аккаунт <FaArrowRight className={css.buttonIcon} />
          </button>
        </div>
      </div>
      
      <div className={css.footerCopyright}>
        © 2023 Telegram Client. Все права защищены
      </div>
      
      {/* Анимированный фоновый элемент */}
      <div className={css.backgroundElements}>
        <div className={css.animatedCircle}></div>
        <div className={css.animatedCircle2}></div>
        <div className={css.animatedCircle3}></div>
      </div>
    </div>
  )
}

export default LoginPage