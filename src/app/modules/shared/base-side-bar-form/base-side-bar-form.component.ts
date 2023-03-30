import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { createMask } from '@ngneat/input-mask';
import { BehaviorSubject } from 'rxjs';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { FormSubject, SideBarFormService } from 'src/app/services/side-bar-form.service';
import { BlankComboBoxValue, FlatDesignNavigatableForm, TileCssClass, TileCssColClass } from 'src/assets/model/navigation/Nav';
import { Constants } from 'src/assets/util/Constants';
import { OfferNavKeySettings, Actions, KeyBindings, DefaultKeySettings } from 'src/assets/util/KeyBindings';

/**
 * Alaposztály oldalmenüs formokhoz
 */
@Component({
  selector: 'app-base-side-bar-form',
  templateUrl: './base-side-bar-form.component.html',
  styleUrls: ['./base-side-bar-form.component.scss']
})
export class BaseSideBarFormComponent {
  currentForm?: FlatDesignNavigatableForm;
  readonlyMode: boolean = false;

  public onFormUpdate: BehaviorSubject<FormGroup | undefined> = new BehaviorSubject < FormGroup | undefined >(undefined);

  /**
   * Egyedi azonosító, kapcsolódó modellt jelöli, pl. "Product"
   */
  tag: string = 'BaseClass';

  blankOptionText: string = BlankComboBoxValue;

  numberInputMask = createMask({
    alias: 'numeric',
    groupSeparator: ' ',
    digits: 2,
    digitsOptional: false,
    prefix: '',
    placeholder: '0',
  });

  numberInputMaskInteger = createMask({
    alias: 'numeric',
    groupSeparator: ' ',
    digits: 0,
    digitsOptional: true,
    prefix: '',
    placeholder: '0',
  });

  TileCssClass = TileCssClass;
  TileCssColClass = TileCssColClass;

  get isReadonly() {
    return this.kbS.currentKeyboardMode !== KeyboardModes.EDIT || this.readonlyMode;
  }

  public readonly KeySetting: Constants.KeySettingsDct = DefaultKeySettings;

  constructor(protected kbS: KeyboardNavigationService, protected cdref: ChangeDetectorRef) {}

  @HostListener('document:keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      default: { }
    }
  }

  @HostListener('window:keydown', ['$event']) onFunctionKeyDown(event: KeyboardEvent) {
    if (event.shiftKey && event.key == 'Enter') {
      this.kbS.BalanceCheckboxAfterShiftEnter((event.target as any).id);
      this.currentForm?.HandleFormShiftEnter(event)
    }
    else if ((event.shiftKey && event.key == 'Tab') || event.key == 'Tab') {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      return;
    }
    switch (event.key) {
      case this.KeySetting[Actions.Create].KeyCode:
      case this.KeySetting[Actions.Reset].KeyCode:
      case this.KeySetting[Actions.Save].KeyCode:
      case this.KeySetting[Actions.Delete].KeyCode:
      case this.KeySetting[Actions.Lock].KeyCode:
      case this.KeySetting[Actions.ToggleForm].KeyCode:
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        this.currentForm?.HandleFunctionKey(event);
        break;
    }
  }

  protected SetNewForm(form?: FormSubject): void {
    console.log("Form: ", form);

    if ((!!form && form[0] !== this.tag) || !!!form || form[1] === undefined) {
      return;
    }

    this.readonlyMode = form[1].readonly ?? false;

    if (form[1].form === undefined) {
      return;
    }

    this.onFormUpdate.next(form[1].form.form);

    this.currentForm = form[1].form;
    console.log("[SetNewForm] ", this.currentForm); // TODO: only for debug

    this.cdref.detectChanges();

    this.SetupForms();

    this.cdref.detectChanges();
  }

  protected SetupForms(): void {}
}
