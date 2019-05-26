import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {FeatureReservedAreaConsumerShowcaseComponent} from './coupon-showcase/coupon-showcase.component';
import {FeatureReservedAreaConsumerBoughtComponent} from './coupon-bought/coupon-bought.component';
import {CouponDetailsComponent} from './coupon-details/coupon-details.component';
import {CartComponent} from './cart/cart.component';
import {CheckoutComponent} from './checkout/checkout.component';
import {CouponImportComponent} from './coupon-import/coupon-import.component';
import {CouponBoughtDetailComponent} from './coupon-bought/coupon-bought-detail/coupon-bought-detail.component';
import {ProducerInfoComponent} from './producer-info/producer-info.component';
import {PersonalInfoComponent} from '../personal-info/personal-info.component';
import {PaymentDetailsComponent} from '../payment-details/payment-details.component';
import {CouponOrderDetailComponent} from './coupon-order/coupon-order-detail/coupon-order-detail.component';
import {FeatureReservedAreaConsumerOrderComponent} from './coupon-order/coupon-order.component';
import {CouponDetailIntoOrderComponent} from './coupon-order/coupon-order-detail/coupon-detail-into-order/coupon-detail-into-order.component';
import {IsAuthenticatedGuard} from '../../../shared/_guards/is-authenticated.guard';

/** App Components **/

// Is Authenticated Guard verifies if the user is logged in order to access to certain services.
// The user doesn't know the link for the reserved parts of the website, and even if he tries to access he would be redirect to the login page.

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        redirectTo: 'showcase',
        pathMatch: 'full'
      },
      {
        path: 'showcase',
        component: FeatureReservedAreaConsumerShowcaseComponent
      },
      {
        path: 'details/:id',
        component: CouponDetailsComponent
      },
      {
        path: 'cart',
        component: CartComponent
      },
      {
        path: 'checkout',
        component: CheckoutComponent,
        canActivate: [IsAuthenticatedGuard]
      },
      {
        path: 'coupon-import',
        component: CouponImportComponent,
        canActivate: [IsAuthenticatedGuard]
      },
      {
        path: 'personal-info',
        component: PersonalInfoComponent,
        canActivate: [IsAuthenticatedGuard]
      },
      {
        path: 'payment-details',
        component: PaymentDetailsComponent,
        canActivate: [IsAuthenticatedGuard]
      },
      {
        path: 'producer-info',
        component: ProducerInfoComponent
      },
      {
        path: 'bought',
        component: FeatureReservedAreaConsumerBoughtComponent,
        canActivate: [IsAuthenticatedGuard]
      },
      {
        path: 'order',
        component: FeatureReservedAreaConsumerOrderComponent,
        canActivate: [IsAuthenticatedGuard]
      },
      {
        path: 'bought/details',
        component: CouponBoughtDetailComponent,
        canActivate: [IsAuthenticatedGuard]
      },
      {
        path: 'order/details',
        component: CouponOrderDetailComponent,
        canActivate: [IsAuthenticatedGuard]
      },
      {
        path: 'order/details/details-coupon',
        component: CouponDetailIntoOrderComponent,
        canActivate: [IsAuthenticatedGuard]
      }
    ])
  ],
  exports: [RouterModule]
})
export class ConsumerRoutingModule {
}
