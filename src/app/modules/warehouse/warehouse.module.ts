import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WareHouseManagerComponent } from './ware-house-manager/ware-house-manager.component';
import { WareHouseSideBarFormComponent } from './ware-house-side-bar-form/ware-house-side-bar-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { NbLayoutModule, NbCardModule, NbButtonModule, NbTreeGridModule, NbTabsetModule, NbButtonGroupModule, NbProgressBarModule, NbSpinnerModule, NbDatepickerModule, NbFormFieldModule, NbInputModule, NbContextMenuModule, NbActionsModule, NbPopoverModule, NbMenuModule, NbTagModule, NbCheckboxModule, NbTooltipModule } from '@nebular/theme';
import { AngularSplitModule } from 'angular-split';
import { NgxMaskModule } from 'ngx-mask';
import { SharedModule } from '../shared/shared.module';
import { InbetweenWarehouseComponent } from './inbetween-warehouse/inbetween-warehouse.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { WarehouseDocumentManagerComponent } from './warehouse-document/warehouse-document-manager/warehouse-document-manager.component';
import { WarehouseDocumentSideBarFormComponent } from './warehouse-document/warehouse-document-side-bar-form/warehouse-document-side-bar-form.component';
import { WarehouseDocumentFilterFormComponent } from './warehouse-document/warehouse-document-filter-form/warehouse-document-filter-form.component';
import { InputMaskModule } from '@ngneat/input-mask';



@NgModule({
  declarations: [
    WareHouseManagerComponent,
    WareHouseSideBarFormComponent,
    InbetweenWarehouseComponent,
    WarehouseDocumentManagerComponent,
    WarehouseDocumentSideBarFormComponent,
    WarehouseDocumentFilterFormComponent
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
    AngularSplitModule,
    SharedModule,
    AngularEditorModule,
    InputMaskModule,
  ],
  exports: [
    WareHouseManagerComponent,
    WarehouseDocumentManagerComponent,
  ]
})
export class WarehouseModule { }
