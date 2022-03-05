import { ChangeDetectorRef, Component, OnInit, Optional, ViewChild } from '@angular/core';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';
import { NbDialogService, NbTable, NbToastrService, NbTreeGridDataSource, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SideBarFormService } from 'src/app/services/side-bar-form.service';
import { IUpdateRequest, IUpdater } from 'src/assets/model/UpdaterInterfaces';
import { Constants } from 'src/assets/util/Constants';
import { CommonService } from 'src/app/services/common.service';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { AttachDirection, FlatDesignNavigatableTable, TileCssClass } from 'src/assets/model/navigation/Nav';
import { DeleteWareHouseRequest } from '../models/DeleteWareHouseRequest';
import { GetWareHousesParamListModel } from '../models/GetWareHousesParamListModel';
import { BlankWareHouse, WareHouse } from '../models/WareHouse';
import { WareHouseService } from '../services/ware-house.service';
import { BaseManagerComponent } from '../../shared/base-manager/base-manager.component';

@Component({
  selector: 'app-ware-house-manager',
  templateUrl: './ware-house-manager.component.html',
  styleUrls: ['./ware-house-manager.component.scss']
})
export class WareHouseManagerComponent extends BaseManagerComponent<WareHouse> implements OnInit {
  @ViewChild('table') table?: NbTable<any>;

  dbDataTableId = 'warehouse-table';
  dbDataTableEditId = 'user-cell-edit-input';

  colsToIgnore: string[] = [];
  allColumns = ['id', 'warehouseCode', 'warehouseDescription'];
  colDefs: ModelFieldDescriptor[] = [
    {
      label: 'Azonosító',
      objectKey: 'id',
      colKey: 'id',
      defaultValue: '',
      type: 'string',
      fInputType: 'readonly',
      mask: '',
      colWidth: '15%',
      textAlign: 'center',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Kód',
      objectKey: 'warehouseCode',
      colKey: 'warehouseCode',
      defaultValue: '',
      type: 'string',
      fInputType: 'text',
      fRequired: true,
      mask: '',
      colWidth: '30%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
    },
    {
      label: 'Leírás',
      objectKey: 'warehouseDescription',
      colKey: 'warehouseDescription',
      defaultValue: '',
      type: 'string',
      fRequired: true,
      fInputType: 'text',
      mask: 'Set in sidebar form.',
      colWidth: '55%',
      textAlign: 'left',
      navMatrixCssClass: TileCssClass,
      fLast: true
    },
  ];

  searchString: string = '';

  constructor(
    @Optional() dialogService: NbDialogService,
    fS: FooterService,
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<WareHouse>>,
    private seInv: WareHouseService,
    private cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    private toastrService: NbToastrService,
    sidebarService: BbxSidebarService,
    private sidebarFormService: SideBarFormService,
    private cs: CommonService
  ) {
    super(dialogService, kbS, fS, sidebarService);
    this.searchInputId = 'active-prod-search';
    this.kbS.ResetToRoot();
    this.Setup();
  }

  override ProcessActionNew(data?: IUpdateRequest<WareHouse>): void {
    console.log('ActionNew: ', data?.data);
    if (!!data && !!data.data) {
      this.seInv.Create(data.data).subscribe({
        next: (d) => {
          if (d.succeeded && !!d.data) {
            this.dbData.push({ data: d.data } as TreeGridNode<WareHouse>);
            this.RefreshTable();
            this.toastrService.show(
              Constants.MSG_SAVE_SUCCESFUL,
              Constants.TITLE_INFO,
              Constants.TOASTR_SUCCESS
            );
          } else {
            console.log(d.errors!, d.errors!.join('\n'), d.errors!.join(', '));
            this.toastrService.show(
              d.errors!.join('\n'),
              Constants.TITLE_ERROR,
              Constants.TOASTR_ERROR
            );
          }
        },
        error: (err) => this.cs.HandleError(err),
      });
    }
  }

  override ProcessActionPut(data?: IUpdateRequest<WareHouse>): void {
    console.log('ActionPut: ', data?.data, JSON.stringify(data?.data));
    if (!!data && !!data.data) {
      this.seInv.Update(data.data).subscribe({
        next: (d) => {
          if (d.succeeded && !!d.data) {
            this.dbData[data.rowIndex] = {
              data: d.data,
            } as TreeGridNode<WareHouse>;
            this.RefreshTable();
            this.toastrService.show(
              Constants.MSG_SAVE_SUCCESFUL,
              Constants.TITLE_INFO,
              Constants.TOASTR_SUCCESS
            );
          } else {
            this.toastrService.show(
              d.errors!.join('\n'),
              Constants.TITLE_ERROR,
              Constants.TOASTR_ERROR
            );
          }
        },
        error: (err) => this.cs.HandleError(err),
      });
    }
  }

