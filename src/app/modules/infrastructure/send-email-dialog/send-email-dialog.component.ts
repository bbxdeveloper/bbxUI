import { AfterViewInit, ChangeDetectorRef, Component, HostListener, Input, OnDestroy } from '@angular/core';
import { NbDialogRef, NbDialogService, NbToastrService } from '@nebular/theme';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { BaseNavigatableComponentComponent } from '../../shared/base-navigatable-component/base-navigatable-component.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AttachDirection, NavigatableForm, TileCssClass } from 'src/assets/model/navigation/Nav';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { EmailAddress, SendEmailRequest } from '../models/Email';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { Constants } from 'src/assets/util/Constants';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { OneTextInputDialogComponent } from '../../shared/one-text-input-dialog/one-text-input-dialog.component';
import { OfferPrintParams } from '../../offer/offer-nav/offer-nav.component';
import { OfferService } from '../../offer/services/offer.service';
import { StatusService } from 'src/app/services/status.service';
import { lastValueFrom } from 'rxjs';
import { Offer } from '../../offer/models/Offer';
import { UtilityService } from 'src/app/services/utility.service';
import { KeyBindings } from 'src/assets/util/KeyBindings';

@Component({
  selector: 'app-send-email-dialog',
  templateUrl: './send-email-dialog.component.html',
  styleUrls: ['./send-email-dialog.component.scss']
})
export class SendEmailDialogComponent extends BaseNavigatableComponentComponent implements AfterViewInit, OnDestroy {
  @Input() title: string = "Ajánlat küldése email-ben";
  closedManually = false;
  
