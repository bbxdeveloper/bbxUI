import { AfterContentInit, AfterViewChecked, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { NbDialogRef, NbToastrService, NbTreeGridDataSourceBuilder } from '@nebular/theme';
import { lastValueFrom } from 'rxjs';
import { BbxToastrService } from 'src/app/services/bbx-toastr-service.service';
import { CommonService } from 'src/app/services/common.service';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';
import { AttachDirection } from 'src/assets/model/navigation/Navigatable';
import { SelectedCell } from 'src/assets/model/navigation/SelectedCell';
import { SimpleNavigatableTable } from 'src/assets/model/navigation/SimpleNavigatableTable';
import { TreeGridNode } from 'src/assets/model/TreeGridNode';
import { Constants } from 'src/assets/util/Constants';
import { HelperFunctions } from 'src/assets/util/HelperFunctions';
import { IsKeyFunctionKey, KeyBindings } from 'src/assets/util/KeyBindings';
import { Customer } from '../../customer/models/Customer';
import { GetCustomersParamListModel } from '../../customer/models/GetCustomersParamListModel';
import { CustomerService } from '../../customer/services/customer.service';
import { SelectTableDialogComponent } from '../../shared/dialogs/select-table-dialog/select-table-dialog.component';
import { ZipInfo } from '../../system/models/ZipInfo';
import { SystemService } from '../../system/services/system.service';
import { StatusService } from 'src/app/services/status.service';

const NavMap: string[][] = [
  ['active-prod-search', 'show-all', 'show-less']
];

@Component({
  selector: 'app-customer-select-table-dialog',
  templateUrl: './customer-select-table-dialog.component.html',
  styleUrls: ['./customer-select-table-dialog.component.scss']
})
export class CustomerSelectTableDialogComponent extends SelectTableDialogComponent<Customer>
  implements AfterContentInit, OnDestroy, OnInit, AfterViewChecked {

  public getInputParams(override?: Constants.Dct): GetCustomersParamListModel {
    return { SearchString: this.searchString ?? '', IsOwnData: false, PageSize: '10', PageNumber: '1', OrderBy: 'customerName' };
  }

  public getInputParamsForAll(override?: Constants.Dct): GetCustomersParamListModel {
    return { SearchString: this.searchString ?? '', IsOwnData: false, PageSize: '999999', OrderBy: 'customerName' };
  }

  isLoaded: boolean = false;
  override isLoading: boolean = false;

  constructor(
    private bbxToastrService: BbxToastrService,
    private simpleToastrService: NbToastrService,
    private cdref: ChangeDetectorRef,
    private cs: CommonService,
    dialogRef: NbDialogRef<SelectTableDialogComponent<Customer>>,
    kbS: KeyboardNavigationService,
    dataSourceBuilder: NbTreeGridDataSourceBuilder<TreeGridNode<Customer>>,
    private customerService: CustomerService,
    private systemService: SystemService,
    statusService: StatusService
  ) {
    super(dialogRef, kbS, dataSourceBuilder, statusService);

    this.Matrix = NavMap;

    this.dbDataTable = new SimpleNavigatableTable<Customer>(
      this.dataSourceBuilder, this.kbS, this.cdref, this.dbData, '', AttachDirection.DOWN, this
    );
    this.dbDataTable.InnerJumpOnEnter = true;
    this.dbDataTable.OuterJump = true;
  }

  override ngOnInit(): void {
    this.Refresh(this.getInputParams());
  }
  ngAfterContentInit(): void {
    this.kbS.SetWidgetNavigatable(this);
    this.kbS.SelectFirstTile();
  }
  ngAfterViewChecked(): void {
    if (!this.isLoaded) {
      $('#active-prod-search').val(this.searchString);
      this.isLoaded = true;
    }
    this.kbS.SelectCurrentElement();
  }
  ngOnDestroy(): void {
    if (!this.closedManually) {
      this.kbS.RemoveWidgetNavigatable();
    }
  }

  override refreshFilter(event: any): void {
    if ((event.key.length > 1 && event.key.toLowerCase() !== 'backspace') || event.ctrlKey || event.key == KeyBindings.F2 || IsKeyFunctionKey(event.key)) {
      return;
    }

    console.log("Search: ", event.target.value);

    if (this.searchString.length !== 0 && event.target.value.length === 0) {
      this.searchString = event.target.value;
      this.Refresh(this.getInputParams());
    } else {
      this.searchString = event.target.value;
      this.Search(this.searchString);
    }
  }

  override showAll(): void {
    this.Refresh(this.getInputParamsForAll());
  }

  override showLess(): void {
    this.kbS.SelectFirstTile();
    this.Refresh(this.getInputParams());
  }

  RefreshTable(): void {
    this.dbDataTable.Setup(
      this.dbData,
      this.dbDataSource,
      this.allColumns,
      this.colDefs,
      [],
      'TABLE-CELL'
    );
    setTimeout(() => {
      this.dbDataTable.GenerateAndSetNavMatrices(this.DownNeighbour === undefined, false);
    }, 200);
  }

  async GetZipInfo(zipOrCity: any, byZip: boolean = true): Promise<ZipInfo | undefined> {
    let info = undefined;
    if (byZip) {
      await lastValueFrom(this.systemService.CityByZip(zipOrCity))
        .then(res => {
          info = res;
        })
        .catch(err => {
          this.cs.HandleError(err);
        })
        .finally(() => {

        });
    } else {
      await lastValueFrom(this.systemService.ZipByCity(zipOrCity))
        .then(res => {
          info = res;
        })
        .catch(err => {
          this.cs.HandleError(err);
        })
        .finally(() => {

        });
    }
    return info;
  }

  override Refresh(params?: GetCustomersParamListModel): void {
    if (!!this.Subscription_Search && !this.Subscription_Search.closed) {
      this.Subscription_Search.unsubscribe();
    }

    console.log('Refreshing: ', params); // TODO: only for debug
    this.isLoading = true;
    
    this.Subscription_Search = this.customerService.GetAll(params).subscribe({
      next: async (d) => {
        if (d.succeeded && !!d.data) {
          console.log('GetCustomers response: ', d); // TODO: only for debug
          if (!!d) {
            for (let i = 0; i < d.data.length; i++) {
              let x = d.data[i];
              if (HelperFunctions.isEmptyOrSpaces(x.city) && !HelperFunctions.isEmptyOrSpaces(x.postalCode)) {
                let info = await this.GetZipInfo(x.postalCode);
                if (info) {
                  d.data![i].city = info.zipCity;
                }
              } else if (HelperFunctions.isEmptyOrSpaces(x.postalCode) && !HelperFunctions.isEmptyOrSpaces(x.city)) {
                let info = await this.GetZipInfo(x.city, false);
                if (info) {
                  d.data![i].postalCode = info.zipCode;
                }
              }
            }
            const tempData = d.data.map((x) => {
              return { data: x, uid: this.nextUid() };
            });
            this.dbData = tempData;
            this.dbDataSource.setData(this.dbData);
          }
          this.RefreshTable();
        } else {
          this.bbxToastrService.show(
            d.errors!.join('\n'),
            Constants.TITLE_ERROR,
            Constants.TOASTR_ERROR
          );
        }
        this.isLoading = false;
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

  override Search(searchString: string): void {
    this.Refresh(this.getInputParams());
  }

  HandleItemChoice(item: SelectedCell): void {

  }

}
