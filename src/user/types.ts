import { IUserSubscription } from 'src/subscription/types';

export interface IUserProfile {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  name: string;
  avatar: string;
  subscriptions: IUserSubscription[];
}
