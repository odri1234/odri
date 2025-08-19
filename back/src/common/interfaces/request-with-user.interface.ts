import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
    role: string;
    ispId?: string;
    clientId?: string;
    permissions?: string[];
    [key: string]: any;
  };
}