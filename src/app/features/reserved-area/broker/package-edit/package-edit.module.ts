import {NgModule} from '@angular/core';
import {PackageEditComponent} from './package-edit.component';
import {SharedModule} from '../../../../shared/shared.module';
import {BreadcrumbActions} from '../../../../core/breadcrumb/breadcrumb.actions';
import {FileUploadModule} from 'ng2-file-upload';
import {StoreService} from '../../../../shared/_services/store.service';
import {CommonModule} from '@angular/common';
import {FlatpickrModule} from 'angularx-flatpickr';
import {Ng2FlatpickrModule} from 'ng2-flatpickr';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgSelectModule} from '@ng-select/ng-select';

@NgModule({
  declarations: [
    PackageEditComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    FileUploadModule,
    ReactiveFormsModule,
    Ng2FlatpickrModule,
    NgSelectModule,
    FormsModule,
    FlatpickrModule.forRoot(),
  ],
  exports: [
    PackageEditComponent
  ],
  providers: [
    BreadcrumbActions,
    StoreService
  ],

})
export class FeatureReservedAreaPackageEditModule {
}