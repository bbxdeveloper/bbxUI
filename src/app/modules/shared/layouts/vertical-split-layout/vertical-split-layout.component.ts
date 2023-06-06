import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-vertical-split-layout',
  templateUrl: './vertical-split-layout.component.html',
  styleUrls: ['./vertical-split-layout.component.scss']
})
export class VerticalSplitLayoutComponent implements OnInit {
  @Input() proportion: string = '30'
  @Input() hideDivider: boolean = false

  constructor() { }

  ngOnInit(): void {
  }

}
