import {Injectable} from '@angular/core';
import {NgRedux, select} from '@angular-redux/store';
import {IAppState} from '../../../../../shared/store/model';
import {StoreService} from '../../../../../shared/_services/store.service';
import {Observable} from 'rxjs';
import {CartItem, PurchasedCoupon} from '../../../../../shared/_models/CartItem';
import {CouponService} from '../../../../../shared/_services/coupon.service';
import {Coupon} from '../../../../../shared/_models/Coupon';
import {Category} from '../../../../../shared/_models/Category';

export const FILTER_UPDATE = 'FILTER_UPDATE';
export const FILTER_CLEAR  = 'FILTER_CLEAR';


@Injectable()
export class FilterActions {

  constructor(
    private ngRedux: NgRedux<IAppState>,
  ) {
  }

  update(coupons: Coupon[], category: Category, searchText: string) {
    this.ngRedux.dispatch({type: FILTER_UPDATE, list: coupons, category: category, searchText: searchText});
  }

  clear(){
    this.ngRedux.dispatch({type: FILTER_CLEAR});
  }

}
