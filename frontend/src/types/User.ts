export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
  MANAGER = 'MANAGER'
}

export interface User {
  login: string;
  email: string;
  password: string;
  role: Role;
}