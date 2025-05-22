import { authService } from "../services/auth/authService";

// Глобальное кэширование результата проверки токена
let lastValidationTimestamp = 0;
let cachedResult = false;

/**
 * Утилита для проверки валидности токена с очень низкой частотой проверки
 * Проверяет токен не чаще чем раз в 30 секунд
 * 
 * @param token Токен для проверки
 * @returns Promise<boolean> - Валиден ли токен
 */
export async function validateToken(token: string | null | undefined): Promise<boolean> {
  // Если токена нет, он точно невалиден
  if (!token) {
    return false;
  }
  
  const now = Date.now();

  // Проверяем не чаще чем раз в 30 секунд
  if (now - lastValidationTimestamp < 30000) {
    // Возвращаем кэшированный результат
    return cachedResult;
  }
  
  try {
    // Обновляем метку времени последней проверки
    lastValidationTimestamp = now;
    
    // Выполняем проверку и сохраняем результат
    cachedResult = await authService.checkAuth(token);
    return cachedResult;
  } catch (error) {
    console.error("Token validation failed:", error);
    return false;
  }
}

/**
 * Сброс кэша проверки токена, используйте только в крайних случаях,
 * например, при явном разлогине пользователя
 */
export function resetTokenValidation(): void {
  lastValidationTimestamp = 0;
} 