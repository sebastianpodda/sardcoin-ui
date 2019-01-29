import {Component, OnDestroy, OnInit} from '@angular/core';
import {CouponService} from '../../../../shared/_services/coupon.service';
import {BreadcrumbActions} from '../../../../core/breadcrumb/breadcrumb.actions';
import {Breadcrumb} from '../../../../core/breadcrumb/Breadcrumb';
import {Router} from '@angular/router';
import {User} from '../../../../shared/_models/User';

@Component({
  selector: 'app-producer-info-coupon',
  templateUrl: './producer-info.component.html',
  styleUrls: ['./producer-info.component.scss']
})
export class ProducerInfoComponent implements OnInit, OnDestroy {
  producer: User;
  couponPass: any;

  constructor(
    private breadcrumbActions: BreadcrumbActions,
    private couponService: CouponService,
    private router: Router,
  ) {
  }

  ngOnInit() {
    this.couponService.currentUserCoupon.subscribe(user => {

      if(user){
        this.producer = user;
        console.log(user);
        this.addBreadcrumb();
      } else {
        this.router.navigate(['/reserved-area/consumer/showcase']);
      }
    });

    this.couponService.currentMessage.subscribe(coupon => {
      this.couponPass = coupon;
    });

  }

  ngOnDestroy(): void {
    this.removeBreadcrumb();
  }

  removeBreadcrumb() {
    this.breadcrumbActions.deleteBreadcrumb();
  }

  addBreadcrumb() {
    const bread = [] as Breadcrumb[];
    const companyName = this.producer.company_name;

    // bread.push(new Breadcrumb('Home', '/'));
    // bread.push(new Breadcrumb('Reserved Area', '/reserved-area/'));
    bread.push(new Breadcrumb('Home', '/reserved-area/consumer/'));
    bread.push(new Breadcrumb(companyName + ' info', '/reserved-area/consumer/producer-info'));

    this.breadcrumbActions.updateBreadcrumb(bread);
  }

  retry() {
    this.router.navigate(['/reserved-area/consumer/showcase']);
  }

}
