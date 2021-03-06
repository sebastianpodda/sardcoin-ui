import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../../environments/environment';
import { Breadcrumb } from '../../../../core/breadcrumb/Breadcrumb';
import { BreadcrumbActions } from '../../../../core/breadcrumb/breadcrumb.actions';
import { Coupon } from '../../../../shared/_models/Coupon';
import { CouponService } from '../../../../shared/_services/coupon.service';
import { PackageService } from '../../../../shared/_services/package.service';

@Component({
  selector: 'app-feature-reserved-area-package-list',
  templateUrl: './package-list.component.html',
  styleUrls: ['./package-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class FeatureReservedAreaPackageListComponent implements OnInit, OnDestroy {
  @BlockUI() blockUI: NgBlockUI;

  modalRef: BsModalRef;
  modalCoupon: Coupon;
  data;
  current = new Date();
  timestamp = this.current.getTime();

  dataSource: MatTableDataSource<Coupon>;
  displayedColumns: Array<string> = ['title', 'image', 'price', 'state', 'quantity', 'buyed', 'buttons'];

  @ViewChild('template') template: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private modalService: BsModalService,
    private couponService: CouponService,
    private packageService: PackageService,
    private router: Router,
    private breadcrumbActions: BreadcrumbActions,
    private _sanitizer: DomSanitizer,
    private toastr: ToastrService) {
  }

  ngOnInit(): void {
    this.control();
    this.addBreadcrumb();
    // this.current.setHours(0);
    //
    // this.current.setMinutes(0);
    //
    // this.current.setSeconds(0);
    //
    // this.current.setMilliseconds(0);
    // this.timestamp = this.current.getTime();
  }

  onEdit = (pack: Coupon): void => {
    this.couponService.setCoupon(pack);
    this.couponService.setFromEdit(true);
    this.router.navigate(['reserved-area/broker/edit']);
  };

  onCopy = (pack: Coupon): void => {
    this.couponService.setCoupon(pack);
    this.couponService.setFromEdit(false);
    this.router.navigate(['reserved-area/broker/create'], {queryParams: { fromMenu: '' }});
  };

  onDelete = (coupon: Coupon): void => {
    this.couponService.deleteCoupon(coupon.id, 1)
      .subscribe(data => {
        this.blockUI.start('Attendi la registrazione su Blockchain'); // Start blocking

        if (data.deleted) {
          this.blockUI.stop(); // Stop blocking

          this.toastr.success('Eliminazione riuscita.', 'Pacchetto eliminato!');
          this.control();
        }
        if (data.bought) {
          this.blockUI.stop(); // Stop blocking

          this.toastr.error('Non puoi eliminarlo.', 'Pacchetto venduto!');
        }
      }, error => {
        // console.log(error);
        this.blockUI.stop(); // Stop blocking

        this.toastr.error('Si è verificato un errore durante l\'eliminazione del Pacchetto.', 'Errore');
      });

    this.modalRef.hide();
  };

  formatState = (state): string => 'Attivo'; // TODO fix

  addBreadcrumb = (): void => {
    const bread: Array<Breadcrumb> = [];

    bread.push(new Breadcrumb('Home', '/'));
    bread.push(new Breadcrumb('I miei pacchetti', '/reserved-area/producer/list/'));

    this.breadcrumbActions.updateBreadcrumb(bread);
  };

  removeBreadcrumb = (): void => {
    this.breadcrumbActions.deleteBreadcrumb();
  };

  ngOnDestroy = (): void => {
    this.removeBreadcrumb();
  };

  imageUrl = (path): SafeUrl =>
    // return correct address and port backend plus name image
    this._sanitizer.bypassSecurityTrustUrl(`${environment.protocol}://${environment.host}:${environment.port}/${path}`);

  formatPrice = (price): string =>
    price === 0 ? 'Gratis' : `€ ${price.toFixed(2)}`;

  control = (): void => {
    this.packageService.getBrokerPackages()
      .subscribe(data => {
          this.data = true;
          this.dataSource = new MatTableDataSource(data);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }, error => console.log(error)
      );
  };

  openModal = (coupon: Coupon): void => {
    this.modalCoupon = coupon;
    this.modalRef = this.modalService.show(this.template, {class: 'modal-md modal-dialog-centered'});
  };

  decline = (): void => {
    this.modalRef.hide();
  };

  getTimestamp = (validData: string): number => {
    const current = new Date(validData);
    const timestamp = current.getTime();

    return timestamp;
  };

  byPassHTML(html: string) {
    //console.log('html', html, typeof html)
    return this._sanitizer.bypassSecurityTrustHtml(html)
  }

  dataExists = () => this.dataSource && this.dataSource.data && this.dataSource.data.length > 0;
}
