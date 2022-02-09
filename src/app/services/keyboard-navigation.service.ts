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

  private Root: Nav.INavigatable = Nav.NullNavigatable.Instance;
  private CurrentNavigatable: Nav.INavigatable = Nav.NullNavigatable.Instance;
  private CurrentSubMappingRootKey?: string;
  private NavigatableStack: Nav.INavigatable[] = [];

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
  get CurrentSubMapping(): { [id: string]: Nav.INavigatable; } | undefined {
    return this.CurrentNavigatable.SubMapping;
  }
  get LocalSubMapping(): Nav.INavigatable | undefined {
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
      
      console.log(`Current INavigatable: ${this.CurrentNavigatable.constructor.name}`);

      console.log(`Current X: ${this.p.x}`);
      console.log(`Current Y: ${this.p.y}`);

      console.log(`Current World Length: ${this.CurrentNavigatable.Matrix[0].length}`);
      console.log(`Current World Height: ${this.CurrentNavigatable.Matrix.length}`);
      
      console.log(`Current Max X: ${this.maxCurrentWorldX}`);
      console.log(`Current Max Y: ${this.maxCurrentWorldY}`);

      console.log(`[PARAM] Should select tile after moving: ${select}`);
      console.log(`[PARAM] Alt-key pressed: ${altKey}`);
      console.log(`[PARAM] Should jump to neighbour: ${canJumpToNeighbourMatrix}`);
      console.log(`[NAVIGATABLE] OuterJump: ${this.CurrentNavigatable.OuterJump}`);
      
      console.log(`Attempted direction: ${Nav.AttachDirection[attemptedDirection]}`);
      
      console.log(`Neighbour to DOWN: ${!!this.CurrentNavigatable.DownNeighbour ? 'detected' : 'none'}`);
      console.log(`Neighbour to LEFT: ${!!this.CurrentNavigatable.LeftNeighbour ? 'detected' : 'none'}`);
      console.log(`Neighbour to RIGHT: ${!!this.CurrentNavigatable.RightNeighbour ? 'detected' : 'none'}`);
      console.log(`Neighbour to UP: ${!!this.CurrentNavigatable.UpNeighbour ? 'detected' : 'none'}`);
      console.log("+------------------+\n\n");
    }
  }

  public Jump(direction: Nav.AttachDirection): MoveRes {
    const res = { moved: false, jumped: false } as MoveRes;

    switch(direction) {
      case Nav.AttachDirection.DOWN:
        if (!!this.CurrentNavigatable.DownNeighbour) {
          this.CurrentNavigatable = this.CurrentNavigatable.DownNeighbour;
          this.p.y = 0;
          this.p.x = 0;

          this.SelectCurrentElement();

          res.moved = true;
          res.jumped = true;
        }
        break;
      case Nav.AttachDirection.LEFT:
        if (!!this.CurrentNavigatable.LeftNeighbour) {
          this.CurrentNavigatable = this.CurrentNavigatable.LeftNeighbour;
          this.p.y = 0;
          this.p.x = 0;

          this.SelectCurrentElement();

          res.moved = true;
          res.jumped = true;
        }
        break;
      case Nav.AttachDirection.RIGHT:
        if (!!this.CurrentNavigatable.RightNeighbour) {
          this.CurrentNavigatable = this.CurrentNavigatable.RightNeighbour;
          this.p.y = 0;
          this.p.x = 0;

          this.SelectCurrentElement();

          res.moved = true;
          res.jumped = true;
        }
        break;
      default:
      case Nav.AttachDirection.UP:
        if (!!this.CurrentNavigatable.UpNeighbour) {
          this.CurrentNavigatable = this.CurrentNavigatable.UpNeighbour;
          this.p.y = 0;
          this.p.x = 0;

          this.SelectCurrentElement();

          res.moved = true;
          res.jumped = true;
        }
        break;
    }

    return res;
  }

  public MoveLeft(select: boolean = true, altKey: boolean = false, canJumpToNeighbourMatrix: boolean = true): MoveRes {
    this.LogMoveStats(Nav.AttachDirection.LEFT, select, altKey, canJumpToNeighbourMatrix);

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
    this.LogMoveStats(Nav.AttachDirection.RIGHT, select, altKey, canJumpToNeighbourMatrix);

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
    this.LogMoveStats(Nav.AttachDirection.UP, select, altKey, canJumpToNeighbourMatrix);

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
    this.LogMoveStats(Nav.AttachDirection.DOWN, select, altKey, canJumpToNeighbourMatrix);

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

  public SetRoot(n: Nav.INavigatable): void {
    this.Root = n;
    this.CurrentNavigatable = n;
  }

  public Attach(n: Nav.INavigatable, direction: Nav.AttachDirection, setAsCurrentNavigatable: boolean = true): void {
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

  public SetWidgetNavigatable(n: Nav.INavigatable): void {
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

}
