import { ChangeDetectorRef, Component, HostListener, OnInit, Optional, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { NbTable, NbTreeGridDataSourceBuilder, NbToastrService } from '@nebular/theme';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { TokenStorageService } from 'src/app/modules/auth/services/token-storage.service';
import { BaseManagerComponent } from 'src/app/modules/shared/base-manager/base-manager.component';
import { BbxDialogServiceService } from 'src/app/services/bbx-dialog-service.service';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { CommonService } from 'src/app/services/common.service';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { KeyboardNavigationService, KeyboardModes } from 'src/app/services/keyboard-navigation.service';
import { LoggerService } from 'src/app/services/logger.service';
import { SideBarFormService } from 'src/app/services/side-bar-form.service';
import { StatusService } from 'src/app/services/status.service';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { FlatDesignNavigatableTable } from 'src/assets/model/navigation/FlatDesignNavigatableTable';
import { AttachDirection, TileCssClass } from 'src/assets/model/navigation/Navigatable';
import { Constants } from 'src/assets/util/Constants';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { EqualizationNavigationManagerComponentKeySettings, GetFooterCommandListFromKeySettings, Actions } from 'src/assets/util/KeyBindings';
import { GetInvPaymentsParamListModel } from '../../models/GetInvPaymentsParamListModel';
import { InvPaymentItem, InvPaymentItemFull } from '../../models/InvPayment';
import { EqualizationsNavigationFilterFormData } from '../equalization-navigation-filter-form/EqualizationsNavigationFilterFormData';
import { EqualizationsService } from '../../services/equalizations.service';

@Component({
  selector: 'app-equalization-navigation-manager',
  templateUrl: './equalization-navigation-manager.component.html',
  styleUrls: ['./equalization-navigation-manager.component.scss']
})
export class EqualizationNavigationManagerComponent extends BaseManagerComponent<InvPaymentItem> implements OnInit {
  @ViewChild('table') table?: NbTable<any>;

  public override KeySetting: Constants.KeySettingsDct = EqualizationNavigationManagerComponentKeySettings;
  public override commands: FooterCommandInfo[] = GetFooterCommandListFromKeySettings(this.KeySetting);

  override allColumns = [
    'invoiceNumber',
    'customerName',
    'paymentDate',
    'payableAmount',
    'bankTransaction',
    'invPaymentDate',
    'currencyCodeX',
    'exchangeRate',
    'invPaymentAmount',
    'GetRemaining'
  ];
  override colDefs: ModelFieldDescriptor[] = [
    {
      label: 'Számlaszám', objectKey: 'invoiceNumber', colKey: 'invoiceNumber',
      defaultValue: '', type: 'string', mask: "", navMatrixCssClass: TileCssClass,
      colWidth: "20%", textAlign: "left", fInputType: 'invoice-number'
    },
    {
      label: 'Ügyfél', objectKey: 'customerName', colKey: 'customerName',
      defaultValue: '', type: 'string', mask: "", fReadonly: true,
      colWidth: "90%", textAlign: "left", navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Fiz.hat', objectKey: 'paymentDate', colKey: 'paymentDate',
      defaultValue: '', type: 'onlyDate', fRequired: true, fInputType: 'date',
      mask: '', colWidth: '100px', textAlign: 'left', fReadonly: true, navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Kiegyenlítendő', objectKey: 'payableAmount', colKey: 'payableAmount',
      defaultValue: '', type: 'formatted-number', mask: "", navMatrixCssClass: TileCssClass,
      colWidth: "150px", textAlign: "right", fInputType: 'formatted-number', fReadonly: true,
    },
    {
      label: 'Banki azonosító', objectKey: 'bankTransaction', colKey: 'bankTransaction',
      defaultValue: '', type: 'string', mask: "",
      colWidth: "150px", textAlign: "left", navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Dátum', objectKey: 'invPaymentDate', colKey: 'invPaymentDate',
      defaultValue: '', type: 'onlyDate', fInputType: 'date', navMatrixCssClass: TileCssClass,
      mask: '', colWidth: '100px', textAlign: 'left', fReadonly: false
    },
    {
      label: 'Pénznem', objectKey: 'currencyCodeX', colKey: 'currencyCodeX',
      defaultValue: '', type: 'string', mask: "", navMatrixCssClass: TileCssClass,
      colWidth: "125px", textAlign: "left", comboboxData$: new BehaviorSubject<string[]>([])
    },
    {
      label: 'Árfolyam', objectKey: 'exchangeRate', colKey: 'exchangeRate',
      defaultValue: '', type: 'formatted-number', mask: "", navMatrixCssClass: TileCssClass,
      colWidth: "125px", textAlign: "right", fInputType: 'formatted-number', fReadonly: false,
    },
    {
      label: 'Összeg', objectKey: 'invPaymentAmount', colKey: 'invPaymentAmount',
      defaultValue: '', type: 'formatted-number', mask: "", navMatrixCssClass: TileCssClass,
      colWidth: "125px", textAlign: "right", fInputType: 'formatted-number', fReadonly: false,
    },
    {
      label: 'Fennmaradó', objectKey: 'GetRemaining', colKey: 'GetRemaining',
      defaultValue: '', type: 'formatted-number', mask: "", navMatrixCssClass: TileCssClass,
      colWidth: "125px", textAlign: "right", fInputType: 'formatted-number', fReadonly: false,
    }
  ]

  private filterData: EqualizationsNavigationFilterFormData = {} as EqualizationsNavigationFilterFormData
  public override getInputParams(override?: Constants.Dct): GetInvPaymentsParamListModel {
    const params = {
      SearchString: this.filterData.SearchString,
      DateFrom: this.filterData.FromDate,
      DateTo: this.filterData.ToDate,
      Deleted: false,
      OrderBy: 'invPaymentDate',
      PageNumber: this.dbDataTable.currentPage + '',
      PageSize: this.dbDataTable.pageSize
    } as GetInvPaymentsParamListModel;
    return params;
  }

  get blankRow(): () => InvPaymentItem {
    return () => {
      return new InvPaymentItem()
    }
  }

  constructor(
    @Optional() dialogService: BbxDialogServiceService,
    fS: FooterService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<InvPaymentItem>>,
    private equalizationService: EqualizationsService,
    private cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    private simpleToastrService: NbToastrService,
    sidebarService: BbxSidebarService,
    private sidebarFormService: SideBarFormService,
    cs: CommonService,
    sts: StatusService,
    private khs: KeyboardHelperService,
    loggerService: LoggerService,
    private tokenService: TokenStorageService
  ) {
    super(dialogService, kbS, fS, sidebarService, cs, sts, loggerService);
    this.searchInputId = Constants.SearchInputId;
    this.dbDataTableId = 'product-table';
    this.dbDataTableEditId = 'user-cell-edit-input';
    this.kbS.ResetToRoot();
    this.Setup();
  }

  override GetRecordName(data: InvPaymentItem): string | number | undefined {
    return data.invoiceNumber
  }

  private Setup(): void {
    this.dbData = [];

    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    this.dbDataTableForm = new FormGroup({
      invoiceID: new FormControl(undefined, []),
      invoiceNumber: new FormControl(undefined, []),
      customerName: new FormControl(undefined, []),
      paymentDate: new FormControl(undefined, []),
      payableAmount: new FormControl(undefined, []),
      bankTransaction: new FormControl(undefined, []),
      invPaymentDate: new FormControl(undefined, []),
      currencyCodeX: new FormControl(undefined, []),
      exchangeRate: new FormControl(undefined, []),
      invPaymentAmount: new FormControl(undefined, []),
    });

    this.dbDataTable = new FlatDesignNavigatableTable(
      this.dbDataTableForm,
      'EqualizationNavigationManagerComponent',
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
      this.blankRow,
      false
    );
    this.dbDataTable.PushFooterCommandList();
    this.dbDataTable.OuterJump = true;
    this.dbDataTable.NewPageSelected.subscribe({
      next: (newPageNumber: number) => {
        this.Refresh(this.getInputParams());
      },
    });

    this.bbxSidebarService.collapse();

    this.isLoading = false;
  }

  public refreshClicked(filterData: EqualizationsNavigationFilterFormData | undefined): void {
    this.filterData = filterData ?? {} as EqualizationsNavigationFilterFormData

    this.UpdateKeySettingsAndCommand()

    this.RefreshAll(this.getInputParams())
  }

  public HideColumn(col: string): void {
    const index = this.allColumns.findIndex(x => x == col);
    if (index >= 0) {
      this.allColumns.splice(index, 1);
    }
  }

  public ShowColumn(col: string, position?: number): void {
    if (this.allColumns.includes(col)) {
      return;
    }
    if (position !== undefined) {
      this.allColumns.splice(position!, 0, col);
    } else {
      this.allColumns.push(col);
    }
  }

  private ToInvPaymentItem(x: InvPaymentItemFull): InvPaymentItem {
    let res = new InvPaymentItem()
    res = HelperFunctions.PatchObject(x, res)
    return res
  }

  override Refresh(params?: GetInvPaymentsParamListModel): void {
    this.sts.waitForLoad(true)
    this.equalizationService.GetAll(params).subscribe({
      next: async (d) => {
        if (d.succeeded && !!d.data) {
          if (!!d) {
            const tempData = d.data.map((x) => {
              return { data: this.ToInvPaymentItem(x), uid: this.nextUid() };
            });
            this.dbData = tempData;
            this.dbDataDataSrc.setData(this.dbData);
            this.dbDataTable.SetPaginatorData(d);
          }
          this.RefreshTable(undefined, true);
        } else {
          this.simpleToastrService.show(
            d.errors!.join('\n'),
            Constants.TITLE_ERROR,
            Constants.TOASTR_ERROR_5_SEC
          );
        }
      },
      error: (err) => {
        this.cs.HandleError(err)
        this.sts.waitForLoad(false)
      },
      complete: () => {
        this.sts.waitForLoad(false)
      },
    })
  }

  async RefreshAsync(params?: GetInvPaymentsParamListModel): Promise<void> {
    this.sts.waitForLoad(true)

    await lastValueFrom(this.equalizationService.GetAll(params))
      .then(async d => {
        if (d.succeeded && !!d.data) {
          if (!!d) {
            const tempData = d.data.map((x) => {
              return { data: this.ToInvPaymentItem(x), uid: this.nextUid() };
            });
            this.dbData = tempData;
            this.dbDataDataSrc.setData(this.dbData);
            this.dbDataTable.SetPaginatorData(d);
          }
          this.RefreshTable(undefined, true);
        } else {
          this.simpleToastrService.show(
            d.errors!.join('\n'),
            Constants.TITLE_ERROR,
            Constants.TOASTR_ERROR_5_SEC
          );
        }
      })
      .catch(err => {
        this.cs.HandleError(err);
        this.sts.waitForLoad(false)
      })
      .finally(() => {
        this.sts.waitForLoad(false)
      })
  }

  ngOnInit(): void {
    this.fS.pushCommands(this.commands);
  }
  ngAfterViewInit(): void {

  }
  ngOnDestroy(): void {
    console.log('Detach');
    this.kbS.Detach();
  }

  public filterFormPageReady(): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION)

    this.SetTableAndFormCommandListFromManager()

    this.dbDataTable.PushFooterCommandList()
    this.dbDataTable.GenerateAndSetNavMatrices(true)
  }

  private RefreshAll(params?: GetInvPaymentsParamListModel): void {
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
      case this.KeySetting[Actions.Print].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();
        break
      }
      case this.KeySetting[Actions.JumpToForm].KeyCode: {
        if ((event as any).target.id !== Constants.SearchInputId) {
          return;
        }

        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        this.dbDataTable?.HandleSearchFieldTab();
        break;
      }
      case this.KeySetting[Actions.ToggleForm].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        this.dbDataTable?.HandleKey(event);
        break;
      }
      case this.KeySetting[Actions.Lock].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();
        break;
      }
      case this.KeySetting[Actions.Refresh].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        this.RefreshAll(this.getInputParams());
        break;
      }
      case this.KeySetting[Actions.Reset].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();
        break
      }
      case this.KeySetting[Actions.Edit].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();
        break;
      }
      case this.KeySetting[Actions.Delete].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        this.dbDataTable?.HandleKey(event);
        break;
      }
      default: { }
    }
  }

}
