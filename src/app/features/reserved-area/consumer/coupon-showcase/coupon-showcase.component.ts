import {Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {environment} from '../../../../../environments/environment';
import {BreadcrumbActions} from '../../../../core/breadcrumb/breadcrumb.actions';
import {Breadcrumb} from '../../../../core/breadcrumb/Breadcrumb';
import {CouponService} from '../../../../shared/_services/coupon.service';
import {DomSanitizer} from '@angular/platform-browser';
import {BsModalRef} from 'ngx-bootstrap/modal/bs-modal-ref.service';
import {BsModalService} from 'ngx-bootstrap/modal';
import {Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {CartItem} from '../../../../shared/_models/CartItem';
import {StoreService} from '../../../../shared/_services/store.service';
import {LocalStorage} from '@ngx-pwa/local-storage';
import {FormBuilder, FormGroup, Validator, Validators} from '@angular/forms';
import {Coupon} from '../../../../shared/_models/Coupon';
import {CartActions} from '../cart/redux-cart/cart.actions';


@Component({
  selector: 'app-feature-reserved-area-consumer-showcase',
  templateUrl: './coupon-showcase.component.html',
  styleUrls: ['./coupon-showcase.component.scss']
})
export class FeatureReservedAreaConsumerShowcaseComponent implements OnInit, OnDestroy {

  coupons: any;
  couponsCheckCart = [];
  modalRef: BsModalRef;
  cart = new CartItem();
  crt = [];
  quantity = 1;
  maxQuantity = 1;
  isMax = false;
  bread = [] as Breadcrumb[];
  value: any;
  myForm: FormGroup;
  couponArray: any;


  constructor(private couponService: CouponService,
              private breadcrumbActions: BreadcrumbActions,
              private _sanitizer: DomSanitizer,
              private modalService: BsModalService,
              private localStore: StoreService,
              private cartActions: CartActions,
              private router: Router,
              private toastr: ToastrService,
              protected localStorage: LocalStorage,
              private formBuilder: FormBuilder) {

    this.localStorage.getItem('cart').subscribe(cart => {
      if (cart === null) {
        this.localStorage.setItem('cart', []);
      }
    });

  }

  ngOnInit(): void {
    this.loadCoupons();
    this.addBreadcrumb();


  }

  get f() {
    return this.myForm.controls;
  }


  ngOnDestroy(): void {
    this.removeBreadcrumb();
  }

  addBreadcrumb() {
    this.bread = [] as Breadcrumb[];

    this.bread.push(new Breadcrumb('Home', '/'));
    this.bread.push(new Breadcrumb('Reserved Area', '/reserved-area/'));
    this.bread.push(new Breadcrumb('Consumer', '/reserved-area/consumer/'));
    this.bread.push(new Breadcrumb('Shopping', '/reserved-area/consumer/showcase'));

    this.breadcrumbActions.updateBreadcrumb(this.bread);
  }

  removeBreadcrumb() {
    this.breadcrumbActions.deleteBreadcrumb();
  }

  loadCoupons() {
    this.couponService.getAvailableCoupons()
      .subscribe(coupons => {
        this.coupons = coupons;

        this.localStorage.getItem('cart').subscribe(cart => {
          if (cart === null) {
            this.coupons = coupons;
          } else {
            let getCart = [];
            getCart = cart;
            for (let i = 0; i < getCart.length; i++) {
              for (const j of this.coupons) {
                if (getCart[i].id === j.id) {
                  this.couponsCheckCart.push(j);
                  this.coupons = coupons;
                }
              }
            }
          }
        });
      }, err => {
        console.log(err);
      });
  }

  imageUrl(path) {
    return this._sanitizer.bypassSecurityTrustUrl(environment.protocol + '://' + environment.host + ':' + environment.port + '/' + path);
  }

  formatPrice(price) {
    if (price === 0) {
      return 'Free';
    }

    return '€ ' + price.toFixed(2);
  }

  openModal(template: TemplateRef<any>, cp) {
    this.couponService.getPurchasedCouponsById(cp.id).subscribe(purchased => { // TODO change this shit

      console.log(purchased);

      const count = 0;
      /*this.couponArray = coupon;
      if (!(this.couponArray === null)) {
        for (let i = 0; i < this.couponArray.length; i++) {
          if ((this.couponArray[i].id === cp.id)) {

            count = this.couponArray[i].CouponTokens.length;
          }

        }
      }*/


      this.maxQuantity = this.maxQuantityAvaliableForUser(cp.quantity, purchased.bought, cp.purchasable == null ? cp.quantity : cp.purchasable); // TODO checkme

      // if (this.maxQuantity < 1) {
      //  this.toastExcededBuy();
      //  return;
      // }

      this.myForm = this.formBuilder.group({
        quantity: [1, Validators.compose([Validators.min(1), Validators.max(this.maxQuantity), Validators.required])]

      });

      if (this.myForm.value.quantity === this.maxQuantity) {
        this.isMax = true;
      }
      this.modalRef = this.modalService.show(template, {class: 'modal-md modal-dialog-centered'});
    });
  }

  toastExcededBuy() {
    this.toastr.error('Coupon exceded to buy!');

  }

  decline(): void {
    this.isMax = false;
    this.modalRef.hide();
  }

  details(coupon: any) {

    this.couponService.setCoupon(coupon);

    this.router.navigate(['/reserved-area/consumer/details']);
  }

  toastCart() {
    this.toastr.success('Coupon added to the cart!');
  }


  addToCart(coupon: Coupon) {
/*
    if (this.myForm.invalid) {
      return;
    }

    const cpn = new Coupon();
    cpn.quantity = this.myForm.value.quantity;
    cpn.purchasable = this.maxQuantity; // passo quello che può comprare
    cpn.id = coupon.id;
    cpn.title = coupon.title;
    cpn.description = coupon.description;
    cpn.image = coupon.image;
    cpn.timestamp = coupon.timestamp;
    cpn.price = coupon.price;
    cpn.valid_from = coupon.valid_from;
    cpn.valid_until = coupon.valid_until;
    cpn.visible_from = coupon.visible_from;
    cpn.constraints = coupon.constraints;
    cpn.owner = coupon.owner;
    this.localStorage.getItem<any>('cart').subscribe((cart) => {
      if (cart === null) {
        this.localStorage.setItem('cart', [cpn]).subscribe(() => {
          this.loadCoupons();
          return;
        });
      } else {
        this.crt = cart;
        this.crt.push(cpn);
        this.localStorage.setItem('cart', this.crt).subscribe(() => {
          this.loadCoupons();
        });
      }
    });
    this.isMax = false;
    this.modalRef.hide();

    this.toastCart();*/



    this.modalRef.hide();

    const item: CartItem = {
      id: coupon.id,
      quantity: this.myForm.value.quantity
    };

    this.cartActions.addElement(item);


  }

  inCart(coupon) {

    for (const i of this.couponsCheckCart) {
      if (coupon.id === i.id) {
        return true;
      }
    }
    return false;

  }

  viewCart() {
    this.router.navigate(['/reserved-area/consumer/cart']);

  }

  add() {
    this.myForm.controls.quantity.setValue((this.myForm.value.quantity + 1));
    if (this.myForm.value.quantity === this.maxQuantity) {
      this.isMax = true;
    }
  }

  del() {

    this.myForm.controls.quantity.setValue((this.myForm.value.quantity - 1));
    this.isMax = false;
  }


  maxQuantityAvaliableForUser(dispTotal, quantityInCart, limitUser) {
    let max = 0;

    if (dispTotal > limitUser) {
      max = limitUser - quantityInCart;
    } else {
      if (limitUser - quantityInCart >= dispTotal) {
        max = dispTotal;
      } else {
        max = limitUser - quantityInCart;
      }
    }
    return max;
  }
}