  @Input() subject?: string;
  @Input() message?: string;
  @Input() OfferID?: number;
  @Input() DefaultFrom?: string;
  @Input() DefaultFromName?: string;
  @Input() DefaultTo?: string;
  @Input() DefaultToName?: string;
  @Input() PrintParams?: OfferPrintParams;

  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: 'auto',
    minHeight: '0',
    maxHeight: 'auto',
    width: 'auto',
    minWidth: '0',
    translate: 'yes',
    enableToolbar: true,
    showToolbar: true,
    placeholder: 'Enter text here...',
    defaultParagraphSeparator: '',
    defaultFontName: '',
    defaultFontSize: '',
    fonts: [
      { class: 'arial', name: 'Arial' },
      { class: 'times-new-roman', name: 'Times New Roman' },
      { class: 'calibri', name: 'Calibri' },
      { class: 'comic-sans-ms', name: 'Comic Sans MS' }
    ],
    customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText'
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ],
    uploadUrl: 'v1/image',
    uploadWithCredentials: false,
    sanitize: true,
    toolbarPosition: 'top',
    toolbarHiddenButtons: [
      ['bold', 'italic'],
      ['fontSize']
    ]
  };

  dataForm!: NavigatableForm;

  TileCssClass = TileCssClass;

  get isEditModeOff() {
    return this.kbS.currentKeyboardMode !== KeyboardModes.EDIT;
  }

  constructor(
    private cdrf: ChangeDetectorRef,
    protected dialogRef: NbDialogRef<SendEmailDialogComponent>,
    private kbS: KeyboardNavigationService,
    private bbxToastrService: BbxToastrService,
    private dialogService: NbDialogService,
    private simpleToastrService: NbToastrService,
    private offerService: OfferService,
    private sts: StatusService,
    private utS: UtilityService
  ) {
    super();
    this.Setup();
  }

  MoveToSaveButtons(event: any): void {
    if (this.isEditModeOff) {
      this.dataForm!.HandleFormEnter(event);
    } else {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      this.kbS.Jump(AttachDirection.DOWN, false);
      this.kbS.setEditMode(KeyboardModes.NAVIGATION);
    }
  }

  private Setup(): void {
    this.IsDialog = true;
    this.Matrix = [["email-button-send", "emaik-button-print-preview", "email-button-cancel"]];

    const dForm = new FormGroup({
      from: new FormControl('', [Validators.email]),
      fromName: new FormControl('', []),
      to: new FormControl('', [Validators.required]),
      toName: new FormControl('', []),
      subject: new FormControl('', [Validators.required]),
      body: new FormControl('', []),
    });

    this.dataForm = new NavigatableForm(
      dForm, this.kbS, this.cdrf, [], 'dataForm', AttachDirection.UP, {} as IInlineManager
    );

    // We can move onto the confirmation buttons from the form.
    this.dataForm.OuterJump = true;
    // And back to the form.
    this.OuterJump = true;
  }

  ngAfterViewInit(): void {
    this.kbS.SetWidgetNavigatable(this);
    this.dataForm.GenerateAndSetNavMatrices(true);
    this.kbS.SelectFirstTile();
    this.kbS.setEditMode(KeyboardModes.EDIT);
    if (!!this.subject && !!(this.subject.trim())) {
      this.dataForm.form.controls['subject'].setValue(this.subject);
    }
    if (!!this.message && !!(this.message.trim())) {
      this.dataForm.form.controls['body'].setValue(this.message);
    }
    if (!!this.DefaultFrom && !!(this.DefaultFrom.trim())) {
      this.dataForm.form.controls['from'].setValue(this.DefaultFrom);
    }
    if (!!this.DefaultTo && !!(this.DefaultTo.trim())) {
      this.dataForm.form.controls['to'].setValue(this.DefaultTo);
    }
    if (!!this.DefaultFromName && !!(this.DefaultFromName.trim())) {
      this.dataForm.form.controls['fromName'].setValue(this.DefaultFromName);
    }
    if (!!this.DefaultToName && !!(this.DefaultToName.trim())) {
      this.dataForm.form.controls['toName'].setValue(this.DefaultToName);
    }
    console.log("Controls: ", this.dataForm.form.controls, this.DefaultFrom, this.DefaultFromName, this.DefaultTo, this.DefaultToName);
  }

  ngOnDestroy(): void {
    if (!this.closedManually) {
      this.kbS.RemoveWidgetNavigatable();
    }
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);
  }

  close(answer: boolean) {
    console.log("email dialog close");

    if (answer && this.dataForm.form.valid) {
      this.closedManually = true;
      this.kbS.RemoveWidgetNavigatable();

      this.dialogRef.close({
        from: {
          name: this.dataForm.GetValue('fromName'),
          email: this.dataForm.GetValue('from')
        } as EmailAddress,
        to: {
          name: this.dataForm.GetValue('toName'),
          email: this.dataForm.GetValue('to')
        } as EmailAddress,
        subject: this.dataForm.GetValue('subject'),
        body_html_text: this.dataForm.GetValue('body'),
        OfferID: this.OfferID
      } as SendEmailRequest);
    }
    if (answer && !this.dataForm.form.valid) {
      this.bbxToastrService.show(
        `Az űrlap egyes mezői érvénytelenek vagy hiányosan vannak kitöltve.`,
        Constants.TITLE_ERROR,
        Constants.TOASTR_ERROR
      );
    }
    else {
      this.closedManually = true;
      this.kbS.RemoveWidgetNavigatable();
      this.dialogRef.close(undefined);
    }
  }

  async printPreview(): Promise<void> {
    if (this.PrintParams) {
      this.kbS.setEditMode(KeyboardModes.NAVIGATION);

      let commandEndedSubscription = this.utS.CommandEnded.subscribe({
        next: cmdEnded => {
          console.log(`CommandEnded received: ${cmdEnded?.ResultCmdType}`);

          if (cmdEnded?.ResultCmdType === Constants.CommandType.PRINT_REPORT) {
            this.simpleToastrService.show(
              `Az árajánlat riport elkészítve.`,
              Constants.TITLE_INFO,
              Constants.TOASTR_SUCCESS_5_SEC
            );
            commandEndedSubscription.unsubscribe();
          }
        },
        error: cmdEnded => {
          console.log(`CommandEnded error received: ${cmdEnded?.CmdType}`);

          commandEndedSubscription.unsubscribe();
          this.bbxToastrService.show(
            `Az árajánlat riport készítése közben hiba történt.`,
            Constants.TITLE_ERROR,
            Constants.TOASTR_ERROR
          );
        }
      });

      await this.printReport(this.PrintParams!.id, 1);
    }
  }

  async printReport(id: any, copies: number): Promise<void> {
    this.sts.pushProcessStatus(Constants.PrintReportStatuses[Constants.PrintReportProcessPhases.PROC_CMD]);
    let params = {
      "section": "Szamla",
      "fileType": "pdf",
      "report_params":
      {
        "id": id,
        "copies": HelperFunctions.ToInt(copies)
      },
      "copies": 1,
      "data_operation": Constants.DataOperation.PRINT_BLOB,
      "blob_data": null,
      "ignore_electron": true
    } as Constants.Dct;
    await this.utS.execute(
      Constants.CommandType.PRINT_OFFER,
      Constants.FileExtensions.PDF,
      params,
      this.offerService.GetReport(params)
    );
  }

  private async GetOffer(id: number): Promise<Offer> {
    const offerRes = lastValueFrom(this.offerService.Get({ ID: id, FullData: true }));
    return offerRes;
  }

  @HostListener('window:keydown', ['$event']) onFunctionKeyDown(event: KeyboardEvent) {
    if (event.key == KeyBindings.exit || event.key == KeyBindings.exitIE) {
      if (this.isEditModeOff) {
        this.close(false)
      } else {
        this.kbS.setEditMode(KeyboardModes.NAVIGATION)
      }
    }
    if (event.shiftKey && event.key == 'Enter') {
      this.kbS.BalanceCheckboxAfterShiftEnter((event.target as any).id);
      this.dataForm?.HandleFormShiftEnter(event)
    }
    else if ((event.shiftKey && event.key == 'Tab') || event.key == 'Tab') {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      return;
    }
  }
}