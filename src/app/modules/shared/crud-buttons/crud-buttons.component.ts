import { Component, Input, OnInit } from '@angular/core';
import { FlatDesignNavigatableForm } from 'src/assets/model/navigation/FlatDesignNavigatableForm';
import { KeyBindings } from 'src/assets/util/KeyBindings';

@Component({
  selector: 'app-crud-buttons',
  templateUrl: './crud-buttons.component.html',
  styleUrls: ['./crud-buttons.component.scss']
})
export class CrudButtonsComponent implements OnInit {
  @Input() TileCssClass: string = '';
  @Input() currentForm?: FlatDesignNavigatableForm;

  public get keyBindings(): typeof KeyBindings {
    return KeyBindings;
  }

  constructor() { }

  ngOnInit(): void {
  }

}
