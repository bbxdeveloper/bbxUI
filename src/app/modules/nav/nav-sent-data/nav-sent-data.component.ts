import { Component, OnDestroy, OnInit } from '@angular/core';
import { EMPTY, Subject, catchError, switchMap, takeUntil } from 'rxjs';
import { FilterData } from '../Models/FilterData';
import { NavHttpService } from '../Services/nav-http.service';
import { CommonService } from 'src/app/services/common.service';
import { IQueryExchangeResponse } from '../Models/QueryExchangeResponse';
import { NavLine } from '../Models/NavLine';

@Component({
  selector: 'app-nav-sent-data',
  templateUrl: './nav-sent-data.component.html',
  styleUrls: ['./nav-sent-data.component.scss']
})
export class NavSentDataComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject()

  public readonly searchChanged$ = new Subject<FilterData>()

  private readonly searchChangedSubscription = this.searchChanged$
    .pipe(
      switchMap((filterData: FilterData) => this.navService.exchange(filterData)
        .pipe(
          takeUntil(this.destroy$),
          catchError(error => {
            this.commonService.HandleError(error)
            return EMPTY
          })
        )
      )
    )
    .subscribe((response: IQueryExchangeResponse) => {
      if (response.data === undefined || response.data === null) {
        return
      }

      const navLines = response.data.map(NavLine.create)
    })

  constructor(
    private readonly navService: NavHttpService,
    private readonly commonService: CommonService,
  ) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.searchChangedSubscription.unsubscribe()
    this.destroy$.unsubscribe()
  }

}
