export interface IUserSubscription {
  id: string;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  uniqueSubscriptionId: string;
  userId: string;
}
export interface IFullUserSubscription extends IUserSubscription {
  uniqueSubscription: IUniqueSubscription;
}
export interface IUniqueSubscription {
  id: string;
  durationDays: number;
  type: string;
  price: number;
  image: string;
  salePercent: number | null;
  createdAt: Date;
  updatedAt: Date;
}
