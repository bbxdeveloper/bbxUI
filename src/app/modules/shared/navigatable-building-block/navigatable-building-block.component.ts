import { Component, Input, OnInit } from '@angular/core';
import { AttachDirection } from 'src/assets/model/navigation/Navigatable';

@Component({
  selector: 'app-navigatable-building-block',
  templateUrl: './navigatable-building-block.component.html',
  styleUrls: ['./navigatable-building-block.component.scss']
})
export class NavigatableBuildingBlockComponent {
  @Input() AttachDirection: string = ''
  @Input() FocusOnLoad: boolean = false

  get attachDirection(): AttachDirection {
    const ad = this.AttachDirection.toLowerCase()
    if (ad == 'up') {
      return AttachDirection.UP
    }
    if (ad == 'left') {
      return AttachDirection.LEFT
    }
    if (ad == 'right') {
      return AttachDirection.RIGHT
    }
    return AttachDirection.DOWN
  }

  constructor() { }
}
