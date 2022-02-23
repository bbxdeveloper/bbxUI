import { Component, OnInit } from '@angular/core';
import { PreferredSelectionMethod } from 'src/app/services/keyboard-navigation.service';
import { INavigatable } from 'src/assets/model/navigation/Nav';

@Component({
  selector: 'app-base-navigatable-component',
  templateUrl: './base-navigatable-component.component.html',
  styleUrls: ['./base-navigatable-component.component.scss']
})
export class BaseNavigatableComponentComponent implements OnInit, INavigatable {
  Matrix: string[][] = [[]];

  LastX?: number;
  LastY?: number;

  HasSubMapping: boolean = false;
  SubMapping?: { [id: string]: INavigatable; } | undefined;

  IsDialog: boolean = false;

  InnerJumpOnEnter: boolean = false;
  OuterJump: boolean = false;

  LeftNeighbour?: INavigatable | undefined;
  RightNeighbour?: INavigatable | undefined;
  DownNeighbour?: INavigatable | undefined;
  UpNeighbour?: INavigatable | undefined;

  TileSelectionMethod: PreferredSelectionMethod = PreferredSelectionMethod.focus;

  IsSubMapping: boolean = false;

  constructor() {}

  ngOnInit(): void {
  }

  public GenerateAndSetNavMatrices(attach: boolean): void {}

  public ClearNeighbours(): void {
    this.LeftNeighbour = undefined;
    this.RightNeighbour = undefined;
    this.DownNeighbour = undefined;
    this.UpNeighbour = undefined;
  }
  
  Attach(): void {}
  Detach(): void {}
}