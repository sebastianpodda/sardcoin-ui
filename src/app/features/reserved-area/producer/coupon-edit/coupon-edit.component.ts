import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { FileItem, FileUploader, ParsedResponseHeaders } from 'ng2-file-upload';
import { EditorChangeContent, EditorChangeSelection, QuillEditor } from 'ngx-quill';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../../environments/environment';
import { Breadcrumb } from '../../../../core/breadcrumb/Breadcrumb';
import { BreadcrumbActions } from '../../../../core/breadcrumb/breadcrumb.actions';
import { Category } from '../../../../shared/_models/Category';
import { Coupon } from '../../../../shared/_models/Coupon';
import { User } from '../../../../shared/_models/User';
import { CategoriesService } from '../../../../shared/_services/categories.service';
import { CouponService } from '../../../../shared/_services/coupon.service';
import { StoreService } from '../../../../shared/_services/store.service';
import { UserService } from '../../../../shared/_services/user.service';
import { DateValidation } from '../coupon-create/validator/DateValidation.directive';
import { QuantityCouponValidation } from '../coupon-create/validator/QuantityCouponValidation.directive';

import * as QuillNamespace from 'quill';
const Quill: any = QuillNamespace;
import ImageResize from 'quill-image-resize-module';

Quill.register('modules/imageResize', ImageResize);
@Component({
  selector: 'app-edit-coupon',
  templateUrl: './coupon-edit.component.html',
  styleUrls: ['./coupon-edit.component.scss']
})

export class CouponEditComponent implements OnInit, OnDestroy {
  @BlockUI() blockUI: NgBlockUI;

  toolbarOptions = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
      ['blockquote', 'code-block'],

      [{ header: 1 }, { header: 2 }],               // custom button values
      [{ list: 'ordered'}, { list: 'bullet' }],
      [{ script: 'sub'}, { script: 'super' }],      // superscript/subscript
      [{ indent: '-1'}, { indent: '+1' }],          // outdent/indent
      [{ direction: 'rtl' }],                         // text direction

      [{ size: ['small', false, 'large', 'huge'] }],  // custom dropdown
      [{ header: [1, 2, 3, 4, 5, 6, false] }],

      [{ color: [] }, { background: [] }],          // dropdown with defaults from theme
      [{ font: [] }],
      [{ align: [] }],

