import { Length, Matches } from 'class-validator';

    export class UpdatePasswordDto {
    readonly oldPassword: string;

    @Length(8, 16, {message: 'Пароль должен быть не менее 8 и не более 16 символов'})
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, {
        message: 'Пароль должен содержать хотя бы одну букву и одну цифру'
    })
    readonly newPassword: string;
}
