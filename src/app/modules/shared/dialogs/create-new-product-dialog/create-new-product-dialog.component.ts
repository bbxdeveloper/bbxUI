import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NbDialogRef, NbToastrService } from '@nebular/theme';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { CommonService } from 'src/app/services/common.service';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { StatusService } from 'src/app/services/status.service';
import { FlatDesignNoTableNavigatableForm } from 'src/assets/model/navigation/FlatDesignNoTableNavigatableForm';
import { BlankComboBoxValue } from 'src/assets/model/navigation/Nav';
import { TileCssClass, TileCssColClass, AttachDirection, NavigatableType } from 'src/assets/model/navigation/Navigatable';
import { Constants } from 'src/assets/util/Constants';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { KeyBindings } from 'src/assets/util/KeyBindings';
import { Origin } from '../../../origin/models/Origin';
import { OriginService } from '../../../origin/services/origin.service';
import { ProductGroup } from '../../../product-group/models/ProductGroup';
import { ProductGroupService } from '../../../product-group/services/product-group.service';
import { CreateProductRequest } from '../../../product/models/CreateProductRequest';
import { Product } from '../../../product/models/Product';
import { OfflineUnitOfMeasures, UnitOfMeasure } from '../../../product/models/UnitOfMeasure';
import { ProductService } from '../../../product/services/product.service';
import { VatRate } from '../../../vat-rate/models/VatRate';
import { VatRateService } from '../../../vat-rate/services/vat-rate.service';
import { BaseNavigatableComponentComponent } from '../../base-navigatable-component/base-navigatable-component.component';
import { NgNeatInputMasks } from 'src/assets/model/NgNeatInputMasks';
import { fixCursorPosition } from 'src/assets/util/input/fixCursorPosition';


@Component({
  selector: 'app-create-new-product-dialog',
  templateUrl: './create-new-product-dialog.component.html',
  styleUrls: ['./create-new-product-dialog.component.scss']
})
export class CreateNewProductDialogComponent extends BaseNavigatableComponentComponent implements OnDestroy, AfterViewInit {
  public get keyBindings(): typeof KeyBindings {
    return KeyBindings;
  }

  override NavigatableType = NavigatableType.dialog

  customPatterns: any = {
    A: { pattern: new RegExp('[a-zA-Z0-9áéiíoóöőuúüűÁÉIÍOÓÖŐUÚÜŰä]') },
    C: { pattern: new RegExp('[a-zA-Z0-9áéiíoóöőuúüűÁÉIÍOÓÖŐUÚÜŰä]') }
  };

  numberInputMask = NgNeatInputMasks.numberInputMask
  numberInputMaskInteger = NgNeatInputMasks.numberInputMaskInteger

  fixCursorPosition = fixCursorPosition

  blankOptionText: string = BlankComboBoxValue;
  TileCssClass = TileCssClass;
  TileCssColClass = TileCssColClass;

  get isEditModeOff() {
    return !this.kbS.isEditModeActivated;
  }

  closedManually: boolean = false;
  isLoading: boolean = true;

  _form?: FlatDesignNoTableNavigatableForm;
  productForm: FormGroup;
  sumFormId: string = "CreateNewProductDialogComponentForm";

  // ProductGroup
  _productGroups: ProductGroup[] = [];
  productGroups: string[] = [];
  productGroupComboData$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  // UnitOfMeasure
  _uom: UnitOfMeasure[] = [];
  uom: string[] = [];
  uomComboData$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  // Origin
  _origins: Origin[] = [];
  origins: string[] = [];
  originsComboData$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  // Origin
  _vatRates: VatRate[] = [];
  vatRates: string[] = [];
  vatRateComboData$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  constructor(
    private bbxsb: BbxSidebarService,
    private pService: ProductService,
    private cdref: ChangeDetectorRef,
    protected dialogRef: NbDialogRef<CreateNewProductDialogComponent>,
    private kbS: KeyboardNavigationService,
    private fs: FooterService,
    private sts: StatusService,
    private cs: CommonService,
    private bbxToastrService: BbxToastrService,
    private simpleToastrService: NbToastrService,
    private productGroupApi: ProductGroupService, private productApi: ProductService, private originApi: OriginService,
    private vatApi: VatRateService
  ) {
    super();

    this.Setup();

    this.productForm = new FormGroup({
      productCode: new FormControl(undefined, [Validators.required]),
      description: new FormControl(undefined, [Validators.required]),
      productGroup: new FormControl(undefined, []),
      origin: new FormControl(undefined, []),
      unitOfMeasure: new FormControl(undefined, [Validators.required]),
      unitPrice1: new FormControl(0, []),
      unitPrice2: new FormControl(0, []),
      latestSupplyPrice: new FormControl(0, []),
      isStock: new FormControl(true, []),
      minStock: new FormControl(0, []),
      ordUnit: new FormControl(0, []),
      productFee: new FormControl(0, []),
      active: new FormControl(true, []),
      vtsz: new FormControl(undefined, [Validators.required]),
      ean: new FormControl(undefined, []),
      vatRateCode: new FormControl(undefined, [Validators.required]),
      noDiscount: new FormControl(false, []),
      unitWeight: new FormControl(undefined, [])
    });

    this.refreshComboboxData();
  }

