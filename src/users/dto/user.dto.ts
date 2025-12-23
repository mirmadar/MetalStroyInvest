export class UserDto {
  readonly userId: number;
  readonly email: string;
  readonly username: string;
  readonly roles: { value: string; description: string }[];
}
