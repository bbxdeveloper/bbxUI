import { ChangeDetectorRef, Component, HostListener, OnInit, Optional, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { NbDialogService, NbTable, NbToastrService, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { lastValueFrom } from 'rxjs';
import { BaseManagerComponent } from 'src/app/modules/shared/base-manager/base-manager.component';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { CommonService } from 'src/app/services/common.service';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardHelperService } from 'src/app/services/keyboard-helper.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { PrintAndDownloadService, PrintDialogRequest } from 'src/app/services/print-and-download.service';
import { SideBarFormService } from 'src/app/services/side-bar-form.service';
import { StatusService } from 'src/app/services/status.service';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { FlatDesignNavigatableTable } from 'src/assets/model/navigation/FlatDesignNavigatableTable';
import { AttachDirection, TileCssClass } from 'src/assets/model/navigation/Navigatable';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { IUpdateRequest } from 'src/assets/model/UpdaterInterfaces';
import { Constants } from 'src/assets/util/Constants';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { Actions, GetFooterCommandListFromKeySettings, WarehouseDocumentsKeySettings } from 'src/assets/util/KeyBindings';
import { WarehouseDocumentFilterFormData } from '../warehouse-document-filter-form/WarehouseDocumentFilterFormData';
import { WhsTransferFull } from '../../models/whs/WhsTransfer';
import { WhsTransferQueryParams } from '../../models/whs/WhsTransferQueryParams';
import { WhsStatus, WhsTransferService } from '../../services/whs-transfer.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-warehouse-document-manager',
  templateUrl: './warehouse-document-manager.component.html',
  styleUrls: ['./warehouse-document-manager.component.scss'],
  providers: [WhsTransferService]
})
export class WarehouseDocumentManagerComponent extends BaseManagerComponent<WhsTransferFull> implements OnInit {
  @ViewChild('table') table?: NbTable<any>;

  public override KeySetting: Constants.KeySettingsDct = WarehouseDocumentsKeySettings;
  public override commands: FooterCommandInfo[] = GetFooterCommandListFromKeySettings(this.KeySetting);

  override allColumns = [
    'whsTransferNumber',
    'fromWarehouse',
    'toWarehouse',
    'transferDate',
    'whsTransferStatusX',
    'whsTransferAmount',
    'user',
    'notice',
  ];
  override colDefs: ModelFieldDescriptor[] = [
    {
      label: 'Bizonylatszám',
      objectKey: 'whsTransferNumber',
      colKey: 'whsTransferNumber',
      defaultValue: '',
      type: 'string',
      mask: '',
      colWidth: '150px',
      textAlign: 'center',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Kiadás raktár',
      objectKey: 'fromWarehouse',
      colKey: 'fromWarehouse',
      defaultValue: '',
      type: 'string',
      mask: '',
      colWidth: '35%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Bevétel raktár',
      objectKey: 'toWarehouse',
      colKey: 'toWarehouse',
      defaultValue: '',
      type: 'string',
      mask: '',
      colWidth: '35%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Dátum',
      objectKey: 'transferDate',
      colKey: 'transferDate',
      defaultValue: '',
      type: 'onlyDate',
      fRequired: true,
      mask: '',
      colWidth: '120px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Bev.Dát.',
      objectKey: 'transferDateIn',
      colKey: 'transferDateIn',
      defaultValue: '',
      type: 'onlyDate',
      fRequired: true,
      mask: '',
      colWidth: '120px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Státusz',
      objectKey: 'whsTransferStatusX',
      colKey: 'whsTransferStatusX',
      defaultValue: '',
      type: 'string',
      fRequired: true,
      mask: '',
      colWidth: '100px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Érték',
      objectKey: 'whsTransferAmount',
      colKey: 'whsTransferAmount',
      defaultValue: '',
      type: 'formatted-number',
      fRequired: true,
      mask: '',
      colWidth: '120px',
      textAlign: 'right',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Felhasználó',
      objectKey: 'user',
      colKey: 'user',
      defaultValue: '',
      type: 'string',
      mask: '',
      colWidth: '150px',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Megjegyzés',
      objectKey: 'notice',
      colKey: 'notice',
      defaultValue: '',
      type: 'string',
      mask: '',
      colWidth: '30%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
  ];

  private filterData: WarehouseDocumentFilterFormData = {} as WarehouseDocumentFilterFormData
  override get getInputParams(): WhsTransferQueryParams {
    const params = {
      WhsTransferStatus: this.filterData.Status,
      FromWarehouseCode: this.filterData.FromWarehouseCode,
      ToWarehouseCode: this.filterData.ToWarehouseCode,
      TransferDateFrom: this.filterData.FromDate,
      TransferDateTo: this.filterData.ToDate,
      Deleted: false,
      OrderBy: "whsTransferNumber",
      PageNumber: HelperFunctions.ToInt(this.dbDataTable.currentPage + ''),
      PageSize: HelperFunctions.ToInt(this.dbDataTable.pageSize)
    } as WhsTransferQueryParams;
    return params;
  }

  get blankRow(): () => WhsTransferFull {
    return () => {
      return new WhsTransferFull()
    }
  }

  constructor(
    @Optional() dialogService: NbDialogService,
    fS: FooterService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<WhsTransferFull>>,
    private whsService: WhsTransferService,
    private cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    private simpleToastrService: NbToastrService,
    sidebarService: BbxSidebarService,
    private sidebarFormService: SideBarFormService,
    cs: CommonService,
    sts: StatusService,
    private router: Router,
    private khs: KeyboardHelperService,
    private printAndDownloadService: PrintAndDownloadService
  ) {
    super(dialogService, kbS, fS, sidebarService, cs, sts);
    this.searchInputId = 'active-prod-search';
    this.dbDataTableId = 'product-table';
    this.dbDataTableEditId = 'user-cell-edit-input';
    this.kbS.ResetToRoot();
    this.Setup();
  }

  private Setup(): void {
    this.dbData = [];

    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    this.dbDataTableForm = new FormGroup({
      whsTransferNumber: new FormControl(undefined, []),
      fromWarehouse: new FormControl(undefined, []),
      toWarehouse: new FormControl(undefined, []),
      transferDate: new FormControl(undefined, []),
      whsTransferStatusX: new FormControl(undefined, []),
      whsTransferAmount: new FormControl(undefined, []),
      user: new FormControl(undefined, []),
      notice: new FormControl(undefined, []),
    });

    this.dbDataTable = new FlatDesignNavigatableTable(
      this.dbDataTableForm,
      'WarehouseDocumentManager',
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
        this.Refresh(this.getInputParams);
      },
    });

