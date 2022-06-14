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
  @Input() printButton: boolean = false;

  @Input() newButtonKey: KeyBindings = KeyBindings.crudNew;
  @Input() editButtonKey: KeyBindings = KeyBindings.crudEdit;
  @Input() saveButtonKey: KeyBindings = KeyBindings.crudSave;
  @Input() resetButtonKey: KeyBindings = KeyBindings.crudReset;
  @Input() deleteButtonKey: KeyBindings = KeyBindings.crudDelete;
  @Input() printButtonKey: KeyBindings = KeyBindings.crudPrint;

  @Input() newButtonDisabled: boolean = false;
  @Input() editButtonDisabled: boolean = false;
  @Input() saveButtonDisabled: boolean = false;
  @Input() resetButtonDisabled: boolean = false;
  @Input() deleteButtonDisabled: boolean = false;
  @Input() printButtonDisabled: boolean = false;

  // @Input() newButtonClickHandler?: (param: any) => void;
  // @Input() editButtonClickHandler?: (param: any) => void;
  // @Input() saveButtonClickHandler?: (param: any) => void;
  // @Input() resetButtonClickHandler?: (param: any) => void;
  // @Input() deleteButtonClickHandler?: (param: any) => void;
  // @Input() printButtonClickHandler?: (param: any) => void;

  // get NewButtonClickHandler(): (param: any) => void {
  //   return !!this.newButtonClickHandler ? this.newButtonClickHandler : this.currentForm!.HandleFunctionKey;
  // }
  // get EditButtonClickHandler(): (param: any) => void {
  //   return !!this.editButtonClickHandler ? this.editButtonClickHandler : this.currentForm!.HandleFunctionKey;
  // }
  // get SaveButtonClickHandler(): (param: any) => void {
  //   return !!this.saveButtonClickHandler ? this.saveButtonClickHandler : this.currentForm!.HandleFunctionKey;
  // }
  // get ResetButtonClickHandler(): (param: any) => void {
  //   return !!this.resetButtonClickHandler ? this.resetButtonClickHandler : this.currentForm!.HandleFunctionKey;
  // }
  // get DeleteButtonClickHandler(): (param: any) => void {
  //   return !!this.deleteButtonClickHandler ? this.deleteButtonClickHandler : this.currentForm!.HandleFunctionKey;
  // }
  // get PrintButtonClickHandler(): (param: any) => void {
  //   return !!this.printButtonClickHandler ? this.printButtonClickHandler : this.currentForm!.HandleFunctionKey;
  // }

  @Input() wrapperClass: string = 'bbx-fd-sidebar-functions-center';

  public get keyBindings(): typeof KeyBindings {
    return KeyBindings;
  }

  constructor() { }

  ngOnInit(): void {
  }

}
