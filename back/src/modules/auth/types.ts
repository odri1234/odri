import { User } from '../users/entities/user.entity';

// SafeUser type excluding sensitive properties and forcing `phone` to be required
export type SafeUser = Omit<
  User,
  'password' | 'hashPassword' | 'validatePassword' | 'phone'
> & {
  phone: string;
};
