export class TokenService {
  static getToken(): string | null {
    return localStorage.getItem("token");
  }

  static setToken(token: string): void {
    localStorage.setItem("token", token);
  }

  static clearToken(): void {
    localStorage.removeItem("token");
  }
}