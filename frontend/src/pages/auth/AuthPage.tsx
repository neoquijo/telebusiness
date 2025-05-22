import { FC, useEffect } from 'react';
import css from './Auth.module.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/auth/authService';

const AuthPage: FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const returnTo = params.get('returnTo');

  useEffect(() => {
    const checkAuthentication = async () => {
      const storedToken = localStorage.getItem('token');

      if (storedToken) {
        try {
          const isAuthenticated = await authService.checkAuth(storedToken);
          if (isAuthenticated) {
            if (returnTo) {
              if (!returnTo.startsWith('/auth') && !returnTo.startsWith('/login')) {
                navigate(returnTo);
              } else {
                navigate('/');
              }
            } else {
              navigate('/');
            }
          } else {
            localStorage.removeItem('token');
            navigate(returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : '/login');
          }
        } catch (error) {
          localStorage.removeItem('token');
          console.error('Authentication check failed:', error);
          navigate(returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : '/login');
        }
      } else {
        navigate(returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : '/login');
      }
    };

    checkAuthentication();
  }, [navigate, returnTo]);

  return (
    <div className={css.wrapper}>
      <p>Loading...</p>
    </div>
  );
};

export default AuthPage;
