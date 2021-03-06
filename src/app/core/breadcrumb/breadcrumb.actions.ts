import {Injectable} from '@angular/core';
import {NgRedux, select} from '@angular-redux/store';
import {IAppState} from '../../shared/store/model';
import {Breadcrumb} from './Breadcrumb';

export const BREADCRUMB_UPDATE = 'BREADCRUMB_UPDATE';
export const BREADCRUMB_DELETE = 'BREADCRUMB_DELETE';
export const BREADCRUMB_CART_LENGTH = 'BREADCRUMB_CART_LENGTH';

@Injectable()
export class BreadcrumbActions {

  constructor(private ngRedux: NgRedux<IAppState>) {
  }

  updateBreadcrumb(breadcrumb: Breadcrumb[]) {
    this.ngRedux.dispatch({type: BREADCRUMB_UPDATE, list: breadcrumb});
  }

  deleteBreadcrumb() {
    this.ngRedux.dispatch({type: BREADCRUMB_DELETE});
  }

}