    this.bbxSidebarService.collapse();

    this.isLoading = false;
  }

  override ProcessActionDelete(data?: IUpdateRequest<WhsTransferFull>): void {
    const id = data?.data?.id;
    console.log('ActionDelete: ', id);
    if (id !== undefined) {
      this.sts.pushProcessStatus(Constants.DeleteStatuses[Constants.DeletePhases.DELETING]);
      this.whsService
        .Delete(HelperFunctions.ToInt(id))
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
          error: (err) => { this.HandleError(err); },
        });
    }
  }

  public refreshClicked(filterData: WarehouseDocumentFilterFormData | undefined): void {
    this.filterData = filterData ?? {} as WarehouseDocumentFilterFormData;
    this.RefreshAll(this.getInputParams);
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

  override Refresh(params?: WhsTransferQueryParams): void {
    console.log('Refreshing'); // TODO: only for debug
    this.isLoading = true;
    this.whsService.GetAll(params).subscribe({
      next: async (d) => {
        if (d.succeeded && !!d.data) {
          console.log('GetProducts response: ', d); // TODO: only for debug
          if (!!d) {
            const tempData = d.data.map((x) => {
              return { data: x, uid: this.nextUid() }; // this.ConvertCombosForGet(x)
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
        { this.cs.HandleError(err); this.isLoading = false; };
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;

        if (this.filterData?.Status === WhsStatus.COMPLETED) {
          this.ShowColumn('transferDateIn', 4)
        } else {
          this.HideColumn('transferDateIn')
        }
      },
    });
  }

  async RefreshAsync(params?: WhsTransferQueryParams): Promise<void> {
    console.log('Refreshing'); // TODO: only for debug
    this.isLoading = true;

    await lastValueFrom(this.whsService.GetAll(params))
      .then(async d => {
        if (d.succeeded && !!d.data) {
          console.log('GetProducts response: ', d); // TODO: only for debug
          if (!!d) {
            const tempData = d.data.map((x) => {
              return { data: x, uid: this.nextUid() }; // this.ConvertCombosForGet(x)
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
      })
      .finally(() => {
        this.isLoading = false;
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

    this.dbDataTable.GenerateAndSetNavMatrices(true)
    this.dbDataTable.PushFooterCommandList()
  }

  private RefreshAll(params?: WhsTransferQueryParams): void {
    this.Refresh(params);
  }

  private print(): void {
    const selectedRow = this.dbDataTable.prevSelectedRow

    const whsNumber = selectedRow?.data.whsTransferNumber ?? ''

    this.printAndDownloadService.openPrintDialog({
      DialogTitle: 'Bizonylat nyomtatása',
      DefaultCopies: 1,
      MsgError: `A ${whsNumber} bizonylat nyomtatása közben hiba történt.`,
      MsgCancel: `A ${whsNumber} bizonylat nyomtatása nem történt meg.`,
      MsgFinish: `A ${whsNumber} bizonylat nyomtatása véget ért.`,
      Obs: this.whsService.GetReport.bind(this.whsService),
      Reset: () => { },
      ReportParams: {
        id: selectedRow?.data.id,
        copies: 1
      } as Constants.Dct,
    } as PrintDialogRequest)
  }

  Edit(): void {
    if (this.kbS.IsCurrentNavigatable(this.dbDataTable)) {
      const id = this.dbData[this.kbS.p.y - 1].data.id
      this.router.navigate(['warehouse/inbetween-warehouse-edit', id, {}])
    }
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

        if (!this.kbS.IsCurrentNavigatable(this.dbDataTable)) {
          this.simpleToastrService.show(
            "Csak aktívan kijelölt rekord mellett lehet nyomtatni!",
            Constants.TITLE_ERROR,
            Constants.TOASTR_ERROR_5_SEC
          )
          return
        }

        console.log(`${this.KeySetting[Actions.Print].KeyLabel} Pressed: ${this.KeySetting[Actions.Print].FunctionLabel}`);
        this.print()
        break;
      }
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
      case this.KeySetting[Actions.CSV].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`${this.KeySetting[Actions.CSV].KeyLabel} Pressed: ${this.KeySetting[Actions.CSV].FunctionLabel}`);

        break;
      }
      case this.KeySetting[Actions.Refresh].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`${this.KeySetting[Actions.Refresh].KeyLabel} Pressed: ${this.KeySetting[Actions.Refresh].FunctionLabel}`);
        this.RefreshAll(this.getInputParams);
        break;
      }
      case this.KeySetting[Actions.Edit].KeyCode: {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        console.log(`${this.KeySetting[Actions.Edit].KeyLabel} Pressed: ${this.KeySetting[Actions.Edit].FunctionLabel}`);
        this.Edit()
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
