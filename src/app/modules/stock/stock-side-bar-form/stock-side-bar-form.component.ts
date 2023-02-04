import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { FormSubject, SideBarFormService } from 'src/app/services/side-bar-form.service';
import { Constants } from 'src/assets/util/Constants';
import { KeyBindings } from 'src/assets/util/KeyBindings';
import { BaseSideBarFormComponent } from '../../shared/base-side-bar-form/base-side-bar-form.component';
import { Location } from '../../location/models/Location';
import { LocationService } from '../../location/services/location.service';

@Component({
  selector: 'app-stock-side-bar-form',
  templateUrl: './stock-side-bar-form.component.html',
  styleUrls: ['./stock-side-bar-form.component.scss']
})
export class StockSideBarFormComponent extends BaseSideBarFormComponent implements OnInit, AfterViewInit {
  public get keyBindings(): typeof KeyBindings {
    return KeyBindings;
  }

  customPatterns = Constants.ProductCodePatterns;

  // Location
  _locations: Location[] = [];
  locations: string[] = [];
  locationsComboData$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  constructor(private sbf: SideBarFormService, kbS: KeyboardNavigationService,
    private locationService: LocationService,
    private cdref: ChangeDetectorRef) {
    super(kbS);
    this.refreshComboboxData();
  }

  moveCursor(codeInput: any): void {
    setTimeout(function () {
      codeInput.setSelectionRange(0, 0);
    }, 100);
  }

  ngOnInit(): void {
    this.sbf.forms.subscribe({ next: f => this.SetNewForm(f) });
  }
  ngAfterViewInit(): void {
    this.currentForm?.AfterViewInitSetup();
  }

  private refreshComboboxData(): void {
    // ProductGroups
    this.locationService.GetAll({ PageSize: '99999' }).subscribe({
      next: data => {
        console.log("Locations: ", data);
        this._locations = data?.data ?? [];
        this.locations = this._locations.map(x => x.locationDescription) ?? [];
        this.locationsComboData$.next(this.locations);
      }
    });
  }

  SetCursorPose(event: any): void {
    setTimeout(() => {
      console.log("SetCursorPose: ", event.target.value);
      event.target.setSelectionRange(0, 0);
    }, 50);
  }

  private SetNewForm(form?: FormSubject): void {
    if ((!!form && form[0] !== 'Stock') || !!!form || form[1] === undefined) {
      return;
    }

    this.readonlyMode = form[1].readonly ?? false;

    if (form[1].form === undefined) {
      return;
    }

    this.currentForm = form[1].form;
    console.log("[SetNewForm] ", this.currentForm);

    this.cdref.detectChanges();
  }
}