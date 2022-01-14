import { Component, OnInit } from '@angular/core';
import { Navigatable } from 'src/assets/model/Navigatable';

@Component({
  selector: 'app-base-navigatable-component',
  templateUrl: './base-navigatable-component.component.html',
  styleUrls: ['./base-navigatable-component.component.scss']
})
export class BaseNavigatableComponentComponent implements OnInit, Navigatable.INavigatable {
  Matrix: string[][] = [[]];

  LastX?: number;
  LastY?: number;

  HasSubMapping: boolean = false;
  SubMapping?: { [id: string]: string[][]; } | undefined;

  IsDialog: boolean = false;

  InnerJumpOnEnter: boolean = false;
  OuterJump: boolean = false;

  LeftNeighbour?: Navigatable.INavigatable | undefined;
  RightNeighbour?: Navigatable.INavigatable | undefined;
  DownNeighbour?: Navigatable.INavigatable | undefined;
  UpNeighbour?: Navigatable.INavigatable | undefined;

  constructor() { }

  ngOnInit(): void {
  }

  public GenerateAndSetNavMatrices(): void { }

  public ClearNeighbours(): void {
    this.LeftNeighbour = undefined;
    this.RightNeighbour = undefined;
    this.DownNeighbour = undefined;
    this.UpNeighbour = undefined;
  }
}