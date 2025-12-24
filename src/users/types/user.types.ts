// src/users/types/user.types.ts
export interface UserEntity {
  id: number;
  email: string;
  name?: string;
  roles: Array<{ value: string }>;
  // добавьте другие поля из вашего User entity
}

export interface JwtPayload {
  id: number;
  email: string;
  roles: Array<{ value: string }>;
  iat?: number;
  exp?: number;
}
