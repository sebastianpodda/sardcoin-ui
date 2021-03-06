import { select } from '@angular-redux/store';
import { Component, OnDestroy, OnInit, TemplateRef, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import * as _ from 'lodash';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subscription } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Breadcrumb } from '../../../../core/breadcrumb/Breadcrumb';
import { BreadcrumbActions } from '../../../../core/breadcrumb/breadcrumb.actions';
import { CartItem, ITEM_TYPE } from '../../../../shared/_models/CartItem';
import { Coupon } from '../../../../shared/_models/Coupon';
import { CouponService } from '../../../../shared/_services/coupon.service';
import { GlobalEventsManagerService } from '../../../../shared/_services/global-event-manager.service';
import { PackageService } from '../../../../shared/_services/package.service';
import { StoreService } from '../../../../shared/_services/store.service';
import { UserService } from '../../../../shared/_services/user.service';
import { LoginState } from '../../../authentication/login/login.model';
import { CartActions } from '../cart/redux-cart/cart.actions';
@Component({
  selector: 'app-coupon-details',
  templateUrl: './coupon-details.component.html',
  styleUrls: ['./coupon-details.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class CouponDetailsComponent implements OnInit, OnDestroy {

  @select() login$: Observable<LoginState>;

  imageURL = environment.protocol + '://' + environment.host + ':' + environment.port + '/';
  modalRef: BsModalRef;
  myForm: FormGroup;
  couponPass: Coupon = null;
  isMax = false;
  producer = null;
  desktopMode: boolean;
  error404 = false;
  userType: number;
  isUserLoggedIn: boolean;
  couponsPackage = null;
  item_type;

  ITEM_TYPE = ITEM_TYPE;

  routeSubscription: Subscription;

  constructor(
    private breadcrumbActions: BreadcrumbActions,
    private couponService: CouponService,
    private router: Router,
    private modalService: BsModalService,
    private localStore: StoreService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private cartActions: CartActions,
    private globalEventService: GlobalEventsManagerService,
    private packageService: PackageService,
    private _sanitizer: DomSanitizer

  ) {
    this.globalEventService.desktopMode.subscribe(message => {
      this.desktopMode = message;

      this.item_type = ITEM_TYPE;
    });

  }

  async ngOnInit() {
    // If the user is already in coupon details and choose another coupon, then in order to change coupon there is to listen to the route change
    this.routeSubscription = this.router.events.subscribe(async event => {
        if (event instanceof NavigationEnd) {
          await this.loadCoupon();
          this.addBreadcrumb();
        }
      }
    );

    this.login$.subscribe(login => {
      this.isUserLoggedIn = login.isLogged;
      this.userType = parseInt(this.localStore.getType());
    });

    await this.loadCoupon();
    this.addBreadcrumb();
  }

  async loadCoupon() {
    const pathArray = this.route.snapshot.url[this.route.snapshot.url.length - 1].path.split('-');
    const title = pathArray.slice(1).toString().replace(new RegExp(',', 'g'), ' ');
    const id = parseInt(pathArray[0]);

    if (!isNaN(id)) {
      try {
        this.couponPass = await this.couponService.getCouponById(id).toPromise();
        if (this.couponPass.type === ITEM_TYPE.PACKAGE) {
          const couponsIncluded = await this.packageService.getCouponsPackage(this.couponPass.id).toPromise();
          this.couponsPackage = _.groupBy(couponsIncluded.coupons_array, 'id');
        }

        // If a coupon with the passed ID does not exist, or the title has not been passed, or the title it is different from the real coupon, it returns 404
        if (this.couponPass === null) { // prima era if (this.couponPass === null || this.couponPass.title !== title || !title)
            this.error404 = true;
        } else {
          if (!this.couponPass.max_quantity && this.isUserLoggedIn && this.userType === 2) {
            this.couponPass.max_quantity = await this.cartActions.getQuantityAvailableForUser(this.couponPass.id);
          }
          this.getOwner();
        }
      } catch (e) { // TODO edit
        console.error(e);
      }
    } else {
      this.error404 = true;
    }
  }

  async addToCart() {
    if (this.myForm.invalid) {
      return;
    }

    const item: CartItem = {
      id: this.couponPass.id,
      quantity: this.myForm.value.quantity,
      price: this.couponPass.price,
      type: this.couponPass.type
    };

    if (await this.cartActions.addElement(item)) {
      this.toastr.success('', this.couponPass.title + ' aggiunto alla cassa.');
    } else {
      this.toastr.error(this.couponPass.title + ' non è stato aggiunto alla cassa.', 'Coupon non aggiunto');
    }

    this.modalRef.hide();
    this.viewCart();
  }

  ngOnDestroy(): void {
    this.breadcrumbActions.deleteBreadcrumb();
    this.routeSubscription.unsubscribe();
  }

  get f() {
    return this.myForm.controls;
  }

  openModal(template: TemplateRef<any>) {

    if (this.couponPass.max_quantity === 0) {
      this.toastr.error('Hai già raggiunto la quantità massima acquistabile per questo coupon o è esaurito.', 'Coupon non aggiunto');

      return;
    }

    this.myForm = this.formBuilder.group({
      quantity: [1, Validators.compose([Validators.min(1), Validators.max(this.couponPass.max_quantity), Validators.required])]

    });

    this.isMax = this.myForm.value.quantity === this.couponPass.max_quantity;
    this.modalRef = this.modalService.show(template, {class: 'modal-md modal-dialog-centered'});
  }

  inCart(coupon_id: number): boolean {
    return this.cartActions.isInCart(coupon_id) >= 0; // If true, the element exists and its index is been retrievd
  }

  isCartEmpty(): boolean {
    return this.cartActions.isCartEmpty();
  }

  add() {
    if (!this.isMax) {
      this.myForm.controls.quantity.setValue((this.myForm.value.quantity + 1));
      this.isMax = this.myForm.value.quantity === this.couponPass.max_quantity;
    }
  }

  del() {
    this.myForm.controls.quantity.setValue((this.myForm.value.quantity - 1));
    this.isMax = false;
  }

  closeModal() {
    this.modalRef.hide();
  }

  getOwner() {
    this.userService.getProducerFromId(this.couponPass.owner).subscribe(user => {
      this.producer = user;
      this.couponService.setUserCoupon(this.producer);
    });
  }

  viewCart() {
    this.router.navigate(['/cart']);
  }

  formatPrice(price) {
    if (price === 0) {
      return 'Gratis';
    }

    return '€ ' + price.toFixed(2);
  }

  formatUntil(inputDate) {
    if (inputDate === null) {
      return 'senza scadenza';
    }

    const date = inputDate.toString().substring(0, inputDate.indexOf('T'));
    const time = inputDate.toString().substring(inputDate.indexOf('T') + 1, inputDate.indexOf('Z') - 4);

    return date + ' ' + time;
  }

  retry() {
    const arrayUrl = this.router.url.slice(1).split('/');
    const url = arrayUrl.includes('reserved-area') ? arrayUrl[0] + '/' + arrayUrl[1] : '';
    this.router.navigate([url + '/showcase']);
  }

  addBreadcrumb() {
    const bread = [] as Array<Breadcrumb>;

    bread.push(new Breadcrumb('Home', '/'));
    bread.push(new Breadcrumb('Shopping', '/showcase'));
    bread.push(new Breadcrumb(this.couponPass.title, '/bought/myPurchases'));

    this.breadcrumbActions.updateBreadcrumb(bread);
  }

  getNumberCoupons() {
    const values = _.values(this.couponsPackage).map((el: Array<any>) => el.length);

    return values.length > 0 ? values.reduce((a, b) => a + b) : '';
  }

  byPassHTML(html: string) {
    //console.log('html', html, typeof html)
    return this._sanitizer.bypassSecurityTrustHtml(html)
  }

}
