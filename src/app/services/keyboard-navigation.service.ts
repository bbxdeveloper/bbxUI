import { Injectable } from '@angular/core';
import * as $ from 'jquery'
import { AttachDirection, INavigatable, NullNavigatable } from 'src/assets/model/navigation/Nav';
import { environment } from 'src/environments/environment';

interface MatrixCoordinate {
  x: number;
  y: number;
}

export enum KeyboardModes {
  NAVIGATION, EDIT
}

export enum PreferredSelectionMethod {
  focus, click, both
}

export interface MoveRes {
  moved: boolean;
  jumped: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class KeyboardNavigationService {
  /** Current position in the matrix of CurrentNavigatable */
  p = { x: 0, y: 0 } as MatrixCoordinate;

  /** Active submap key, if there is a focused submap tile. */
  activeSubKey: string = "";

  private Root: INavigatable = NullNavigatable.Instance;
  private CurrentNavigatable: INavigatable = NullNavigatable.Instance;
  private CurrentSubMappingRootKey?: string;
  private NavigatableStack: INavigatable[] = [];

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
  get CurrentSubMapping(): { [id: string]: INavigatable; } | undefined {
    return this.CurrentNavigatable.SubMapping;
  }
  get LocalSubMapping(): INavigatable | undefined {
    return this.CurrentNavigatable.SubMapping![this.Here];
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
    this.LogSelectElement();
    switch (this.CurrentNavigatable.TileSelectionMethod) {
      case PreferredSelectionMethod.both:
        $('#' + id).trigger('focus');
        $('#' + id).trigger('click');
        break;
      case PreferredSelectionMethod.click:
        $('#' + id).trigger('click');
        break;
      case PreferredSelectionMethod.focus:
      default:
        $('#' + id).trigger('focus');
        break;
    }
  }

  /**
   * No jump, boundary or any safety check, so use it with caution!
   * @param x New X coordinate.
   * @param y New Y coordinate.
   */
  public SelectElementByCoordinate(x: number, y: number): void {
    this.p.x = x;
    this.p.y = y;
    this.SelectCurrentElement();
  }

  public SetPosition(x: number, y: number, n?: INavigatable): void {
    this.p.x = x;
    this.p.y = y;
    if (!!n && this.CurrentNavigatable !== n) {
      this.CurrentNavigatable = n;
    }
  }

  public SetPositionById(tileValue: string): boolean {
    for (let y = 0; y < this.CurrentNavigatable.Matrix.length; y++) {
      for (let x = 0; x < this.CurrentNavigatable.Matrix[y].length; x++) {
        if (this.CurrentNavigatable.Matrix[y][x] === tileValue) {
          this.SelectElementByCoordinate(x, y);
          return true;
        }
      }
    }
    return false;
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

  IsCurrentNavigatable(potentialNavigatable: INavigatable): boolean {
    return this.CurrentNavigatable.constructor.name === potentialNavigatable.constructor.name;
  }

  private LogGeneralStats(): void {
    if (!environment.debug) {
      return;
    }

    console.log(`Time: ${Date.now().toLocaleString()}`);
    console.log(`Current INavigatable: ${this.CurrentNavigatable.constructor.name}`);
  }

  private LogPositionStats(): void {
    if (!environment.debug) {
      return;
    }

    console.log(`Current X: ${this.p.x}`);
    console.log(`Current Y: ${this.p.y}`);

    console.log(`Current World Length: ${this.CurrentNavigatable.Matrix[0].length}`);
    console.log(`Current World Height: ${this.CurrentNavigatable.Matrix.length}`);

    console.log(`Current Max X: ${this.maxCurrentWorldX}`);
    console.log(`Current Max Y: ${this.maxCurrentWorldY}`);
  }

  private LogNeighbourStats(): void {
    if (!environment.debug) {
      return;
    }

    console.log(`Neighbour to DOWN: ${!!this.CurrentNavigatable.DownNeighbour ? 'detected' : 'none'}`);
    console.log(`Neighbour to LEFT: ${!!this.CurrentNavigatable.LeftNeighbour ? 'detected' : 'none'}`);
    console.log(`Neighbour to RIGHT: ${!!this.CurrentNavigatable.RightNeighbour ? 'detected' : 'none'}`);
    console.log(`Neighbour to UP: ${!!this.CurrentNavigatable.UpNeighbour ? 'detected' : 'none'}`);
  }

  public LogMatrix(): void {
    if (!environment.debug) {
      return;
    }

    console.log(`2D Navigation matrix:`)

    let matrixString = "";

    for (let y = 0; y < this.CurrentNavigatable.Matrix.length; y++) {
      for (let x = 0; x < this.CurrentNavigatable.Matrix[y].length; x++) {
        matrixString += this.CurrentNavigatable.Matrix[y][x];
      }
      matrixString += "\n";
    }

    console.log(matrixString);
  }

  private LogMoveStats(
    attemptedDirection: AttachDirection,
    select: boolean = true, altKey: boolean = false,
    canJumpToNeighbourMatrix: boolean = false): void {
    if (!environment.debug) {
      return;
    }

    console.log("\n\n+---- NAV DATA ----+");

    this.LogGeneralStats();

    this.LogPositionStats();

    console.log(`[PARAM] Should select tile after moving: ${select}`);
    console.log(`[PARAM] Alt-key pressed: ${altKey}`);
    console.log(`[PARAM] Should jump to neighbour: ${canJumpToNeighbourMatrix}`);
    console.log(`[NAVIGATABLE] OuterJump: ${this.CurrentNavigatable.OuterJump}`);
    
    console.log(`Attempted direction: ${AttachDirection[attemptedDirection]}`);
    
    this.LogNeighbourStats();

    console.log("+------------------+\n\n");
  }

  private LogNavAndMatrix(): void {
    if (!environment.debug) {
      return;
    }

    console.log("\n\n+--- NAV MATRIX ---+");

    this.LogGeneralStats();

    this.LogPositionStats();

    this.LogMatrix();

    console.log("+------------------+\n\n");
  }

  private LogSelectElement(): void {
    if (!environment.debug) {
      return;
    }

    console.log(`[SelectElement] X: ${this.p.x}, Y: ${this.p.y}, ID: ${this.Here}`);
  }

  /**
   * Tile selection is set with a 200ms delay.
   * Additional edit mode selection should be included with the parameters due to the delay.
   * @param direction 
   * @param setEdit 
   * @returns 
   */
  public Jump(direction: AttachDirection, setEdit: boolean = false): MoveRes {
    const res = { moved: false, jumped: false } as MoveRes;

    switch(direction) {
      case AttachDirection.DOWN:
        if (!!this.CurrentNavigatable.DownNeighbour) {
          this.CurrentNavigatable = this.CurrentNavigatable.DownNeighbour;

          this.p.y = 0;
          this.p.x = 0;

          res.moved = true;
          res.jumped = true;
        }
        break;
      case AttachDirection.LEFT:
        if (!!this.CurrentNavigatable.LeftNeighbour) {
          this.CurrentNavigatable = this.CurrentNavigatable.LeftNeighbour;

          this.p.y = 0;
          this.p.x = 0;

          res.moved = true;
          res.jumped = true;
        }
        break;
      case AttachDirection.RIGHT:
        if (!!this.CurrentNavigatable.RightNeighbour) {
          this.CurrentNavigatable = this.CurrentNavigatable.RightNeighbour;

          this.p.y = 0;
          this.p.x = 0;

          res.moved = true;
          res.jumped = true;
        }
        break;
      default:
      case AttachDirection.UP:
        if (!!this.CurrentNavigatable.UpNeighbour) {
          this.CurrentNavigatable = this.CurrentNavigatable.UpNeighbour;

          this.p.y = 0;
          this.p.x = 0;

          res.moved = true;
          res.jumped = true;
        }
        break;
    }

    setTimeout(() => {
      this.SelectCurrentElement();
      if (setEdit) {
        this.setEditMode(KeyboardModes.EDIT);
      }
    }, 200);

    this.LogNavAndMatrix();

    return res;
  }

  public MoveLeft(select: boolean = true, altKey: boolean = false, canJumpToNeighbourMatrix: boolean = true): MoveRes {
    this.LogMoveStats(AttachDirection.LEFT, select, altKey, canJumpToNeighbourMatrix);

    const res = { moved: false, jumped: false } as MoveRes;

    // At left bound
    if (this.p.x === 0) {
      if (canJumpToNeighbourMatrix && this.CurrentNavigatable.OuterJump && !!this.CurrentNavigatable.LeftNeighbour) {
        this.CurrentNavigatable = this.CurrentNavigatable.LeftNeighbour;
        this.p.y = 0;
        this.p.x = this.maxCurrentWorldX;

        if (select) {
          this.SelectCurrentElement();
        }

        res.moved = true;
        res.jumped = true;
      } else {
        return res;
      }
    // Not at left bound
    } else {
      this.p.x--;

      if (select) {
        this.SelectCurrentElement();
      }
      
      res.moved = true;
    }
    return res;
  }

  public MoveRight(select: boolean = true, altKey: boolean = false, canJumpToNeighbourMatrix: boolean = true): MoveRes {
    this.LogMoveStats(AttachDirection.RIGHT, select, altKey, canJumpToNeighbourMatrix);

    const res = { moved: false, jumped: false } as MoveRes;

    // At right bound
    if (this.p.x === this.maxCurrentWorldX) {
      if (canJumpToNeighbourMatrix && this.CurrentNavigatable.OuterJump && !!this.CurrentNavigatable.RightNeighbour) {
        this.CurrentNavigatable = this.CurrentNavigatable.RightNeighbour;
        this.p.y = 0;
        this.p.x = 0;

        if (select) {
          this.SelectCurrentElement();
        }

        res.moved = true;
        res.jumped = true;
      } else {
        return res;
      }
    // Not at right bound
    } else {
      this.p.x++;

      if (select) {
        this.SelectCurrentElement();
      }

      res.moved = true;
    }
    return res;
  }

  public MoveUp(select: boolean = true, altKey: boolean = false, canJumpToNeighbourMatrix: boolean = true): MoveRes {
    this.LogMoveStats(AttachDirection.UP, select, altKey, canJumpToNeighbourMatrix);

    const res = { moved: false, jumped: false } as MoveRes;

    // At upper bound
    if (this.p.y === 0) {
      if (this.CurrentNavigatable.IsSubMapping) {
        this.RemoveWidgetNavigatable();
        res.moved = true;
        res.jumped = true;
        this.SelectCurrentElement();
        this.CurrentSubMappingRootKey = undefined;
      }
      else if (canJumpToNeighbourMatrix && this.CurrentNavigatable.OuterJump && !!this.CurrentNavigatable.UpNeighbour) {
        this.CurrentNavigatable = this.CurrentNavigatable.UpNeighbour;
        this.p.y = this.maxCurrentWorldY;
        this.p.x = 0;

        if (select) {
          this.SelectCurrentElement();
        }

        res.moved = true;
        res.jumped = true;
      } else {
        return res;
      }
      // Not at upper bound
    } else {
      this.p.y--;

      if (select) {
        this.SelectCurrentElement();
      }

      res.moved = true;
    }
    return res;
  }

  public MoveDown(select: boolean = true, altKey: boolean = false, canJumpToNeighbourMatrix: boolean = true): MoveRes {
    this.LogMoveStats(AttachDirection.DOWN, select, altKey, canJumpToNeighbourMatrix);

    const res = { moved: false, jumped: false } as MoveRes;

    // At lower bound
    if (this.p.y === this.maxCurrentWorldY) {
      if (!!this.CurrentSubMapping && !!this.LocalSubMapping) {
        this.CurrentSubMappingRootKey = this.Here;
        this.SetWidgetNavigatable(this.LocalSubMapping);
        res.moved = true;
        res.jumped = true;
        this.SelectFirstTile();
      }
      else if (canJumpToNeighbourMatrix && this.CurrentNavigatable.OuterJump && !!this.CurrentNavigatable.DownNeighbour) {
        this.CurrentNavigatable = this.CurrentNavigatable.DownNeighbour;
        this.p.y = 0;
        this.p.x = 0;

        if (select) {
          this.SelectCurrentElement();
        }

        res.moved = true;
        res.jumped = true;
      } else {
        return res;
      }
      // Not at lower bound
    } else {
      this.p.y++;

      if (select) {
        this.SelectCurrentElement();
      }

      res.moved = true;
    }
    return res;
  }

  public SetRoot(n: INavigatable): void {
    this.Root = n;
    this.CurrentNavigatable = n;
  }

  public Attach(n: INavigatable, direction: AttachDirection, setAsCurrentNavigatable: boolean = true): void {
    switch(direction) {
      case AttachDirection.DOWN: {
        this.CurrentNavigatable.DownNeighbour = n;
        n.UpNeighbour = this.CurrentNavigatable;
        break;
      }
      case AttachDirection.UP: {
        this.CurrentNavigatable.UpNeighbour = n;
        n.DownNeighbour = this.CurrentNavigatable;
        break;
      }
      case AttachDirection.LEFT: {
        this.CurrentNavigatable.LeftNeighbour = n;
        n.RightNeighbour = this.CurrentNavigatable;
        break;
      }
      case AttachDirection.RIGHT: {
        this.CurrentNavigatable.RightNeighbour = n;
        n.LeftNeighbour = this.CurrentNavigatable;
        break;
      }
    }
    if (setAsCurrentNavigatable) {
      this.CurrentNavigatable = n;
      this.SelectFirstTile();
    }
  }

  public ResetToRoot(): void {
    this.CurrentNavigatable = this.Root;
  }

  /**
   * 
   * @param newX New X coordinate after detach.
   * @param newY New Y coordinate after detach.
   * @returns 
   */
  public Detach(newX?: number, newY?: number): void {
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

    if (newX !== undefined && newY !== undefined) {
      this.p.x = newX;
      this.p.y = newY;
      this.SelectCurrentElement();
    }
  }

  public SetWidgetNavigatable(n: INavigatable): void {
    this.CurrentNavigatable.LastX = this.p.x;
    this.CurrentNavigatable.LastY = this.p.y;

    this.NavigatableStack.push(this.CurrentNavigatable);

    this.CurrentNavigatable = n;
  }

  public RemoveWidgetNavigatable(): void {
    this.CurrentNavigatable = this.NavigatableStack.pop() ?? this.Root;
    
    this.p.x = this.CurrentNavigatable.LastX!;
    this.p.y = this.CurrentNavigatable.LastY!;

    if (this.CurrentNavigatable.IsSubMapping) {
      // Trigger opening the submenu
      this.SelectElement(this.CurrentSubMappingRootKey!);
      // Wait for submenu to open then focus the correct menu
      setInterval(() => { this.SelectCurrentElement() }, 100);
    } else {
      this.SelectCurrentElement();
    }
  }

  public InsertNavigatable(center: INavigatable, direction: AttachDirection, toInsert: INavigatable): void {
    switch (direction) {
      case AttachDirection.DOWN: {
        if (!!center.DownNeighbour) {
          let temp = center.DownNeighbour;
          
          center.DownNeighbour = toInsert;
          toInsert.UpNeighbour = center;

          temp.UpNeighbour = toInsert;
          toInsert.DownNeighbour = temp;
        }
        break;
      }
      case AttachDirection.UP: {
        if (!!center.UpNeighbour) {
          let temp = center.UpNeighbour;

          center.UpNeighbour = toInsert;
          toInsert.DownNeighbour = center;

          temp.DownNeighbour = toInsert;
          toInsert.UpNeighbour = temp;
        }
        break;
      }
      case AttachDirection.LEFT: {
        if (!!center.LeftNeighbour) {
          let temp = center.LeftNeighbour;

          center.LeftNeighbour = toInsert;
          toInsert.RightNeighbour = center;

          temp.RightNeighbour = toInsert;
          toInsert.LeftNeighbour = temp;
        }
        break;
      }
      case AttachDirection.RIGHT: {
        if (!!center.RightNeighbour) {
          let temp = center.RightNeighbour;

          center.RightNeighbour = toInsert;
          toInsert.LeftNeighbour = center;

          temp.LeftNeighbour = toInsert;
          toInsert.RightNeighbour = temp;
        }
        break;
      }
    }
  }

}
