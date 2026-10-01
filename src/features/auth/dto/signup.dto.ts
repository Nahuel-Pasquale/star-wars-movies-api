import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class SignupDto {
  @ApiProperty({
    example: 'user@test.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'Password123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @Matches(/[A-Z]/, {
    message:
      'password must contain at least one uppercase letter',
  })
  @Matches(/[a-z]/, {
    message:
      'password must contain at least one lowercase letter',
  })
  @Matches(/[0-9]/, {
    message:
      'password must contain at least one number',
  })
  password!: string;
}