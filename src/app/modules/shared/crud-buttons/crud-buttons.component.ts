import { Component, Input, OnInit } from '@angular/core';
import { IFunctionHandler } from 'src/assets/model/navigation/IFunctionHandler';
import { KeyBindings } from 'src/assets/util/KeyBindings';

@Component({
  selector: 'app-crud-buttons',
  templateUrl: './crud-buttons.component.html',
  styleUrls: ['./crud-buttons.component.scss']
})
export class CrudButtonsComponent implements OnInit {
  @Input() TileCssClass: string = '';
  @Input() currentForm?: IFunctionHandler;

  @Input() newButton: boolean = true;
  @Input() editButton: boolean = false;
  @Input() saveButton: boolean = true;
  @Input() resetButton: boolean = true;
  @Input() deleteButton: boolean = true;

  @Input() wrapperClass: string = 'bbx-fd-sidebar-functions-center';

  public get keyBindings(): typeof KeyBindings {
    return KeyBindings;
  }

  constructor() { }

  ngOnInit(): void {
  }

}
