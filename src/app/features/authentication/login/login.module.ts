import {NgModule} from '@angular/core';
import {FeatureAuthenticationLoginFormComponent} from './login-form/login-form.component';
import {FeatureAuthenticationLoginComponent} from './login.component';
import {UserService} from '../../../shared/_services/user.service';
import {AuthenticationService} from '../authentication.service';
import {SharedModule} from '../../../shared/shared.module';
import {RouterModule} from '@angular/router';
import {LoginActions} from './login.actions';

@NgModule({
  declarations: [
    FeatureAuthenticationLoginFormComponent,
    FeatureAuthenticationLoginComponent
  ],
  imports: [
    SharedModule,
    RouterModule,
  ],
  exports: [
    FeatureAuthenticationLoginFormComponent,
    FeatureAuthenticationLoginComponent
  ],
  providers: [
    UserService,
    AuthenticationService,
    LoginActions
  ]
})
export class LoginModule {}
