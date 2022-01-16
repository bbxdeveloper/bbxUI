import { Injectable } from '@angular/core';
import * as $ from 'jquery'
import { Nav as Nav } from 'src/assets/model/Navigatable';
import { environment } from 'src/environments/environment';

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

  private LogMoveStats(
    attemptedDirection: Nav.AttachDirection,
    select: boolean = true, altKey: boolean = false,
    canJumpToNeighbourMatrix: boolean = false): void {
    if (environment.debug) {
      console.log("\n\n+---- NAV DATA ----+");
      console.log(`Time: ${Date.now().toLocaleString()}`);
      
      console.log(`Current X: ${this.p.x}`);
      console.log(`Current Y: ${this.p.y}`);

      console.log(`Current World Length: ${this.CurrentNavigatable.Matrix[0].length}`);
      console.log(`Current World Height: ${this.CurrentNavigatable.Matrix.length}`);
      
      console.log(`Current Max X: ${this.maxCurrentWorldX}`);
      console.log(`Current Max Y: ${this.maxCurrentWorldY}`);

      console.log(`[PARAM] Should select tile after moving: ${select}`);
      console.log(`[PARAM] Alt-key pressed: ${altKey}`);
      console.log(`[PARAM] Should jump to neighbour: ${canJumpToNeighbourMatrix}`);
      
      console.log(`Attempted direction: ${Nav.AttachDirection[attemptedDirection]}`);
      
      console.log(`Neighbour to DOWN: ${!!this.CurrentNavigatable.DownNeighbour ? 'detected' : 'none'}`);
      console.log(`Neighbour to LEFT: ${!!this.CurrentNavigatable.LeftNeighbour ? 'detected' : 'none'}`);
      console.log(`Neighbour to RIGHT: ${!!this.CurrentNavigatable.RightNeighbour ? 'detected' : 'none'}`);
      console.log(`Neighbour to UP: ${!!this.CurrentNavigatable.UpNeighbour ? 'detected' : 'none'}`);
      console.log("+------------------+\n\n");
    }
  }

  public MoveLeft(select: boolean = true, altKey: boolean = false, canJumpToNeighbourMatrix: boolean = true): boolean {
    this.LogMoveStats(Nav.AttachDirection.LEFT, select, altKey, canJumpToNeighbourMatrix);

    // At left bound
    if (this.p.x === 0) {
      if (canJumpToNeighbourMatrix && this.CurrentNavigatable.OuterJump && !!this.CurrentNavigatable.LeftNeighbour) {
        this.CurrentNavigatable = this.CurrentNavigatable.LeftNeighbour;
        this.p.y = 0;
        this.p.x = this.maxCurrentWorldX;
        this.SelectCurrentElement();
      } else {
        return false;
      }
    // Not at left bound
    } else {
      this.p.x--;
      this.SelectCurrentElement();
    }
    return true;
  }

  public MoveRight(select: boolean = true, altKey: boolean = false, canJumpToNeighbourMatrix: boolean = true): boolean {
    this.LogMoveStats(Nav.AttachDirection.RIGHT, select, altKey, canJumpToNeighbourMatrix);

    // At right bound
    if (this.p.x === this.maxCurrentWorldX) {
      if (canJumpToNeighbourMatrix && this.CurrentNavigatable.OuterJump && !!this.CurrentNavigatable.RightNeighbour) {
        this.CurrentNavigatable = this.CurrentNavigatable.RightNeighbour;
        this.p.y = 0;
        this.p.x = 0;
        this.SelectCurrentElement();
      } else {
        return false;
      }
    // Not at right bound
    } else {
      this.p.x++;
      this.SelectCurrentElement();
    }
    return true;
  }

  public MoveUp(select: boolean = true, altKey: boolean = false, canJumpToNeighbourMatrix: boolean = true): boolean {
    this.LogMoveStats(Nav.AttachDirection.UP, select, altKey, canJumpToNeighbourMatrix);

    // At upper bound
    if (this.p.y === 0) {
      if (canJumpToNeighbourMatrix && this.CurrentNavigatable.OuterJump && !!this.CurrentNavigatable.UpNeighbour) {
        this.CurrentNavigatable = this.CurrentNavigatable.UpNeighbour;
        this.p.y = this.maxCurrentWorldY;
        this.p.x = 0;
        this.SelectCurrentElement();
      } else {
        return false;
      }
      // Not at upper bound
    } else {
      this.p.y--;
      this.SelectCurrentElement();
    }
    return true;
  }

  public MoveDown(select: boolean = true, altKey: boolean = false, canJumpToNeighbourMatrix: boolean = true): boolean {
    this.LogMoveStats(Nav.AttachDirection.DOWN, select, altKey, canJumpToNeighbourMatrix);

    // At lower bound
    if (this.p.y === this.maxCurrentWorldY) {
      if (canJumpToNeighbourMatrix && this.CurrentNavigatable.OuterJump && !!this.CurrentNavigatable.DownNeighbour) {
        this.CurrentNavigatable = this.CurrentNavigatable.DownNeighbour;
        this.p.y = 0;
        this.p.x = 0;
        this.SelectCurrentElement();
      } else {
        return false;
      }
      // Not at lower bound
    } else {
      this.p.y++;
      this.SelectCurrentElement();
    }
    return true;
  }

  public SetRoot(n: Nav.INavigatable): void {
    this.Root = n;
    this.CurrentNavigatable = n;
  }

  public Attach(n: Nav.INavigatable, direction: Nav.AttachDirection): void {
    switch(direction) {
      case Nav.AttachDirection.DOWN: {
        this.CurrentNavigatable.DownNeighbour = n;
        n.UpNeighbour = this.CurrentNavigatable;
        break;
      }
      case Nav.AttachDirection.UP: {
        this.CurrentNavigatable.UpNeighbour = n;
        n.DownNeighbour = this.CurrentNavigatable;
        break;
      }
      case Nav.AttachDirection.LEFT: {
        this.CurrentNavigatable.LeftNeighbour = n;
        n.RightNeighbour = this.CurrentNavigatable;
        break;
      }
      case Nav.AttachDirection.RIGHT: {
        this.CurrentNavigatable.RightNeighbour = n;
        n.LeftNeighbour = this.CurrentNavigatable;
        break;
      }
    }
    this.CurrentNavigatable = n;
  }

  public Detach(): void {
    if (this.CurrentNavigatable === this.Root) {
      return;
    }

    if (!!this.CurrentNavigatable.UpNeighbour) {
      let temp = this.CurrentNavigatable.UpNeighbour;
      this.CurrentNavigatable.ClearNeighbours();
      this.CurrentNavigatable = temp;
    }
    else if (!!this.CurrentNavigatable.LeftNeighbour) {
      let temp = this.CurrentNavigatable.LeftNeighbour;
      this.CurrentNavigatable.ClearNeighbours();
      this.CurrentNavigatable = temp;
    }
    else if (!!this.CurrentNavigatable.RightNeighbour) {
      let temp = this.CurrentNavigatable.RightNeighbour;
      this.CurrentNavigatable.ClearNeighbours();
      this.CurrentNavigatable = temp;
    }
    else if (!!this.CurrentNavigatable.DownNeighbour) {
      let temp = this.CurrentNavigatable.DownNeighbour;
      this.CurrentNavigatable.ClearNeighbours();
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
