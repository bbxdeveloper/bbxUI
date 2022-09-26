import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy } from '@angular/core';
import { NbDialogRef, NbToastrService } from '@nebular/theme';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { BaseNavigatableComponentComponent } from '../../shared/base-navigatable-component/base-navigatable-component.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AttachDirection, NavigatableForm, TileCssClass } from 'src/assets/model/navigation/Nav';
import { IInlineManager } from 'src/assets/model/IInlineManager';
import { EmailAddress, SendEmailRequest } from '../models/Email';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { Constants } from 'src/assets/util/Constants';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';

@Component({
  selector: 'app-send-email-dialog',
  templateUrl: './send-email-dialog.component.html',
  styleUrls: ['./send-email-dialog.component.scss']
})
export class SendEmailDialogComponent extends BaseNavigatableComponentComponent implements AfterViewInit, OnDestroy {
  title: string = "Bejelentkezés";
  closedManually = false;
  
  @Input() subject?: string;
  @Input() message?: string;
  @Input() OfferID?: number;
  @Input() DefaultFrom?: string;
  @Input() UserName?: string;

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
    private simpleToastrService: NbToastrService,
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
    this.Matrix = [["email-button-send", "email-button-cancel"]];

    const dForm = new FormGroup({
      from: new FormControl('', [Validators.email]),
      to: new FormControl('', [Validators.required]),
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
    if (!!this.subject) {
      this.dataForm.form.controls['subject'].setValue(this.subject);
    }
    if (!!this.message) {
      this.dataForm.form.controls['body'].setValue(this.message);
    }
    if (!!this.DefaultFrom) {
      this.dataForm.form.controls['from'].setValue(this.DefaultFrom);
    }
  }

  ngOnDestroy(): void {
    if (!this.closedManually) {
      this.kbS.RemoveWidgetNavigatable();
    }
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);
  }

  close(answer: boolean) {
    if (answer && this.dataForm.form.valid) {
      this.closedManually = true;
      this.kbS.RemoveWidgetNavigatable();

      this.dialogRef.close({
        from: {
          name: this.UserName,
          email: this.dataForm.GetValue('from')
        } as EmailAddress,
        to: {
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
}