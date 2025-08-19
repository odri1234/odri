import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../constants/user-role.constants';

export class UserProfileDto {
  @ApiProperty({ example: 'd42b5910-b93e-4c30-8904-64c9cfe10f45' })
  id!: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  email!: string;

  @ApiProperty({ example: 'John Doe' })
  fullName!: string;

  @ApiProperty({ example: '0712345678' })
  phone!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.CLIENT })
  role!: UserRole;

  @ApiProperty({
    example: 'f82b2cd4-abc1-4bdf-84f7-8305b6fc159f',
    description: 'ISP ID if applicable',
  })
  ispId!: string;

  @ApiProperty({ example: '2025-07-01T10:23:45.123Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2025-07-11T06:42:19.987Z' })
  updatedAt!: Date;
}
