import {IsEmail, IsString, Length} from "class-validator";

export class LoginUserDto{
    @IsString({message: "email должен быть строкой"})
    @IsEmail({},{message: 'Некорректный email'})
    readonly email: string;
    
    @Length(8, 16, {message: 'Пароль должен быть не менее 8 и не более 16 символов'})
    readonly password: string;
}