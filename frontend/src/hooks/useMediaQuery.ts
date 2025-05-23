import { useState, useEffect } from 'react';

/**
 * Хук для определения соответствия медиа-запросам (например, для определения мобильных устройств)
 * @param query Строка медиа-запроса CSS (например, '(max-width: 768px)')
 * @returns boolean - Результат соответствия запросу
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    
    // Устанавливаем начальное значение
    setMatches(mediaQuery.matches);
    
    // Создаем обработчик изменения
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
    
    // Подписываемся на изменения
    mediaQuery.addEventListener('change', handler);
    
    // Очищаем слушатель при размонтировании
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}; 