import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-head-line',
  templateUrl: './head-line.component.html',
  styleUrls: ['./head-line.component.scss']
})
export class HeadLineComponent {
  @Input() msg: string = ''
  @Input() compact: boolean = false
  constructor() { }
}
