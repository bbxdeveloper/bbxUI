import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginDialogComponent } from './login-dialog/login-dialog.component';

import { NbLayoutModule, NbButtonModule, NbCardModule, NbTreeGridModule, NbTabsetModule, NbButtonGroupModule, NbProgressBarModule, NbSpinnerModule, NbDatepickerModule, NbFormFieldModule, NbInputModule, NbActionsModule, NbCheckboxModule, NbContextMenuModule, NbMenuModule, NbPopoverModule, NbTagModule, NbTooltipModule } from '@nebular/theme';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { SharedModule } from '../shared/shared.module';
import { UserManagerComponent } from './user-manager/user-manager.component';
import { UserSideBarFormComponent } from './user-side-bar-form/user-side-bar-form.component';
import { NbEvaIconsModule } from '@nebular/eva-icons';

@NgModule({
  declarations: [
    LoginDialogComponent,
    UserManagerComponent,
    UserSideBarFormComponent
  ],
  imports: [
    CommonModule,
    NbLayoutModule,
    NbCardModule,
    NbButtonModule,
    FormsModule,
    ReactiveFormsModule,
    NbTreeGridModule,
    NbTabsetModule,
    NbButtonGroupModule,
    NbProgressBarModule,
    NbSpinnerModule,
    NbDatepickerModule,
    NbFormFieldModule,
    NbInputModule,
    NgxMaskModule.forChild(),
    NbContextMenuModule,
    NbActionsModule,
    NbEvaIconsModule,
    NbPopoverModule,
    NbMenuModule,
    NbTagModule,
    NbCheckboxModule,
    NbTooltipModule,
    SharedModule,
  ],
  exports: [
    LoginDialogComponent,
    UserManagerComponent
  ],
  providers: [
    LoginDialogComponent
  ]
})
export class AuthModule { }
