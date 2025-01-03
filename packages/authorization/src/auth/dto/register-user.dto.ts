import { IsEmail, IsStrongPassword } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterUserDto {
  @Transform(({ value }) => value.toLowerCase())
  @IsEmail()
  email: string;

  @IsStrongPassword({
    minLength: 6,
    minNumbers: 1,
    minLowercase: 0,
    minUppercase: 0,
    minSymbols: 0,
  })
  password: string;
}
