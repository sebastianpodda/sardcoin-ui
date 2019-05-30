import {NgModule} from '@angular/core';
import {FeatureReservedAreaPackageCreateComponent} from './package-create.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {StoreService} from '../../../../shared/_services/store.service';
import {FileUploadModule} from 'ng2-file-upload';
import {FlatpickrModule} from 'angularx-flatpickr';
import {Ng2FlatpickrModule} from 'ng2-flatpickr';
import {CoreModule} from '../../../../core/core.module';
import { NgSelectModule } from '@ng-select/ng-select';
import {PackageService} from '../../../../shared/_services/package.service';



@NgModule({
  declarations: [
    FeatureReservedAreaPackageCreateComponent,
  ],
  imports: [
    CommonModule,
    CoreModule,
    FileUploadModule,
    ReactiveFormsModule,
    Ng2FlatpickrModule,
    NgSelectModule,
    FormsModule,
    FlatpickrModule.forRoot()
  ],
  exports: [
    FeatureReservedAreaPackageCreateComponent
  ],
  providers: [
    StoreService,
    PackageService
  ],
})
export class FeatureReservedAreaPackageCreateModule {}