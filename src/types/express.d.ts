// Этот файл нужен для расширения типов Express
import { Request } from 'express';

declare module 'express' {
  export interface Request {
    user?: {
      userId: number;
      email: string;
      username: string;
      roles: { value: string; description: string }[];
    };
  }
}
