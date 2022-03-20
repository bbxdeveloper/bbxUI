import { Component, HostListener, Input, OnInit } from '@angular/core';
import { SimplePaginator } from 'src/assets/model/SimplePaginator';
import { KeyBindings } from 'src/assets/util/KeyBindings';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss']
})
export class PaginatorComponent implements OnInit {
  @Input() paginator?: SimplePaginator;

  constructor() { }

  ngOnInit(): void {
  }

  @HostListener('window:keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case KeyBindings.pgUp: {
        this.paginator?.previousPage();
        break;
      }
      case KeyBindings.pgDown: {
        this.paginator?.nextPage();
        break;
      }
      case KeyBindings.home: {
        this.paginator?.firstPage();
        break;
      }
      case KeyBindings.end: {
        this.paginator?.lastPage();
        break;
      }
      default: { }
    }
  }

  PageSizeSelected(newSize: number): void {
    this.paginator?.newPageSizeSelected();
  }

}
