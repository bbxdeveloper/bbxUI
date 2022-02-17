import { Component, Input, OnInit } from '@angular/core';
import { SimplePaginator } from 'src/assets/model/SimplePaginator';

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

}
