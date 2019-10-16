// noinspection TsLint
import { Category } from './Category';
import { CouponToken } from './CouponToken';
import { User } from './User';

export interface Package extends Coupon {
  package: Array<PackItem>;
}

export interface Coupon {
  id?: number;
  title: string;
  description: string;
  image: string;
  timestamp?: Date | number;
  price: number;
  visible_from: Date | number;
  valid_from: Date | number;
  valid_until: Date | number;
  purchasable: number;
  constraints: string;
  qrToken?: any;
  quantity?: number;
  quantity_pack?: number;
  max_quantity?: number;
  owner?: number;
  CouponTokens?: Array<CouponToken> | any;
  token?: CouponToken;
  purchase_time?: Date | number;
  brokers?: Array<User>;
  categories?: Array<Category>;
  coupons?: Array<Coupon>;
  type?: number;
  assigned?: number;
  state?: string;
}

export interface PackItem {
  coupon: Coupon;
  quantity: number;
}
