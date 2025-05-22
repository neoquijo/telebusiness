import React from 'react';
import { useNavigate } from 'react-router-dom';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      height: '100vh',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1>Доступ запрещен</h1>
      <p>У вас нет необходимых прав для доступа к запрашиваемой странице.</p>
      <div style={{
        display: 'flex',
        gap: '16px',
        marginTop: '20px'
      }}>
        <button 
          onClick={() => navigate('/')}
          style={{
            padding: '10px 20px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: '#4a76a8',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          На главную
        </button>
        <button 
          onClick={() => navigate(-1)}
          style={{
            padding: '10px 20px',
            borderRadius: '4px',
            border: '1px solid #4a76a8',
            backgroundColor: 'white',
            color: '#4a76a8',
            cursor: 'pointer'
          }}
        >
          Назад
        </button>
      </div>
    </div>
  );
};

export default UnauthorizedPage; 