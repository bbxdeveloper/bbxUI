import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-function-row',
  templateUrl: './function-row.component.html',
  styleUrls: ['./function-row.component.scss']
})
export class FunctionRowComponent {
  @Input()
  public keys: string[][] = []

  constructor() { }
}
