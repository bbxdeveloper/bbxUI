import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavSentDataComponent } from './nav-sent-data/nav-sent-data.component';
import { NavSentDataFilterComponent } from './nav-sent-data-filter/nav-sent-data-filter.component';
import { SharedModule } from "../shared/shared.module";
import { NbButtonModule, NbCardModule, NbFormFieldModule, NbInputModule } from '@nebular/theme';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
    declarations: [
        NavSentDataComponent,
        NavSentDataFilterComponent
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
        CommonModule,
        SharedModule
    ]
})
export class NavModule { }
