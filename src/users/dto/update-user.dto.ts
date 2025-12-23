import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'email должен быть строкой' })
  @IsEmail({}, { message: 'Некорректный email' })
  readonly email?: string;

  @IsOptional()
  @IsString({ message: 'Имя пользователя должно быть строкой' })
  readonly username?: string;

  @IsOptional()
  @IsString({ message: 'Роль должна быть строкой' })
  readonly role?: string;
}