      ['clean'],                                        // remove formatting button
      ['link', 'image', 'video']
    ],
    imageResize: true
    // handlers: {
    //   'image': []
    // }
  };
  brokers: Array<User>;
  categories: any;
  selectedCategories: Array<Category> = [];
  selectedBroker = [];
  imageSelected = null;
  couponForm: FormGroup;

  markedUnlimited = false;
  markedFree = false;
  markedConstraints = false;
  markedQuantity = false;
  markedPrivate = false;

  bgColorCalendar = '#FFF';
  bgColorPrivate = '#FFF';

  fromEdit = false;
  submitted = false;

  couponPass: Coupon;
  categoriesUpdate = false;
  imageURL = environment.protocol + '://' + environment.host + ':' + environment.port + '/';
  imagePath: string = null;

  uploader: FileUploader = new FileUploader({
    url: environment.protocol + '://' + environment.host + ':' + environment.port + '/coupons/addImage',
    authToken: 'Bearer ' + this.storeService.getToken()
  });

  blured = false;
  focused = false;
  created(event: QuillEditor) {
    // tslint:disable-next-line:no-console
    // console.log('editor-created', event)
  }

  changedEditor(event: EditorChangeContent | EditorChangeSelection) {
    // tslint:disable-next-line:no-console
    // console.log('editor-change', event)
  }

  focus($event) {
    // tslint:disable-next-line:no-console
    // console.log('focus', $event)
    this.focused = true;
    this.blured = false;
  }

  blur($event) {
    // tslint:disable-next-line:no-console
    // console.log('blur', $event)
    this.focused = false;
    this.blured = true;
  }

  constructor(
    private router: Router,
    public formBuilder: FormBuilder,
    public couponService: CouponService,
    public storeService: StoreService,
    private breadcrumbActions: BreadcrumbActions,
    private toastr: ToastrService,
    private userService: UserService,
    private categoriesService: CategoriesService,
    private sanitizer: DomSanitizer

  ) {

    this.couponService.currentMessage.subscribe(coupon => {
      this.couponPass = coupon;
      //// console.log(this.couponPass)

      if (this.couponPass === null || this.couponPass === undefined) {
        this.router.navigate(['/reserved-area/producer/list']);
      } else {
        this.couponService.getBrokerFromCouponId(this.couponPass.id).subscribe(brokers => {

          this.selectedBroker = brokers;
          //// console.log('brokers for coupon', this.selectedBroker)
        });
      }

    });
    this.couponService.checkFrom.subscribe(fromEdit => this.fromEdit = fromEdit);

    this.categoriesService.getAll().subscribe(cat => {
      this.categories = cat;
    });
    this.userService.getBrokers().subscribe(brokers => {
      this.brokers = brokers;
    });

  }

  ngOnInit() {



    let until = null;
    // If the coupon passed does not exist, the user is been redirect to the list of coupons
    if (this.couponPass === null || this.couponPass === undefined) {
      this.router.navigate(['/reserved-area/producer/list']);
    } else {
      this.imageURL = this.imageURL + this.couponPass.image;
      until = this.couponPass.valid_until === null ? '' : this.couponPass.valid_until;
      this.categoriesService.getCategoryCoupon(this.couponPass.id).subscribe(catCp => {
        this.categoriesService.getAll().subscribe(cat => {
          this.categories = cat;
          for (const c of catCp.category) {
            const category = this.categories.find(el => el.id === c.category_id);
            this.selectedCategories.push(category);
          }
          this.categoriesUpdate = true;
        });
      });

      this.initMarked();

      this.bgColorCalendar = this.markedUnlimited ? '#E4E7EA' : '#FFF';
      this.bgColorPrivate = this.markedPrivate ? '#E4E7EA' : '#FFF';

      this.couponForm = this.formBuilder.group({
        title: [this.couponPass.title, Validators.compose([Validators.maxLength(80), Validators.minLength(5), Validators.required])],
        short_description: [this.couponPass.short_description, Validators.compose([Validators.maxLength(55000), Validators.minLength(5), Validators.required])],
        description: [this.couponPass.description, Validators.compose([Validators.maxLength(55000), Validators.minLength(5), Validators.required])],
        image: [this.imagePath],
        price: [{
          value: this.markedFree ? 0 : this.couponPass.price.toFixed(2),
          disabled: this.markedFree
        },      Validators.compose([Validators.required])],
        valid_until_empty: [this.markedUnlimited],
        published_from: [{value: this.markedPrivate ? null : new Date().setMinutes(new Date().getMinutes() + 10), disabled: this.markedPrivate}],
        categories: [this.selectedCategories],
        broker: [this.selectedBroker],
        valid_from: [this.couponPass.valid_from, Validators.compose([Validators.required])],
        valid_until: [{value: this.markedUnlimited ? null : until, disabled: this.markedUnlimited}],
        constraints: [{value: this.markedConstraints ? null : this.couponPass.constraints, disabled: this.markedConstraints}],
        quantity: [{value: this.couponPass.quantity, disabled: this.fromEdit}],
        purchasable: [{value: this.markedQuantity ? null : this.couponPass.purchasable, disabled: this.markedQuantity}, Validators.required]
      }, {
        validator: Validators.compose([DateValidation.CheckDateDay, QuantityCouponValidation.CheckQuantityCoupon])
      });

      this.addBreadcrumb();
      this.uploader.onErrorItem = (item, response, status, headers) => this.onErrorItem(item, response, status, headers);
      this.uploader.onSuccessItem = (item, response, status, headers) => this.onSuccessItem(item, response, status, headers);
    }


  }

  get f() {
    return this.couponForm.controls;
  }

  async saveChange() {
    this.submitted = true;

    if (this.couponForm.invalid) {
      return;
    }

    const visibleTime = new Date(this.f.published_from.value).getTime() < new Date().setMinutes(new Date().getMinutes() + 10) ? new Date().setMinutes(new Date().getMinutes() + 10) : this.f.published_from.value;

    const coupon: Coupon = {
      id: this.couponPass.id,
      title: this.f.title.value,
      short_description: this.f.short_description.value,
      description: this.f.description.value,
      image: this.imagePath ? this.imagePath : this.couponPass.image,
      timestamp: this.couponPass.timestamp,
      price: this.markedFree ? 0 : this.f.price.value,
      visible_from: this.markedPrivate ? null : (new Date(visibleTime)).getTime().valueOf(),
      valid_from: (new Date(this.f.valid_from.value)).getTime().valueOf(),
      valid_until: this.markedUnlimited ? null : (new Date(this.f.valid_until.value)).getTime().valueOf(),
      constraints: this.markedConstraints ? null : this.f.constraints.value,
      purchasable: this.markedQuantity ? null : this.f.purchasable.value,
      quantity: this.f.quantity.value,
      brokers: this.selectedBroker,
      categories: this.selectedCategories,
      type: 0

    };

    // If true, the coupon is in edit mode, else the producer is creating a clone of a coupon
    if (this.fromEdit) {
      await this.editCoupon(coupon);
    } else {
      delete coupon.id;
      await this.createCopy(coupon);
    }

  }

  async createCopy(coupon: Coupon) {
    const uploadDone = await this.uploadFiles(this.uploader);
    if (!uploadDone) {
      this.toastr.error('Errore imprevisto durante il caricamento dell\'immagine.', 'Errore caricamento immagine');

      return;
    }
    this.blockUI.start('Attendi la registrazione su Blockchain'); // Start blocking

    this.couponService.create(coupon)
      .subscribe(data => {
        this.blockUI.stop(); // Stop blocking

        // if (data['created']) {
        this.toastr.success('', 'Coupon creato con successo!');
        this.router.navigate(['/reserved-area/producer/list']);
        // } else {
        //   this.toastr.error('Errore imprevisto durante la creazione del coupon.', 'Errore durante la creazione');
        // }
      }, err => {
        // console.log(err);
        this.blockUI.stop(); // Stop blocking

        this.toastr.error('Errore imprevisto durante la creazione del coupon.', 'Errore durante la creazione');
      });
  }

  async editCoupon(coupon: Coupon) {
    const uploadDone = await this.uploadFiles(this.uploader);
    //// console.log('uploadDone', uploadDone)
    if (!uploadDone) {
      this.toastr.error('Errore imprevisto durante il caricamento dell\'immagine.', 'Errore caricamento immagine');

      return;
    }
    this.blockUI.start('Attendi la registrazione su Blockchain'); // Start blocking

    this.couponService.editCoupon(coupon)
      .subscribe(data => {
        if (data === null) {
          this.blockUI.stop(); // Stop blocking

          this.toastr.warning('Non è stato modificato alcun campo', 'Attenzione');
        } else {
          this.blockUI.stop(); // Stop blocking

          this.toastr.success('', 'Coupon modificato con successo!');
          this.router.navigate(['/reserved-area/producer/list']);
        }
      }, err => {
        // console.log(err);
        this.blockUI.stop(); // Stop blocking

        this.toastr.error('Errore di modifica, se è visibile o è stato acquistato non può essere modificato.', 'Errore');
      });



  }

  addBreadcrumb() {
    const bread = [] as Array<Breadcrumb>;

    if (this.fromEdit){
    bread.push(new Breadcrumb('Home', '/reserved-area/producer/'));
    bread.push(new Breadcrumb('Modifica ' + this.couponPass.title, '/reserved-area/producer/edit/'));
    } else {
      bread.push(new Breadcrumb('Home', '/reserved-area/producer/'));
      bread.push(new Breadcrumb('Copia ' + this.couponPass.title, '/reserved-area/producer/edit/'));
    }

    this.breadcrumbActions.updateBreadcrumb(bread);
  }

  removeBreadcrumb() {
    this.breadcrumbActions.deleteBreadcrumb();
  }

  ngOnDestroy() {
    this.removeBreadcrumb();
  }

  onSuccessItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {
    const data = JSON.parse(response); // success server response
    this.imagePath = data.image;

  }

  onErrorItem(item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {
    //// console.log(response);
  }

  toggleCheckbox(e) {

    switch (e.srcElement.id) {

      case 'privateCheck':
        this.markedPrivate = e.target.checked;

        if (this.markedPrivate) {
          this.couponForm.get('published_from').disable();
          this.couponForm.get('published_from').setValue(null);
          this.bgColorPrivate = '#E4E7EA';
        } else {
          this.couponForm.get('published_from').enable();
          this.couponForm.get('published_from').setValue(Date.now());
          this.bgColorPrivate = '#FFF';
        }
        break;

      case 'freeCheck':
        this.markedFree = e.target.checked;

        if (this.markedFree) {
          this.couponForm.get('price').disable();
        } else {
          this.couponForm.get('price').enable();
        }
        break;

      case 'unlimitedCheck':
        this.markedUnlimited = e.target.checked;

        if (this.markedUnlimited === true) {
          this.couponForm.get('valid_until').disable();
          this.bgColorCalendar = '#E4E7EA';
        } else {
          this.couponForm.get('valid_until').enable();
          this.bgColorCalendar = '#FFF';
        }

        delete this.couponForm.value.valid_until;
        this.couponForm.value.valid_until_empty = true;
        break;

      case 'constraintsCheck':
        this.markedConstraints = e.target.checked;

        if (this.markedConstraints) {
          this.couponForm.get('constraints').disable();
        } else {
          this.couponForm.get('constraints').enable();
        }

        this.couponForm.value.constraints = '';
        break;

      case 'quantityCheck':
        this.markedQuantity = e.target.checked;

        if (this.markedQuantity) {
          this.couponForm.get('purchasable').disable();
        } else {
          this.couponForm.get('purchasable').enable();
        }
        break;
    }
  }

  initMarked() {
    this.markedUnlimited = this.couponPass.valid_until === null;
    this.markedQuantity = this.couponPass.purchasable === null;
    this.markedFree = this.couponPass.price === 0;
    this.markedConstraints = this.couponPass.constraints === null;
    this.markedPrivate = this.couponPass.visible_from === null;
  }

  async uploadFiles(inputElement) {

    //// console.log('inputElement', inputElement)
    if (inputElement.queue[0]) {

      try {
        inputElement.queue[0].upload();
        this.imagePath = inputElement.queue[0]._file.name;

        return true;
      } catch (e) {
        //// console.log('error upload image', e);
        this.imagePath = null;

        return false;
      }
    } else {
      return true;
    }
  }

  preview(files) {
    if (files.length === 0) {
      return;
    }
    const mimeType = files[0].type;
    //// console.log('files[0]', files[0])
    if (mimeType.match(/image\/*/) == undefined) {
      return;
    }

    const reader = new FileReader();
    this.imagePath = files[0].name;
    reader.readAsDataURL(files[0]);
    reader.onload = _event => {
      this.imageSelected = reader.result;
    };
  }

  byPassHTML(html: string) {
    // console.log('html', html, typeof html)
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
