import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { FilterData } from '../Models/FilterData';

@Component({
  selector: 'app-nav-sent-data',
  templateUrl: './nav-sent-data.component.html',
  styleUrls: ['./nav-sent-data.component.scss']
})
export class NavSentDataComponent implements OnInit, OnDestroy {

  public readonly searchChanged$ = new Subject<FilterData>()
  private readonly searchChangedSubscription = this.searchChanged$
    .subscribe((values: FilterData) => {
      console.log(values)
      debugger
    })

  constructor() { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.searchChangedSubscription.unsubscribe()
  }

}
