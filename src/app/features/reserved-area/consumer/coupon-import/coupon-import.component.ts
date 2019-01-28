import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CouponService} from '../../../../shared/_services/coupon.service';
import {Router} from '@angular/router';
import {BreadcrumbActions} from '../../../../core/breadcrumb/breadcrumb.actions';
import {ToastrService} from 'ngx-toastr';
import {Breadcrumb} from '../../../../core/breadcrumb/Breadcrumb';
import {ZXingScannerComponent} from '@zxing/ngx-scanner';
import {GlobalEventsManagerService} from '../../../../shared/_services/global-event-manager.service';

@Component({
  selector: 'app-coupon-token',
  templateUrl: './coupon-import.component.html',
  styleUrls: ['./coupon-import.component.scss']
})
export class CouponImportComponent implements OnInit, OnDestroy {
  tokenForm: FormGroup;
  submitted = false;
  data: any;
  isScan = false;

  @ViewChild('scanner')
  scanner: ZXingScannerComponent;

  hasCameras = false;
  hasPermission: boolean;
  qrResultString: string;
  availableDevices: MediaDeviceInfo[];
  selectedDevice: MediaDeviceInfo;
  desktopMode: boolean;
  constructor(
    public formBuilder: FormBuilder,
    public couponService: CouponService,
    private router: Router,
    private breadcrumbActions: BreadcrumbActions,
    private toastr: ToastrService,
    private globalEventService: GlobalEventsManagerService,

  ) {


  }

  ngOnInit() {
    this.newCamera();
    this.globalEventService.desktopMode.subscribe(message => {
      this.desktopMode = message
    });
    this.tokenForm = this.formBuilder.group({
      token: [null, Validators.required]
    });

    this.addBreadcrumb();
  }

  ngOnDestroy() {
    this.removeBreadcrumb();
  }

  get f() {
    return this.tokenForm.controls;
  }

  import() {
    this.submitted = true;


    this.data = {
      token: this.tokenForm.value.token,
    };

    this.couponService.importOfflineCoupon(this.data).subscribe(
      (data) => {
        if (data !== null) {
          this.toastValidate();
          this.router.navigate(['/reserved-area/consumer/bought']);
          return;
        } else {
          this.toastError();
          return;
        }
      }, error => {
        this.toastError();

        console.log(error);
        return;
      }
    );


  }

  addBreadcrumb() {
    const bread = [] as Breadcrumb[];

    // bread.push(new Breadcrumb('Home', '/'));
    // bread.push(new Breadcrumb('Reserved Area', '/reserved-area/'));
    bread.push(new Breadcrumb('Home', '/reserved-area/consumer/'));
    bread.push(new Breadcrumb('Import Coupon', '/reserved-area/consumer/coupon-import/'));

    this.breadcrumbActions.updateBreadcrumb(bread);
  }

  removeBreadcrumb() {
    this.breadcrumbActions.deleteBreadcrumb();
  }

  toastValidate() {
    this.toastr.success('Coupon importato con sucesso!');
  }

  toastError() {
    this.toastr.error('Coupon non valido!');
  }

  scan() {
    this.isScan = true;


  }


  qrCodeReadSuccess() {
    this.toastr.success('Qr-code letto correttamente!');
  }

  newCamera() {

    this.scanner.camerasFound.subscribe((devices: MediaDeviceInfo[]) => {
      this.hasCameras = true;


      this.availableDevices = devices;
    });

    this.scanner.camerasNotFound.subscribe((devices: MediaDeviceInfo[]) => {
      console.error('Errore fotocamera.');
    });

    this.scanner.permissionResponse.subscribe((answer: boolean) => {
      this.hasPermission = answer;
    });

  }

  handleQrCodeResult(resultString: string) {
    this.qrResultString = resultString;
    this.tokenForm.controls.token.setValue(resultString);
    this.qrCodeReadSuccess();
    this.isScan = false;
    this.selectedDevice = null;
  }

  onDeviceSelectChange(selectedValue: string) {
    this.selectedDevice = this.scanner.getDeviceById(selectedValue);
  }


}
