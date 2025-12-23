import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'email должен быть строкой' })
  @IsEmail({}, { message: 'Некорректный email' })
  readonly email: string;

  @IsString({ message: 'Имя пользователя должно быть строкой' })
  readonly username: string;

  @Length(8, 16, { message: 'Пароль должен быть не менее 8 и не более 16 символов' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, {
    message: 'Пароль должен содержать хотя бы одну букву и одну цифру',
  })
  readonly password: string;

  @IsString({ message: 'Роль должна быть строкой' })
  readonly role: string;
}
