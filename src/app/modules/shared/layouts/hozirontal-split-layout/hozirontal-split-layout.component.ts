import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-hozirontal-split-layout',
  templateUrl: './hozirontal-split-layout.component.html',
  styleUrls: ['./hozirontal-split-layout.component.scss']
})
export class HozirontalSplitLayoutComponent implements OnInit {
  @Input() proportion: string = '30'

  constructor() { }

  ngOnInit(): void {
  }

}
