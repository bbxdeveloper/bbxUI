import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BbxSidebarService {

  private isSideBarOpened: boolean = false;

  get sideBarOpened(): boolean { return this.isSideBarOpened; };
  set sideBarOpened(state: boolean) {
    this.isSideBarOpened = state;
    if (!this.isSideBarOpened) {
      this.collapseEvent.next({});
    }
  };

  collapseEvent: BehaviorSubject<any> = new BehaviorSubject<any>({});

  constructor() { }

  toggle(): void {
    this.isSideBarOpened = !this.isSideBarOpened;
    if (!this.isSideBarOpened) {
      this.collapseEvent.next({});
    }
  }

  expand(): void {
    this.isSideBarOpened = true;
  }

  collapse(): void {
    this.isSideBarOpened = false;
    this.collapseEvent.next({});
  }

  onCollapse(): BehaviorSubject<any> {
    return this.collapseEvent;
  }
}
