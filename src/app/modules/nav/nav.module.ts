import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavSentDataComponent } from './nav-sent-data/nav-sent-data/nav-sent-data.component';
import { NavSentDataFilterComponent } from './nav-sent-data/nav-sent-data-filter/nav-sent-data-filter.component';
import { SharedModule } from "../shared/shared.module";
import { NbButtonModule, NbCardModule, NbFormFieldModule, NbInputModule, NbTreeGridModule } from '@nebular/theme';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularSplitModule } from 'angular-split';
import { ShowNavXResultsDialogComponent } from './nav-sent-data/show-nav-xresults-dialog/show-nav-xresults-dialog.component';
import { NavSentDataSidebarFormComponent } from './nav-sent-data/nav-sent-data-sidebar-form/nav-sent-data-sidebar-form.component';
import { NgxMaskModule } from 'ngx-mask';
import { InputMaskModule } from '@ngneat/input-mask';
import { InvoicesForNavComponent } from './invoices-for-nav/invoices-for-nav.component';

@NgModule({
    declarations: [
        NavSentDataComponent,
        NavSentDataFilterComponent,
        ShowNavXResultsDialogComponent,
        NavSentDataSidebarFormComponent,
        InvoicesForNavComponent
    ],
    exports: [
        NavSentDataFilterComponent,
        NavSentDataComponent,
    ],
    imports: [
        ReactiveFormsModule,
        NbFormFieldModule,
        NbInputModule,
        NbCardModule,
        NbButtonModule,
        NbTreeGridModule,
        CommonModule,
        SharedModule,
        AngularSplitModule,
        NgxMaskModule.forChild(),
        InputMaskModule,
    ]
})
export class NavModule { }