  override ProcessActionDelete(data?: IUpdateRequest<WareHouse>): void {
    const id = data?.data?.id;
    console.log('ActionDelete: ', id);
    if (id !== undefined) {
      this.seInv
        .Delete({
          id: id,
        } as DeleteWareHouseRequest)
        .subscribe({
          next: (d) => {
            if (d.succeeded && !!d.data) {
              const di = this.dbData.findIndex((x) => x.data.id === id);
              this.dbData.splice(di, 1);
              this.RefreshTable();
              this.toastrService.show(
                Constants.MSG_DELETE_SUCCESFUL,
                Constants.TITLE_INFO,
                Constants.TOASTR_SUCCESS
              );
            } else {
              this.toastrService.show(
                d.errors!.join('\n'),
                Constants.TITLE_ERROR,
                Constants.TOASTR_ERROR
              );
            }
          },
          error: (err) => this.cs.HandleError(err),
        });
    }
  }

  refreshFilter(event: any): void {
    this.searchString = event.target.value;
    console.log('Search: ', this.searchString);
    this.search();
  }

  search(): void {
    if (this.searchString.length === 0) {
      this.Refresh();
    } else {
      this.Refresh({ SearchString: this.searchString });
    }
  }

  private Setup(): void {
    this.dbData = [];

    this.dbDataDataSrc = this.dataSourceBuilder.create(this.dbData);

    this.dbDataTableForm = new FormGroup({
      id: new FormControl(undefined, []),
      warehouseCode: new FormControl(undefined, [Validators.required]),
      warehouseDescription: new FormControl(undefined, [
        Validators.required,
      ]),
    });

    this.dbDataTable = new FlatDesignNavigatableTable(
      this.dbDataTableForm,
      'WareHouse',
      this.dataSourceBuilder,
      this.kbS,
      this.fS,
      this.cdref,
      this.dbData,
      this.dbDataTableId,
      AttachDirection.DOWN,
      'sideBarForm',
      AttachDirection.RIGHT,
      this.sidebarService,
      this.sidebarFormService,
      this,
      () => {
        return BlankWareHouse();
      }
    );
    this.dbDataTable.PushFooterCommandList();
    this.dbDataTable.OuterJump = true;
    this.dbDataTable.NewPageSelected.subscribe({
      next: (newPageNumber: number) => {
        this.Refresh({ PageNumber: newPageNumber + '' });
      },
    });

    this.sidebarService.collapse();

    this.Refresh();
  }

  private Refresh(params?: GetWareHousesParamListModel): void {
    console.log('Refreshing'); // TODO: only for debug
    this.isLoading = true;
    this.seInv.GetAll(params).subscribe({
      next: (d) => {
        if (d.succeeded && !!d.data) {
          console.log('GetWareHouses response: ', d); // TODO: only for debug
          if (!!d) {
            this.dbData = d.data.map((x) => {
              return { data: x, uid: this.nextUid() };
            });
            this.dbDataDataSrc.setData(this.dbData);
            this.dbDataTable.currentPage = d.pageNumber;
          }
          this.RefreshTable();
        } else {
          this.toastrService.show(
            d.errors!.join('\n'),
            Constants.TITLE_ERROR,
            Constants.TOASTR_ERROR
          );
        }
      },
      error: (err) => this.cs.HandleError(err),
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  private RefreshTable(): void {
    this.dbDataTable.Setup(
      this.dbData,
      this.dbDataDataSrc,
      this.allColumns,
      this.colDefs,
      this.colsToIgnore
    );
    setTimeout(() => {
      this.dbDataTable.GenerateAndSetNavMatrices(false);
      // this.kbS.InsertNavigatable(this.dbDataTable, AttachDirection.UP, this.searchInputNavigatable);
      this.kbS.SelectFirstTile();
    }, 200);
  }

  ngOnInit(): void {
    this.fS.pushCommands(this.commands);
  }
  ngAfterViewInit(): void {
    this.kbS.setEditMode(KeyboardModes.NAVIGATION);

    this.dbDataTable.GenerateAndSetNavMatrices(true);
    this.dbDataTable.PushFooterCommandList();

    this.kbS.SelectFirstTile();
  }
  ngOnDestroy(): void {
    console.log('Detach');
    this.kbS.Detach();
  }
}