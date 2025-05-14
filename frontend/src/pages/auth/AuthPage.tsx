import { FC, useEffect } from 'react';
import css from './Auth.module.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/auth/authService';

const AuthPage: FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const returnTo = params.get('to');

  useEffect(() => {
    const checkAuthentication = async () => {
      const storedToken = localStorage.getItem('token');

      if (storedToken) {
        try {
          const isAuthenticated = await authService.checkAuth(storedToken);
          if (isAuthenticated) {
            navigate(returnTo || '/');
          } else {
            localStorage.removeItem('token')
            navigate('/login');
          }
        } catch (error) {
          localStorage.removeItem('token')
          console.error('Authentication check failed:', error);
          navigate('/login');
        }
      } else {
        navigate('/login');
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
