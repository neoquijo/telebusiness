import { toast, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Функция для отображения информационного сообщения
export const info = (message: string, options?: ToastOptions) => {
  toast.info(message, {
    position: 'top-right',
    autoClose: 900,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    ...options,
  });
};

// Функция для отображения ошибки
export const infoError = (message: string, options?: ToastOptions) => {
  toast.error(message, {
    position: 'top-right',
    autoClose: 900,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    ...options,
  });
};

// Функция для отображения предупреждения
export const infoWarning = (message: string, options?: ToastOptions) => {
  toast.warning(message, {
    position: 'top-right',
    autoClose: 900,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    ...options,
  });
};

// Функция для отображения успешного сообщения
export const infoSuccess = (message: string, options?: ToastOptions) => {

  const notificationSound = new Audio('/notification1.mp3');

  // Воспроизводим звук
  notificationSound.play().catch((error) => {
    console.error('Ошибка при воспроизведении звука:', error);
  });
  toast.success(message, {
    position: 'top-right',
    autoClose: 900,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    ...options,
  });
};
