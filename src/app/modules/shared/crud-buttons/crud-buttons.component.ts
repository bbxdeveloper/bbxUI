import { Component, Input, OnInit } from '@angular/core';
import { LoggerService } from 'src/app/services/logger.service';
import { IFunctionHandler } from 'src/assets/model/navigation/IFunctionHandler';
import { Constants } from 'src/assets/util/Constants';
import { Actions, DefaultKeySettings, KeyBindings } from 'src/assets/util/KeyBindings';

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
  @Input() emailButton: boolean = false;
  @Input() csvButton: boolean = false;
  @Input() lockButton: boolean = false;

  @Input() KeySetting: Constants.KeySettingsDct = DefaultKeySettings;

  get newButtonKey(): KeyBindings { return this.KeySetting[Actions.Create].KeyCode }
  get editButtonKey(): KeyBindings { return this.KeySetting[Actions.Edit].KeyCode }
  get saveButtonKey(): KeyBindings { return this.KeySetting[Actions.Save].KeyCode }
  get resetButtonKey(): KeyBindings { return this.KeySetting[Actions.Reset].KeyCode }
  get deleteButtonKey(): KeyBindings { return this.KeySetting[Actions.Delete].KeyCode }
  get printButtonKey(): KeyBindings { return this.KeySetting[Actions.Print].KeyCode }
  get emailButtonKey(): KeyBindings { return this.KeySetting[Actions.Email].KeyCode }
  get csvButtonKey(): KeyBindings { return this.KeySetting[Actions.CSV].KeyCode }
  get lockButtonKey(): KeyBindings { return this.KeySetting[Actions.Lock].KeyCode }

  @Input() newButtonDisabled: boolean = false;
  @Input() editButtonDisabled: boolean = false;
  @Input() saveButtonDisabled: boolean = false;
  @Input() resetButtonDisabled: boolean = false;
  @Input() deleteButtonDisabled: boolean = false;
  @Input() printButtonDisabled: boolean = false;
  @Input() emailButtonDisabled: boolean = false;
  @Input() csvButtonDisabled: boolean = false;
  @Input() lockButtonDisabled: boolean = false;

  @Input() wrapperClass: string = 'bbx-fd-sidebar-functions-center';

  public get keyBindings(): typeof KeyBindings {
    return KeyBindings;
  }

  constructor(private readonly loggserService: LoggerService) { }

  ngOnInit(): void {
    this.loggserService.info('KeySetting: ' + JSON.stringify(this.KeySetting))
  }

}
