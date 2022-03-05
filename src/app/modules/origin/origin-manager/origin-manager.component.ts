import { ChangeDetectorRef, Component, OnInit, Optional, ViewChild } from '@angular/core';
import { ModelFieldDescriptor } from 'src/assets/model/ModelFieldDescriptor';
import { NbDialogService, NbTable, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { FooterService } from 'src/app/services/footer.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SideBarFormService } from 'src/app/services/side-bar-form.service';
import { IUpdateRequest } from 'src/assets/model/UpdaterInterfaces';
import { Constants } from 'src/assets/util/Constants';
import { CommonService } from 'src/app/services/common.service';
import { BbxSidebarService } from 'src/app/services/bbx-sidebar.service';
import { AttachDirection, FlatDesignNavigatableTable, TileCssClass } from 'src/assets/model/navigation/Nav';
import { DeleteOriginRequest } from '../models/DeleteOriginRequest';
import { GetOriginsParamListModel } from '../models/GetOriginsParamListModel';
import { BlankOrigin, Origin } from '../models/Origin';
import { OriginService } from '../services/origin.service';
import { BaseManagerComponent } from '../../shared/base-manager/base-manager.component';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';

@Component({
  selector: 'app-origin-manager',
  templateUrl: './origin-manager.component.html',
  styleUrls: ['./origin-manager.component.scss'],
})
export class OriginManagerComponent
  extends BaseManagerComponent<Origin>
  implements OnInit
{
  @ViewChild('table') table?: NbTable<any>;

  dbDataTableId = 'origin-table';
  dbDataTableEditId = 'user-cell-edit-input';

  colsToIgnore: string[] = [];
  allColumns = ['id', 'originCode', 'originDescription'];
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
      objectKey: 'originCode',
      colKey: 'originCode',
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
      objectKey: 'originDescription',
      colKey: 'originDescription',
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
    private dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<Origin>>,
    private seInv: OriginService,
    private cdref: ChangeDetectorRef,
    kbS: KeyboardNavigationService,
    private toastrService: BbxToastrService,
    sidebarService: BbxSidebarService,
    private sidebarFormService: SideBarFormService,
    private cs: CommonService
  ) {
    super(dialogService, kbS, fS, sidebarService);
    this.searchInputId = 'active-prod-search';
    this.kbS.ResetToRoot();
    this.Setup();
  }

  override ProcessActionNew(data?: IUpdateRequest<Origin>): void {
    console.log('ActionNew: ', data?.data);
    if (!!data && !!data.data) {
      this.seInv.Create(data.data).subscribe({
        next: (d) => {
          if (d.succeeded && !!d.data) {
            const newRow = { data: d.data } as TreeGridNode<Origin>;
            this.dbData.push(newRow);
            this.dbDataTable.SetDataForForm(newRow, false, false);
            this.RefreshTable();
            this.toastrService.show(
              Constants.MSG_SAVE_SUCCESFUL,
              Constants.TITLE_INFO,
              Constants.TOASTR_SUCCESS
            );
            this.dbDataTable.flatDesignForm.SetFormStateToDefault();
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

  override ProcessActionPut(data?: IUpdateRequest<Origin>): void {
    console.log('ActionPut: ', data?.data, JSON.stringify(data?.data));
    if (!!data && !!data.data) {
      this.seInv.Update(data.data).subscribe({
        next: (d) => {
          if (d.succeeded && !!d.data) {
            const newRow = {
              data: d.data,
            } as TreeGridNode<Origin>
            this.dbData[data.rowIndex] = newRow;
            this.dbDataTable.SetDataForForm(newRow, false, false);
            this.RefreshTable();
            this.toastrService.show(
              Constants.MSG_SAVE_SUCCESFUL,
              Constants.TITLE_INFO,
              Constants.TOASTR_SUCCESS
            );
            this.dbDataTable.flatDesignForm.SetFormStateToDefault();
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

  override ProcessActionDelete(data?: IUpdateRequest<Origin>): void {
    const id = data?.data?.id;
    console.log('ActionDelete: ', id);
    if (id !== undefined) {
      this.seInv
        .Delete({
          id: id,
        } as DeleteOriginRequest)
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
              this.dbDataTable.flatDesignForm.SetFormStateToDefault();
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
      originCode: new FormControl(undefined, [Validators.required]),
      originDescription: new FormControl(undefined, [Validators.required]),
    });

    this.dbDataTable = new FlatDesignNavigatableTable(
      this.dbDataTableForm,
      'Origin',
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
        return BlankOrigin();
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

  private Refresh(params?: GetOriginsParamListModel): void {
    console.log('Refreshing'); // TODO: only for debug
    this.isLoading = true;
    this.seInv.GetAll(params).subscribe({
      next: (d) => {
        if (d.succeeded && !!d.data) {
          console.log('GetOrigins response: ', d); // TODO: only for debug
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
