import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
} from 'class-validator';

export class CreateIspDto {
  @IsNotEmpty({ message: 'ISP name is required' })
  @IsString()
  @Length(2, 100, { message: 'Name must be between 2 and 100 characters' })
  name!: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  description?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @IsOptional()
  // 📌 Optional: specify 'ZZ' for any region or 'KE' for Kenya
  @IsPhoneNumber('KE', { message: 'Invalid phone number format' })
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  ownerName?: string;

  @IsOptional()
  @IsString()
  website?: string;
}
