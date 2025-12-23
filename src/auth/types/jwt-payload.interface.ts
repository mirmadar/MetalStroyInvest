export interface JwtPayload {
  id: number;
  email: string;
  roles: { value: string }[];
}