  private Setup(): void {
    this.IsDialog = true;
    this.Matrix = [["confirm-dialog-button-yes", "confirm-dialog-button-no"]];
  }

  ngOnDestroy(): void {
    if (!this.closedManually) {
      this.kbS.RemoveWidgetNavigatable();
    }
  }

  ngAfterViewInit(): void {
    this.kbS.SetWidgetNavigatable(this);
    this.SetNewForm(this.productForm);

    // We can move onto the confirmation buttons from the form.
    this._form!.OuterJump = true;
    // And back to the form.
    this.OuterJump = true;

    this._form?.AfterViewInitSetup();

    this.kbS.SelectFirstTile();
    this.kbS.Jump(AttachDirection.UP, true);
  }

  private SetNewForm(form?: FormGroup): void {
    this._form = new FlatDesignNoTableNavigatableForm(
      this.productForm,
      this.kbS,
      this.cdref,
      [],
      this.sumFormId,
      AttachDirection.UP,
      [],
      this.bbxsb,
      this.fs
    );
    this._form.IsFootersEnabled = false;

    console.log("[SetNewForm] ", this._form); // TODO: only for debug

    this.setupFormEventHandlers()

    this.cdref.detectChanges();
  }

  private setupFormEventHandlers(): void {
    this._form?.form.controls['productCode'].valueChanges.subscribe({
      next: this.onProductCodeValueChanges()
    })
  }

  private onProductCodeValueChanges() {
    let previousValue = ''

    return (newValue: string) => {
      if (HelperFunctions.isEmptyOrSpaces(newValue)) {
        return
      }

      const delta = newValue.length - previousValue.length
      if ((delta === 2 || delta === 3) && newValue.endsWith('-')) {
        this._form?.form.controls['productCode'].setValue(newValue.slice(0, -1))

        return
      }

      let currentProductGroup = this._form?.form.controls['productGroup'].value;
      if (!!newValue && newValue.length >= 3 &&
        (currentProductGroup === undefined || currentProductGroup === null || currentProductGroup.length === 0)) {

        let defaultProductGroup = this._productGroups
          .find(x => x.productGroupCode === newValue.substring(0, 3))?.productGroupDescription ?? BlankComboBoxValue;

        if (defaultProductGroup.length > 0) {
          this._form?.form.controls['productGroup'].setValue(defaultProductGroup);
        }
      }

      previousValue = newValue
    }
  }

  close(answer: any) {
    this.closedManually = true;
    this.kbS.RemoveWidgetNavigatable();
    this.dialogRef.close(answer);
  }

  MoveToSaveButtons(event: any): void {
    if (this.isEditModeOff) {
      this._form!.HandleFormEnter(event);
    } else {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      this.kbS.Jump(AttachDirection.DOWN, false);
      this.kbS.setEditMode(KeyboardModes.NAVIGATION);
    }
  }

  private ToCreateRequest(p: Product): CreateProductRequest {
    let originCode = HelperFunctions.ConvertChosenOriginToCode(p.origin, this._origins, '');
    let productGroupCode = HelperFunctions.ConvertChosenProductGroupToCode(p.productGroup, this._productGroups, '');
    let vatRatecode = HelperFunctions.ConvertChosenVatRateToCode(p.vatRateCode, this._vatRates, '');

    let smallestUomValue = this._uom.length > 0 ? this._uom[0].value : 'PIECE';
    let unitOfMeasureValue = HelperFunctions.ConvertChosenUOMToCode(p.unitOfMeasure, this._uom, smallestUomValue);

    const res = {
      ean: p.ean as string,
      vtsz: p.vtsz,
      active: p.active,
      description: p.description,
      isStock: p.isStock,
      minStock: HelperFunctions.ToInt(p.minStock),
      latestSupplyPrice: HelperFunctions.ToInt(p.latestSupplyPrice),
      ordUnit: HelperFunctions.ToInt(p.ordUnit),
      originCode: originCode,
      productGroupCode: productGroupCode,
      unitPrice1: HelperFunctions.ToInt(p.unitPrice1),
      unitPrice2: HelperFunctions.ToInt(p.unitPrice2),
      unitOfMeasure: unitOfMeasureValue,
      productFee: HelperFunctions.ToInt(p.productFee),
      productCode: p.productCode,
      vatRateCode: vatRatecode,
      noDiscount: p.noDiscount,
      unitWeight: p.unitWeight !== undefined ? HelperFunctions.ToFloat(p.unitWeight) : undefined
    } as CreateProductRequest;
    return res;
  }

