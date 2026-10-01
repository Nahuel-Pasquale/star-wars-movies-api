import {
  IsEmail,
  IsString,
} from 'class-validator';
import {
  ApiProperty,
} from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Registered user email address',
    example: 'user@test.com',
    format: 'email',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'User password',
    example: 'Password123',
    minLength: 8,
    writeOnly: true,
  })
  @IsString()
  password!: string;
}