import { useEffect } from 'react';

/**
 * Хук для блокировки/разблокировки прокрутки body при открытии/закрытии модальных окон
 * @param isOpen Флаг состояния модального окна (открыто/закрыто)
 */
export const useModalBodyScroll = (isOpen: boolean): void => {
  useEffect(() => {
    if (isOpen) {
      // Сохраняем текущую позицию прокрутки
      const scrollY = window.scrollY;
      
      // Добавляем стили для блокировки прокрутки с сохранением позиции
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflowY = 'hidden';
    } else {
      // Извлекаем сохраненную позицию прокрутки
      const scrollY = document.body.style.top;
      
      // Восстанавливаем прокрутку
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflowY = '';
      
      // Прокручиваем к сохраненной позиции
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
      }
    }
    
    // Чистим эффект при размонтировании компонента
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflowY = '';
    };
  }, [isOpen]);
}; 