  Save(): void {
    if (!this.productForm || this.productForm.invalid) {
      this.bbxToastrService.showError(Constants.MSG_ERROR_INVALID_FORM)

      return
    }

    const createRequest = this.ToCreateRequest(this._form!.FillObjectWithForm() as Product);

    this.isLoading = true;
    this.sts.pushProcessStatus(Constants.CRUDSavingStatuses[Constants.CRUDSavingPhases.SAVING]);
    this.pService.Create(createRequest).subscribe({
      next: async d => {
        if (d.succeeded && !!d.data) {
          this.isLoading = false;
          this.sts.pushProcessStatus(Constants.BlankProcessStatus);

          setTimeout(() => {
            this.simpleToastrService.show(
              Constants.MSG_SAVE_SUCCESFUL,
              Constants.TITLE_INFO,
              Constants.TOASTR_SUCCESS_5_SEC
            );
          }, 200);

          let product;
          await lastValueFrom(this.productApi.Get({ ID: d.data.id }))
            .then(res => {
              product = res;
            })
            .catch(err => {
              this.cs.HandleError(err);
            })
            .finally(() => {})

          this.close(product);
        } else {
          console.log(d.errors!, d.errors!.join('\n'), d.errors!.join(', '));
          this.bbxToastrService.show(
            d.errors!.join('\n'),
            Constants.TITLE_ERROR,
            Constants.TOASTR_ERROR
          );
          this.isLoading = false;
          this.sts.pushProcessStatus(Constants.BlankProcessStatus);
        }
      },
      error: err => {
        this.cs.HandleError(err);
        this.isLoading = false;
        this.sts.pushProcessStatus(Constants.BlankProcessStatus);
      }
    });
  }

  private refreshComboboxData(): void {
    let request = { PageSize: '1000' };

    // ProductGroups
    this.productGroupApi.GetAll(request).subscribe({
      next: data => {
        console.log("ProductGroups: ", data);
        this._productGroups = data?.data ?? [];
        this.productGroups = this._productGroups.map(x => x.productGroupDescription) ?? [];
        this.productGroupComboData$.next(this.productGroups);
      }
    });

    // UnitOfMeasure
    this.productApi.GetAllUnitOfMeasures().subscribe({
      next: data => {
        console.log("UnitOfMeasures: ", data);
        this._uom = data ?? [];
        this.uom = data?.map(x => x.text) ?? [];
        this.uomComboData$.next(this.uom);
        
        if (this.uom.length > 0 && HelperFunctions.isEmptyOrSpaces(this.productForm.controls['unitOfMeasure'].value)) {
          this.productForm.controls['unitOfMeasure'].setValue(
            this._uom.find(x => x.value === OfflineUnitOfMeasures.PIECE.value)?.text
          )
        }
      }
    });

    // Origin
    this.originApi.GetAll(request).subscribe({
      next: data => {
        console.log("Origins: ", data);
        this._origins = data?.data ?? [];
        this.origins = data?.data?.map(x => x.originDescription) ?? [];
        this.originsComboData$.next(this.origins);
      }
    });

    // VatRate
    this.vatApi.GetAll(request).subscribe({
      next: data => {
        console.log("Vats: ", data);
        this._vatRates = data?.data ?? [];
        this.vatRates = data?.data?.map(x => x.vatRateDescription) ?? [];
        this.vatRateComboData$.next(this.vatRates);

        this.productForm.controls['vatRateCode'].setValue(data?.data?.find(x => x.vatRateCode === '27%')?.vatRateDescription ?? '')
      }
    });
  }

  moveCursor(codeInput: any): void {
    setTimeout(function () {
      codeInput.setSelectionRange(0, 0);
    }, 100);
  }

  @HostListener('window:keydown', ['$event']) onFunctionKeyDown(event: KeyboardEvent) {
    if (event.key == KeyBindings.exit || event.key == KeyBindings.exitIE) {
      if (this.isEditModeOff) {
        this.close(undefined)
      } else {
        this.kbS.setEditMode(KeyboardModes.NAVIGATION)
      }
    }
    if (event.shiftKey && event.key == 'Enter') {
      this.kbS.BalanceCheckboxAfterShiftEnter((event.target as any).id);
      this._form?.HandleFormShiftEnter(event)
    }
    else if ((event.shiftKey && event.key == 'Tab') || event.key == 'Tab') {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      return;
    }
  }
}
