import { Injectable } from '@angular/core';
import * as $ from 'jquery'
import { Navigatable as Nav } from 'src/assets/model/Navigatable';

interface MatrixCoordinate {
  x: number;
  y: number;
}

export enum KeyboardModes {
  NAVIGATION, EDIT
}

@Injectable({
  providedIn: 'root'
})
export class KeyboardNavigationService {
  /** Current position in the matrix of CurrentNavigatable */
  p = { x: 0, y: 0 } as MatrixCoordinate;

  /** Active submap key, if there is a focused submap tile. */
  activeSubKey: string = "";

  private Root: Nav.INavigatable = Nav.NullNavigatable.Instance;
  private CurrentNavigatable: Nav.INavigatable = Nav.NullNavigatable.Instance;
  private CacheDuringDialog?: Nav.INavigatable;

  private _currentKeyboardMode: KeyboardModes = KeyboardModes.NAVIGATION;
  get currentKeyboardMode() {
    return this._currentKeyboardMode;
  }
  get isEditModeActivated() {
    return this._currentKeyboardMode === KeyboardModes.EDIT;
  }

  get AroundHere(): string[][] {
    return this.CurrentNavigatable.Matrix;
  }

  get Here(): string {
    return this.CurrentNavigatable.Matrix[this.p.y][this.p.x];
  }

  private get maxCurrentWorldX() {
    return this.CurrentNavigatable.Matrix[this.p.y].length - 1;
  }
  private get maxCurrentWorldY() {
    return this.CurrentNavigatable.Matrix.length - 1;
  }
  private get isCurrentLevelPosOutOfBounds() {
    return this.p.x <= this.maxCurrentWorldX && this.p.y <= this.maxCurrentWorldY && this.p.x > -1 && this.p.y > -1;
  }

  constructor() { }

  toggleEdit(): void {
    this._currentKeyboardMode = this._currentKeyboardMode == KeyboardModes.EDIT ? KeyboardModes.NAVIGATION : KeyboardModes.EDIT;
  }

  setEditMode(mode: KeyboardModes): void {
    this._currentKeyboardMode = mode;
  }

  public SelectElement(id: string): void {
    $('#' + id).trigger('focus');
  }

  public ClickElement(id: string): void {
    $('#' + id).trigger('click');
  }

  public SelectCurrentElement(): void {
    this.SelectElement(this.Here)
  }

  public ClickCurrentElement(): void {
    this.ClickElement(this.Here)
  }

  public SelectFirstTile(): void {
    this.p.x = 0;
    this.p.y = 0;
    this.SelectCurrentElement();
  }

  public MoveLeft(select: boolean = true, altKey: boolean = false): void {
    // At left bound
    if (this.p.x === 0) {
      if (this.CurrentNavigatable.OuterJump && !!this.CurrentNavigatable.LeftNeighbour) {
        this.CurrentNavigatable = this.CurrentNavigatable.LeftNeighbour;
        this.p.y = 0;
        this.p.x = this.maxCurrentWorldX;
        this.SelectCurrentElement();
      } else {
        return;
      }
    // Not at left bound
    } else {
      this.p.x--;
      this.SelectCurrentElement();
    }
  }

  public MoveRight(select: boolean = true, altKey: boolean = false): void {
    // At right bound
    if (this.p.x === this.maxCurrentWorldX) {
      if (this.CurrentNavigatable.OuterJump && !!this.CurrentNavigatable.RightNeighbour) {
        this.CurrentNavigatable = this.CurrentNavigatable.RightNeighbour;
        this.p.y = 0;
        this.p.x = 0;
        this.SelectCurrentElement();
      } else {
        return;
      }
    // Not at right bound
    } else {
      this.p.x++;
      this.SelectCurrentElement();
    }
  }

  public MoveUp(select: boolean = true, altKey: boolean = false): void {

  }

  public MoveDown(select: boolean = true, altKey: boolean = false): void {

  }

  public SetRoot(n: Nav.INavigatable): void {
    this.Root = n;
    this.CurrentNavigatable = n;
  }

  public Attach(n: Nav.INavigatable, direction: Nav.AttachDirection): void {
    switch(direction) {
      case Nav.AttachDirection.DOWN: {
        if (!!!this.CurrentNavigatable.DownNeighbours) {
          this.CurrentNavigatable.DownNeighbours = [];
        }
        this.CurrentNavigatable.DownNeighbours.push(n);
        break;
      }
      case Nav.AttachDirection.UP: {
        if (!!!this.CurrentNavigatable.TopNeighbours) {
          this.CurrentNavigatable.TopNeighbours = [];
        }
        this.CurrentNavigatable.TopNeighbours.push(n);
        break;
      }
      case Nav.AttachDirection.LEFT: {
        this.CurrentNavigatable.LeftNeighbour = n;
        break;
      }
      case Nav.AttachDirection.RIGHT: {
        this.CurrentNavigatable.RightNeighbour = n;
        break;
      }
    }
    this.CurrentNavigatable = n;
  }

  public Detach(): void {
    if (this.CurrentNavigatable === this.Root) {
      return;
    }

    if (!!this.CurrentNavigatable.TopNeighbours && this.CurrentNavigatable.TopNeighbours.length > 0) {
      let temp = this.CurrentNavigatable.TopNeighbours[0];

      this.CurrentNavigatable.TopNeighbours = [];
      this.CurrentNavigatable.DownNeighbours = [];
      this.CurrentNavigatable.LeftNeighbour = undefined;
      this.CurrentNavigatable.RightNeighbour = undefined;

      this.CurrentNavigatable = temp;
    }
    else if (!!this.CurrentNavigatable.LeftNeighbour) {
      let temp = this.CurrentNavigatable.LeftNeighbour;

      this.CurrentNavigatable.TopNeighbours = [];
      this.CurrentNavigatable.DownNeighbours = [];
      this.CurrentNavigatable.LeftNeighbour = undefined;
      this.CurrentNavigatable.RightNeighbour = undefined;

      this.CurrentNavigatable = temp;
    }
    else if (!!this.CurrentNavigatable.RightNeighbour) {
      let temp = this.CurrentNavigatable.RightNeighbour;

      this.CurrentNavigatable.TopNeighbours = [];
      this.CurrentNavigatable.DownNeighbours = [];
      this.CurrentNavigatable.LeftNeighbour = undefined;
      this.CurrentNavigatable.RightNeighbour = undefined;

      this.CurrentNavigatable = temp;
    }
    else if (!!this.CurrentNavigatable.DownNeighbours && this.CurrentNavigatable.DownNeighbours.length > 0) {
      let temp = this.CurrentNavigatable.DownNeighbours[0];

      this.CurrentNavigatable.TopNeighbours = [];
      this.CurrentNavigatable.DownNeighbours = [];
      this.CurrentNavigatable.LeftNeighbour = undefined;
      this.CurrentNavigatable.RightNeighbour = undefined;

      this.CurrentNavigatable = temp;
    } else {
      this.CurrentNavigatable = this.Root;
    }
  }

  public SetActiveDialog(n: Nav.INavigatable): void {
    this.CurrentNavigatable.LastX = this.p.x;
    this.CurrentNavigatable.LastY = this.p.y;

    this.CacheDuringDialog = this.CurrentNavigatable;

    this.CurrentNavigatable = n;
  }

  public RemoveActiveDialog(): void {
    this.CurrentNavigatable = this.CacheDuringDialog ?? this.Root;
    
    this.p.x = this.CurrentNavigatable.LastX!;
    this.p.y = this.CurrentNavigatable.LastY!;

    this.CacheDuringDialog = undefined;
  }

}
