import { Component, OnInit } from '@angular/core';
import { PreferredSelectionMethod } from 'src/app/services/keyboard-navigation.service';
import { INavigatable } from 'src/assets/model/navigation/Nav';

@Component({
  selector: 'app-base-navigatable-component',
  templateUrl: './base-navigatable-component.component.html',
  styleUrls: ['./base-navigatable-component.component.scss']
})
export class BaseNavigatableComponentComponent implements OnInit, INavigatable {
  private _Matrix: string[][] = [[]];
  public get Matrix(): string[][] {
    return this._Matrix;
  }
  public set Matrix(value: string[][]) {
    this._Matrix = value;
  }

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

  protected SelectFirstChar(className: string): void {
    const _input = document.getElementsByClassName(className)[0] as HTMLInputElement;
    if (!!_input && _input.type === "text") {
      window.setTimeout(function () {
        const txtVal = $('.' + className)[0].innerText;
        if (!!txtVal) {
          const l = txtVal.split('.')[0].length;
          _input.setSelectionRange(0, l);
        } else {
          _input.setSelectionRange(0, 1);
        }
      }, 0);
    }
  }
  
  Attach(): void {}
  Detach(): void {}
}