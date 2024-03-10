import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavSentDataComponent } from './nav-sent-data/nav-sent-data.component';
import { NavSentDataFilterComponent } from './nav-sent-data-filter/nav-sent-data-filter.component';
import { SharedModule } from "../shared/shared.module";
import { NbButtonModule, NbCardModule, NbFormFieldModule, NbInputModule, NbTreeGridModule } from '@nebular/theme';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularSplitModule } from 'angular-split';
import { ShowNavXResultsDialogComponent } from './show-nav-xresults-dialog/show-nav-xresults-dialog.component';

@NgModule({
    declarations: [
        NavSentDataComponent,
        NavSentDataFilterComponent,
        ShowNavXResultsDialogComponent
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
    ]
})
export class NavModule { }
