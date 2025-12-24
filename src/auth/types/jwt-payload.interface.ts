export interface JwtPayload {
  userId: number;
  email: string;
  username: string;
  roles: { value: string; description: string }[];
  iat?: number;
  exp?: number;
}
