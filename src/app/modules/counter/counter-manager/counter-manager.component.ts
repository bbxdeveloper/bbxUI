import { ChangeDetectorRef, Component, HostListener, OnInit, Optional, ViewChild } from '@angular/core';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { NbDialogService, NbTable, NbToastrService, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { SideBarFormService } from 'src/app/services/side-bar-form.service';
import { IUpdateRequest } from 'src/assets/model/UpdaterInterfaces';
import { Constants } from 'src/assets/util/Constants';
import { CommonService } from 'src/app/services/common.service';
import { Counter } from '../models/Counter';
import { CounterService } from '../services/counter.service';
import { DeleteCounterRequest } from '../models/DeleteCounterRequest';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { GetCountersParamListModel } from '../models/GetCountersParamListModel';
import { AttachDirection, FlatDesignNavigatableTable, TileCssClass } from 'src/assets/model/navigation/Nav';
import { BaseManagerComponent } from '../../shared/base-manager/base-manager.component';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { UpdateCounterRequest } from '../models/UpdateCounterRequest';
import { WareHouse, WareHouseDescriptionToCode } from '../../warehouse/models/WareHouse';
import { CreateCounterRequest } from '../models/CreateCounterRequest';
import { WareHouseService } from '../../warehouse/services/ware-house.service';
import { environment } from 'src/environments/environment';
import { StatusService } from 'src/app/services/status.service';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { lastValueFrom } from 'rxjs';
import { Actions } from 'src/assets/util/KeyBindings';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { LoggerService } from 'src/app/services/logger.service';

@Component({
  selector: 'app-counter-manager',
  templateUrl: './counter-manager.component.html',
  styleUrls: ['./counter-manager.component.scss'],
})
export class CounterManagerComponent extends BaseManagerComponent<Counter> implements OnInit {
  @ViewChild('table') table?: NbTable<any>;

  override allColumns = [
    'counterCode',
    'counterDescription',
    'warehouse',
    'prefix',
    'currentNumber',
    'numbepartLength',
    'suffix',
  ];
  override colDefs: ModelFieldDescriptor[] = [
    {
      label: 'Kód',
      objectKey: 'counterCode',
      colKey: 'counterCode',
      defaultValue: '',
      type: 'string',
      fInputType: 'readonly',
      mask: '',
      colWidth: '130px',
      textAlign: 'center',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Megnevezés',
      objectKey: 'counterDescription',
      colKey: 'counterDescription',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      mask: '',
      colWidth: '50%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Raktár',
      objectKey: 'warehouse',
      colKey: 'warehouse',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      fRequired: true,
      mask: '',
      colWidth: '50%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Prefix',
      objectKey: 'prefix',
      colKey: 'prefix',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      fRequired: true,
      mask: '',
      colWidth: '130px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Számláló',
      objectKey: 'currentNumber',
      colKey: 'currentNumber',
      defaultValue: '',
      type: 'param-padded-formatted-integer',
      fInputType: 'text',
      fRequired: true,
      mask: '',
      colWidth: '100px',
      textAlign: 'right',
      navMatrixCssClass: TileCssClass,
      calc: (x: Counter) => {
        return x.numbepartLength + '.0';
      }
    },
    {
      label: 'Számláló számjegyek száma',
      objectKey: 'numbepartLength',
      colKey: 'numbepartLength',
      defaultValue: '',
      type: 'formatted-integer',
      fInputType: 'text',
      fRequired: true,
      mask: '',
      colWidth: '100px',
      textAlign: 'right',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Lezárójel',
      objectKey: 'suffix',
      colKey: 'suffix',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      fRequired: true,
      mask: '',
      colWidth: '85px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
  ];

  // CounterGroup
  wareHouses: WareHouse[] = [];

  idParam?: number;
  override get getInputParams(): GetCountersParamListModel {
    const params = { ID: this.idParam, OrderBy: "counterCode", PageNumber: this.dbDataTable.currentPage + '', PageSize: this.dbDataTable.pageSize, SearchString: this.searchString ?? '' };
    this.idParam = undefined;
    return params;
  }

  constructor(
    @Optional() dialogService: NbDialogService,
    fS: FooterService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<Counter>>,
    private seInv: CounterService,
    private cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    private bbxToastrService: BbxToastrService,
    private simpleToastrService: NbToastrService,
    sidebarService: BbxSidebarService,
    private sidebarFormService: SideBarFormService,
    private wareHouseApi: WareHouseService,
    cs: CommonService,
    sts: StatusService,
    private khs: KeyboardHelperService,
    loggerService: LoggerService
  ) {
    super(dialogService, kbS, fS, sidebarService, cs, sts, loggerService);
    this.searchInputId = 'active-prod-search';
    this.dbDataTableId = 'counter-table';
    this.dbDataTableEditId = 'user-cell-edit-input';
    this.kbS.ResetToRoot();
    this.Setup();
  }

  private ConvertCombosForPost(data: Counter): Counter {
    if (data.warehouse !== undefined && this.wareHouses.length > 0)
      data.warehouse = WareHouseDescriptionToCode(
        data.warehouse,
        this.wareHouses
      );

    return data;
  }

  private ConvertCombosForGet(data: Counter): Counter {
    if (environment.flatDesignCRUDManagerDebug) {
        console.log(`[ConvertCombosForGet] result: `, data);
    }

    return data;
  }

  private async GetWareHouses(): Promise<WareHouse[]> {
    const wHouses = await this.wareHouseApi.GetAllPromise({ PageSize: '1000' });
    if (wHouses.succeeded && !!wHouses.data) {
      this.wareHouses = wHouses.data;
      return wHouses.data;
    } else {
      this.wareHouses = [];
      this.HandleError(wHouses.errors);
    }
    return Promise.reject();
  }

  private CounterToCreateRequest(p: Counter): CreateCounterRequest {
    const res = {
      counterCode: p.counterCode,
      counterDescription: p.counterDescription,
      warehouseCode: HelperFunctions.ConvertChosenWareHouseToCode(p.warehouse, this.wareHouses, ''),
      prefix: p.prefix,
      currentNumber: HelperFunctions.ToInt(p.currentNumber),
      numbepartLength: HelperFunctions.ToInt(p.numbepartLength),
      suffix: p.suffix
    } as CreateCounterRequest;
    return res;
  }

  private CounterToUpdateRequest(p: Counter): UpdateCounterRequest {
    const res = {
      id: HelperFunctions.ToInt(p.id),
      counterCode: p.counterCode,
      counterDescription: p.counterDescription,
      warehouseCode: HelperFunctions.ConvertChosenWareHouseToCode(p.warehouse, this.wareHouses, ''),
      prefix: p.prefix,
      currentNumber: HelperFunctions.ToInt(p.currentNumber),
      numbepartLength: HelperFunctions.ToInt(p.numbepartLength),
      suffix: p.suffix
    } as UpdateCounterRequest;
    return res;
  }

  override ProcessActionNew(data?: IUpdateRequest<Counter>): void {
    console.log('ActionNew: ', data?.data);
    if (!!data && !!data.data) {

      this.GetWareHouses().then(res => {
        const createRequest = this.CounterToCreateRequest(data.data);

        console.log('ActionNew request: ', createRequest);

        this.sts.pushProcessStatus(Constants.CRUDSavingStatuses[Constants.CRUDSavingPhases.SAVING]);

        this.seInv.Create(createRequest).subscribe({
          next: async d => {
            if (d.succeeded && !!d.data) {
              this.seInv.Get({ ID: d.data.id }).subscribe({
                next: async newData => {
                  if (!!newData) {
                    this.idParam = d.data.id;
                    await this.RefreshAsync(this.getInputParams);
                    this.dbDataTable.SelectRowById(d.data.id);
                    this.sts.pushProcessStatus(Constants.BlankProcessStatus);
                    this.simpleToastrService.show(
                      Constants.MSG_SAVE_SUCCESFUL,
                      Constants.TITLE_INFO,
                      Constants.TOASTR_SUCCESS_5_SEC
                    );
                  }
                },
                error: (err) => {
                  this.HandleError(err);
                  this.dbDataTable.SetFormReadonly(false)
                },
              });
            } else {
              console.log(d.errors!, d.errors!.join('\n'), d.errors!.join(', '));
              this.simpleToastrService.show(
                d.errors!.join('\n'),
                Constants.TITLE_ERROR,
                Constants.TOASTR_ERROR_5_SEC
              );
              this.isLoading = false;
              this.sts.pushProcessStatus(Constants.BlankProcessStatus);
              this.dbDataTable.SetFormReadonly(false)
              this.kbS.ClickCurrentElement()
            }
          },
          error: (err) => {
            this.HandleError(err);
            this.dbDataTable.SetFormReadonly(false)
           },
        });
      });
    }
  }

  override ProcessActionPut(data?: IUpdateRequest<Counter>): void {
    console.log('ActionPut: ', data?.data, JSON.stringify(data?.data));
    if (!!data && !!data.data) {

      this.GetWareHouses().then(res => {
        const updateRequest = this.CounterToUpdateRequest(data.data);

        console.log('ActionPut request: ', updateRequest);

        this.sts.pushProcessStatus(Constants.CRUDPutStatuses[Constants.CRUDPutPhases.UPDATING]);

        data.data.id = HelperFunctions.ToInt(data.data.id);
        this.seInv.Update(updateRequest).subscribe({
          next: (d) => {
            if (d.succeeded && !!d.data) {
              this.seInv.Get({ ID: d.data.id }).subscribe({
                next: newData => {
                  if (!!newData) {
                    d.data = this.ConvertCombosForGet(newData);
                    const newRow = {
                      data: newData,
                    } as TreeGridNode<Counter>
                    const newRowIndex = this.dbData.findIndex(x => x.data.id === newRow.data.id);
                    this.dbData[newRowIndex !== -1 ? newRowIndex : data.rowIndex] = newRow;
                    this.dbDataTable.SetDataForForm(newRow, false, false);
                    this.RefreshTable(newRow.data.id);
                    this.simpleToastrService.show(
                      Constants.MSG_SAVE_SUCCESFUL,
                      Constants.TITLE_INFO,
                      Constants.TOASTR_SUCCESS_5_SEC
                    );
                    this.dbDataTable.flatDesignForm.SetFormStateToDefault();
                    this.isLoading = false;
                    this.sts.pushProcessStatus(Constants.BlankProcessStatus);
                  }
                },
                error: (err) => {
                  this.HandleError(err);
                  this.dbDataTable.SetFormReadonly(false)
                 },
              });
            } else {
              this.simpleToastrService.show(
                d.errors!.join('\n'),
                Constants.TITLE_ERROR,
                Constants.TOASTR_ERROR_5_SEC
              );
              this.isLoading = false;
              this.sts.pushProcessStatus(Constants.BlankProcessStatus);
              this.dbDataTable.SetFormReadonly(false)
              this.kbS.ClickCurrentElement()
            }
          },
          error: (err) => {
            this.HandleError(err);
            this.dbDataTable.SetFormReadonly(false)
          },
        });
      });
    }
  }

  override ProcessActionDelete(data?: IUpdateRequest<Counter>): void {
    const id = data?.data?.id;
    console.log('ActionDelete: ', id);
    if (id !== undefined) {
      this.sts.pushProcessStatus(Constants.DeleteStatuses[Constants.DeletePhases.DELETING]);
      this.seInv
        .Delete({
          id: id,
        } as DeleteCounterRequest)
        .subscribe({
          next: (d) => {
            if (d.succeeded && !!d.data) {
              const di = this.dbData.findIndex((x) => x.data.id === id);
              this.dbData.splice(di, 1);
              this.simpleToastrService.show(
                Constants.MSG_DELETE_SUCCESFUL,
                Constants.TITLE_INFO,
                Constants.TOASTR_SUCCESS_5_SEC
              );
              this.HandleGridSelectionAfterDelete(di);
              this.isLoading = false;
              this.sts.pushProcessStatus(Constants.BlankProcessStatus);
            } else {
              this.simpleToastrService.show(
                d.errors!.join('\n'),
                Constants.TITLE_ERROR,
                Constants.TOASTR_ERROR_5_SEC
              );
              this.isLoading = false;
              this.sts.pushProcessStatus(Constants.BlankProcessStatus);
            }
          },
          error: (err) => {
            this.HandleError(err);
          },
        });
    }
  }

  private validateCurrentNumber(control: AbstractControl): any {
    if (this.dbDataTableForm === undefined || this.dbDataTableForm.controls === undefined) {
      return null
    }

    const controlValue = (control.value + '').replace(/\s/g, '')
    const numberPartLengths = (this.dbDataTableForm.controls['numbepartLength']?.value + '').replace(/\s/g, '')

    const controlValueNumber = Number(controlValue)
    const numberPartLengthsNumber = Number(numberPartLengths)

    if (controlValueNumber < 10 && controlValueNumber > 0) {
      return null
    }

    if (controlValueNumber < 1) {
      return { minLength: { value: control.value } }
    }

    if (isNaN(controlValueNumber) || isNaN(numberPartLengthsNumber)) {
      return null
    }

    console.trace(controlValue, numberPartLengthsNumber)

    const wrong = controlValue.length > numberPartLengthsNumber!
    return wrong ? { maxLength: { value: control.value } } : null
  }

  private Setup(): void {
    this.dbData = [];

    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    this.dbDataTableForm = new FormGroup({
      id: new FormControl(0, []),
      counterCode: new FormControl('', [Validators.required]),
      counterDescription: new FormControl('', [Validators.required]),
      warehouse: new FormControl('', [Validators.required]),
      prefix: new FormControl('', [Validators.required, Validators.maxLength(80)]),
      currentNumber: new FormControl(0, [Validators.required, this.validateCurrentNumber.bind(this)]),
      numbepartLength: new FormControl(0, [Validators.required, Validators.min(2), Validators.max(10)]),
      suffix: new FormControl('', [Validators.required]),
    });

    this.dbDataTable = new FlatDesignNavigatableTable(
      this.dbDataTableForm,
      'Counter',
      this.dataSourceBuilder,
      this.kbS,
      this.fS,
      this.cdref,
      this.dbData,
      this.dbDataTableId,
      AttachDirection.DOWN,
      'sideBarForm',
      AttachDirection.RIGHT,
      this.bbxSidebarService,
      this.sidebarFormService,
      this,
      () => {
        return {
          id: 0,
          counterCode: '',
          counterDescription: '',
          warehouse: this.wareHouses[0]?.warehouseDescription,
          prefix: '',
          currentNumber: 0,
          numbepartLength: 0,
          suffix: ''
        } as Counter;
      }
    );
    this.dbDataTable.PushFooterCommandList();
    this.dbDataTable.OuterJump = true;
    this.dbDataTable.NewPageSelected.subscribe({
      next: (newPageNumber: number) => {
        this.Refresh(this.getInputParams);
      },
    });
    this.dbDataTable.flatDesignForm.FillFormWithObject = (data: Counter) => {
      if (!!data && !!this.dbDataTable.flatDesignForm) {
        data = { ...data };

        data.warehouse = HelperFunctions.GetWarehouseDescription(data.warehouse, this.wareHouses, '');

        Object.keys(this.dbDataTable.flatDesignForm.form.controls).forEach((x: string) => {
          this.dbDataTable.flatDesignForm!.form.controls[x].setValue(data[x as keyof Counter]);
          if (environment.flatDesignFormDebug) {
            console.log(`[FillFormWithObject] with Product: ${x}, ${data[x as keyof Counter]},
              ${this.dbDataTable.flatDesignForm!.form.controls[x].value}`);
          }
        });
      }
    }

    this.bbxSidebarService.collapse();

    this.RefreshAll(this.getInputParams);
  }

  override Refresh(params?: GetCountersParamListModel): void {
    if (!!this.Subscription_Refresh && !this.Subscription_Refresh.closed) {
      this.Subscription_Refresh.unsubscribe();
    }

    console.log('Refreshing');

    this.isLoading = true;
    this.Subscription_Refresh = this.seInv.GetAll(params).subscribe({
      next: (d) => {
        if (d.succeeded && !!d.data) {
          if (!!d) {
            const tempData = d.data.map((x) => {
              return { data: this.ConvertCombosForGet(x), uid: this.nextUid() };
            });
            this.dbData = tempData;
            this.dbDataDataSrc.setData(this.dbData);
            this.dbDataTable.SetPaginatorData(d);
          }
          this.RefreshTable();
        } else {
          this.simpleToastrService.show(
            d.errors!.join('\n'),
            Constants.TITLE_ERROR,
            Constants.TOASTR_ERROR_5_SEC
          );
        }
      },
      error: (err) => {
        { this.cs.HandleError(err); this.isLoading = false; };
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  async RefreshAsync(params?: GetCountersParamListModel): Promise<void> {
    console.log('Refreshing');
    this.isLoading = true;
    await lastValueFrom(this.seInv.GetAll(params))
      .then(d => {
        if (d.succeeded && !!d.data) {
          if (!!d) {
            const tempData = d.data.map((x) => {
              return { data: this.ConvertCombosForGet(x), uid: this.nextUid() };
            });
            this.dbData = tempData;
            this.dbDataDataSrc.setData(this.dbData);
            this.dbDataTable.SetPaginatorData(d);
          }
          this.RefreshTable();
        } else {
          this.simpleToastrService.show(
            d.errors!.join('\n'),
            Constants.TITLE_ERROR,
            Constants.TOASTR_ERROR_5_SEC
          );
        }
      })
      .catch(err => {
        { this.cs.HandleError(err); this.isLoading = false; };
        this.isLoading = false;
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  ngOnInit(): void {
    this.fS.pushCommands(this.commands);
  }
  ngAfterViewInit(): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    this.SetTableAndFormCommandListFromManager();

    this.dbDataTable.GenerateAndSetNavMatrices(true);
    this.dbDataTable.PushFooterCommandList();

    this.kbS.SelectFirstTile();
  }
  ngOnDestroy(): void {
    console.log('Detach');
    this.kbS.Detach();
  }

  private RefreshAll(params?: GetCountersParamListModel): void {
    this.Refresh(params);
  }

  // F12 is special, it has to be handled in constructor with a special keydown event handling
  // to prevent it from opening devtools
  @HostListener('window:keydown', ['$event']) onKeyDown2(event: KeyboardEvent) {
    if (this.khs.IsKeyboardBlocked) {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      return;
    }
    switch (event.key) {
      case this.KeySetting[Actions.JumpToForm].KeyCode: {
        // TODO: 'active-prod-search' into global variable
        if ((event as any).target.id !== 'active-prod-search') {
          return;
        }

        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`${this.KeySetting[Actions.JumpToForm].KeyLabel} Pressed: ${this.KeySetting[Actions.JumpToForm].FunctionLabel}`);
        this.dbDataTable?.HandleSearchFieldTab();
        break;
      }
      case this.KeySetting[Actions.ToggleForm].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`${this.KeySetting[Actions.ToggleForm].KeyLabel} Pressed: ${this.KeySetting[Actions.ToggleForm].FunctionLabel}`);
        this.dbDataTable?.HandleKey(event);
        break;
      }
      case this.KeySetting[Actions.Create].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`${this.KeySetting[Actions.Create].KeyLabel} Pressed: ${this.KeySetting[Actions.Create].FunctionLabel}`);
        this.dbDataTable?.HandleKey(event);
        break;
      }
      case this.KeySetting[Actions.Refresh].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`${this.KeySetting[Actions.Refresh].KeyLabel} Pressed: ${this.KeySetting[Actions.Refresh].FunctionLabel}`);
        this.dbDataTable?.HandleKey(event);
        break;
      }
      case this.KeySetting[Actions.Edit].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`${this.KeySetting[Actions.Edit].KeyLabel} Pressed: ${this.KeySetting[Actions.Edit].FunctionLabel}`);
        this.dbDataTable?.HandleKey(event);
        break;
      }
      case this.KeySetting[Actions.Delete].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`${this.KeySetting[Actions.Delete].KeyLabel} Pressed: ${this.KeySetting[Actions.Delete].FunctionLabel}`);
        this.dbDataTable?.HandleKey(event);
        break;
      }
      default: { }
    }
  }
}
