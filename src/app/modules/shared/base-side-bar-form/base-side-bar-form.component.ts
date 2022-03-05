import { Component, HostListener, OnInit } from '@angular/core';
import { FlatDesignNavigatableForm } from 'src/assets/model/navigation/Nav';
import { CrudManagerKeySettings, Actions, KeyBindings } from 'src/assets/util/KeyBindings';

@Component({
  selector: 'app-base-side-bar-form',
  templateUrl: './base-side-bar-form.component.html',
  styleUrls: ['./base-side-bar-form.component.scss']
})
export class BaseSideBarFormComponent {
  currentForm?: FlatDesignNavigatableForm;

  constructor() { }

  @HostListener('document:keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      default: { }
    }
  }

  @HostListener('document:keydown.tab', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();
  }

  @HostListener('window:keydown', ['$event']) onFunctionKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case CrudManagerKeySettings[Actions.CrudNew].KeyCode:
      case CrudManagerKeySettings[Actions.CrudReset].KeyCode:
      case CrudManagerKeySettings[Actions.CrudSave].KeyCode:
      case CrudManagerKeySettings[Actions.CrudDelete].KeyCode:
      case CrudManagerKeySettings[Actions.OpenForm].KeyCode:
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        this.currentForm?.HandleFunctionKey(event);
        break;
    }
  }
}
