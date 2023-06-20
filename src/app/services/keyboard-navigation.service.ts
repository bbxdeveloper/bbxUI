import { ChangeDetectorRef, Injectable } from '@angular/core';
import * as $ from 'jquery'
import { BehaviorSubject } from 'rxjs';
import { AttachDirection, INavigatable, NullNavigatable } from 'src/assets/model/navigation/Nav';
import { JumpDestination } from 'src/assets/model/navigation/Navigatable';
import { environment } from 'src/environments/environment';
import { LoggerService } from './logger.service';

interface MatrixCoordinate {
  x: number;
  y: number;
}

export enum KeyboardModes {
  NAVIGATION, EDIT, NAVIGATION_EDIT
}

export enum PreferredSelectionMethod {
  focus, click, both
}

export interface MoveRes {
  moved: boolean;
  jumped: boolean;
}

export enum JumpPosPriority {
  first, same, last
}

export const SELECTED_ELEMENT_CLASS = 'current-keyboard-nav-selected';
export const PARENT_OF_SELECTED_ELEMENT_CLASS = 'parent-of-current-keyboard-nav-selected';

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
  private WidgetStack: INavigatable[] = [];

  private _currentKeyboardMode: KeyboardModes = KeyboardModes.NAVIGATION;
  set currentKeyboardMode(mode: KeyboardModes) {
    this._currentKeyboardMode = mode
  }
  get currentKeyboardMode() {
    return this._currentKeyboardMode;
  }
  get isEditModeActivated() {
    return this.currentKeyboardMode === KeyboardModes.EDIT;
  }

  ElementIdSelected: BehaviorSubject<string> = new BehaviorSubject<string>('');
  NavigatableChanged: BehaviorSubject<string> = new BehaviorSubject<string>('');

  isEditModeLocked: boolean = false;

  get GetCurrentNavigatable(): INavigatable | undefined {
    return this.CurrentNavigatable;
  }

  get AroundHere(): string[][] {
    return this.CurrentNavigatable.Matrix;
  }
  get Here(): string {
    const tmp = this.CurrentNavigatable.Matrix[this.p.y][this.p.x];
    if (tmp === undefined) {
      this.p.x = 0;
      this.p.y = 0;
    }
    return tmp;
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

  private previousIdString?: string = undefined;

  private _locked = false;

  get TypeOfSelectedElement(): string {
    if (this.Here === undefined) {
      return '';
    }

    return ($('#' + this.Here).get(0)?.tagName ?? '').toLowerCase();
  }

  constructor(private loggerService: LoggerService) { }

  public clear(): void {
    this.ResetToRoot();
    this.CurrentNavigatable.ClearNeighbours();
    this.SelectFirstTile();
  }

  public Lock(): void {
    this._locked = true;
  }

  public Unlock(): void {
    this._locked = false;
  }

  public IsLocked(): boolean {
    return this._locked;
  }

  toggleEdit(): void {
    if (this.isEditModeLocked) {
      return;
    }
    this.currentKeyboardMode = this.currentKeyboardMode == KeyboardModes.EDIT ? KeyboardModes.NAVIGATION : KeyboardModes.EDIT;
  }

  setEditMode(mode: KeyboardModes): void {
    if (this.isEditModeLocked) {
      return;
    }
    this.currentKeyboardMode = mode;
  }

  public IsElementCheckbox(id: string = ""): boolean {
    if (id.length == 0) {
      id = this.Here;
    }
    const source = $('#' + id);
    console.log(`id: ${id}, result: ${source.is(':checkbox')}`);
    return source.is(':checkbox');
  }

  public IsInnerInputCheckbox(id: string = ""): boolean {
    if (id.length == 0) {
      id = this.Here;
    }
    const source = $('#' + id).find('input').first();
    if (!!!source) {
      return false;
    }
    console.log(`id: ${id}, result: ${source.is(':checkbox') }`);
    return source.is(':checkbox');
  }

  public BalanceCheckboxAfterShiftEnter(id: string): void {
    const source = $('#' + id);
    if (source.is(':checkbox')) {
      source.prop("checked", !source.prop("checked"));
    } else {
      for (let i = 0; i < this.CurrentNavigatable.Matrix.length; ++i) {
        const elementIndex = this.CurrentNavigatable.Matrix[i].findIndex(x => x === id);
        if (elementIndex !== -1 && i > 0) {
          const targetId = this.CurrentNavigatable.Matrix[i - 1][elementIndex];
          const source = $('#' + targetId);
          if (source.is(':checkbox')) {
            source.prop("checked", !source.prop("checked"));
          }
          break;
        }
      }
    }
  }

  public SelectElement(id: string): void {
    this.LogSelectElement();

    if (this._locked) {
      return;
    }

    const idString = '#' + id;

    if (environment.navigationSelectLog)
      console.log('SelectElement: ', this.previousIdString, id, $(idString));

    $('.' + SELECTED_ELEMENT_CLASS).map(this.removeSelectedElementClass.bind(this));

    const element = $(idString)
    element.addClass(SELECTED_ELEMENT_CLASS);
    element.parent().addClass(PARENT_OF_SELECTED_ELEMENT_CLASS);

    if (element.is(':button') || element.is(':radio')) {
      console.log("focus");
      element.trigger('focus');
    } else {
      switch (this.CurrentNavigatable.TileSelectionMethod) {
        case PreferredSelectionMethod.both:
          element.trigger('focus');
          element.trigger('click');
          break;
        case PreferredSelectionMethod.click:
          element.trigger('click');
          break;
        case PreferredSelectionMethod.focus:
        default:
          element.trigger('focus');
          break;
      }
    }

    this.ElementIdSelected.next(id);
  }

  public RemoveSelectedElementClasses(): void {
    $('.' + SELECTED_ELEMENT_CLASS).map(this.removeSelectedElementClass.bind(this));
  }

  private removeSelectedElementClass(idx: number, selectedElement: HTMLElement): void {
    const element = $(selectedElement)
    element.removeClass(SELECTED_ELEMENT_CLASS);
    element.parent().removeClass(PARENT_OF_SELECTED_ELEMENT_CLASS);
  }

  public ClickElement(id: string, excludeButtons: boolean = false): void {
    if (this._locked) {
      return;
    }

    const idString = '#' + id;

    if (environment.navigationSelectLog)
      console.log('ClickElement: ', this.previousIdString, id);

    $('.' + SELECTED_ELEMENT_CLASS).map(this.removeSelectedElementClass.bind(this));

    const element = $(idString)
    element.addClass(SELECTED_ELEMENT_CLASS);
    element.parent().addClass(PARENT_OF_SELECTED_ELEMENT_CLASS);

    if (excludeButtons && element.is(':button')) {
      element.trigger('focus');
    }
    else if (element.is(':radio')) {
      element.trigger('focus');
    }
    else if (element.is(':checkbox')) {
      element.trigger('focus');
    } else {
      element.trigger('click');
    }

    this.ElementIdSelected.next(id);
  }

  /**
   * No jump, boundary or any safety check, so use it with caution!
   * @param x New X coordinate.
   * @param y New Y coordinate.
   */
  public SelectElementByCoordinate(x: number, y: number): void {
    if (this._locked) {
      return;
    }

    this.p.x = x;
    this.p.y = y;
    this.SelectCurrentElement();
  }

  public SetPosition(x: number, y: number, n?: INavigatable): void {
    if (this._locked) {
      return;
    }

    this.p.x = x;
    this.p.y = y;
    if (!!n && this.CurrentNavigatable !== n) {
      this.SetCurrentNavigatable(n);
    }
    this.SelectCurrentElement();
  }

  public SetPositionById(tileValue: string): boolean {
    if (this._locked) {
      return false;
    }

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

  public SelectCurrentElement(): void {
    this.SelectElement(this.Here)
  }

  public ClickCurrentElement(excludeButtons: boolean = false): void {
    this.ClickElement(this.Here, excludeButtons)
  }

  public SelectFirstTile(): void {
    if (this._locked) {
      return;
    }

    if (this.CurrentNavigatable.AlwaysFirstX !== undefined && this.CurrentNavigatable.AlwaysFirstY !== undefined) {
      this.p.x = this.CurrentNavigatable.AlwaysFirstX;
      this.p.y = this.CurrentNavigatable.AlwaysFirstY;
    } else {
      this.p.x = 0;
      this.p.y = 0;
    }

    this.SelectCurrentElement();
  }

  IsCurrentNavigatable(potentialNavigatable: INavigatable): boolean {
    return this.CurrentNavigatable.constructor.name === potentialNavigatable.constructor.name;
  }

  IsCurrentNavigatableTable(): boolean {
    return this.CurrentNavigatable.constructor.name.endsWith("Table")
  }

  IsCurrentNavigatableForm(): boolean {
    return this.CurrentNavigatable.constructor.name.endsWith("Form")
  }

  MoveCursorBeforeFirstChar(): void {
    // const idString = '#' + this.Here;
    const _input = document.getElementById(this.Here) as HTMLInputElement;
    if (!!_input && _input.type === "text") {
      window.setTimeout(function () {
        const tempVal = _input.value;
        _input.value = 'cursor';
        _input.setSelectionRange(0, 0);
        _input.value = tempVal;
        // const txtVal = ((row.data as any)[col] as string);
        // console.log('txtVal: ', txtVal);
        // if (!!txtVal) {
        //   _input.setSelectionRange(txtVal.length, txtVal.length);
        // } else {
        //   //
        // }
      }, 0);
    }
  }

  private LogGeneralStats(): void {
    if (!environment.navigationMiscLog) {
      return;
    }

    console.log(`Time: ${Date.now().toLocaleString()}`);
    console.log(`Current INavigatable: ${this.CurrentNavigatable.constructor.name}`);
  }

  private LogPositionStats(): void {
    if (!environment.navigationPositionLog) {
      return;
    }

    console.log(`Current X: ${this.p.x}`);
    console.log(`Current Y: ${this.p.y}`);

    console.log(`Current World Length: ${this.CurrentNavigatable.Matrix[0].length}`);
    console.log(`Current World Height: ${this.CurrentNavigatable.Matrix.length}`);

    console.log(`Current Max X: ${this.maxCurrentWorldX}`);
    console.log(`Current Max Y: ${this.maxCurrentWorldY}`);

    this.LogMatrix();
  }

  private LogNeighbourStats(): void {
    if (!environment.navigationMoveLog) {
      return;
    }

    console.log(`Neighbour to DOWN: ${!!this.CurrentNavigatable.DownNeighbour ? 'detected' : 'none'}`);
    console.log(`Neighbour to LEFT: ${!!this.CurrentNavigatable.LeftNeighbour ? 'detected' : 'none'}`);
    console.log(`Neighbour to RIGHT: ${!!this.CurrentNavigatable.RightNeighbour ? 'detected' : 'none'}`);
    console.log(`Neighbour to UP: ${!!this.CurrentNavigatable.UpNeighbour ? 'detected' : 'none'}`);
  }

  public LogMatrix(): void {
    if (!environment.navigationMatrixLog) {
      return;
    }

    console.log(`2D Navigation matrix:`)

    let matrixString = "";

    for (let y = 0; y < this.CurrentNavigatable.Matrix.length; y++) {
      for (let x = 0; x < this.CurrentNavigatable.Matrix[y].length; x++) {
        matrixString += this.CurrentNavigatable.Matrix[y][x] + '   ';
      }
      matrixString += "\n";
    }

    console.log(matrixString);
  }

  private LogMoveStats(
    attemptedDirection: AttachDirection,
    select: boolean = true, altKey: boolean = false,
    canJumpToNeighbourMatrix: boolean = false): void {
    if (!environment.navigationMoveLog) {
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
    if (!environment.navigationMatrixLog) {
      return;
    }

    console.log("\n\n+--- NAV MATRIX ---+");

    this.LogGeneralStats();

    this.LogPositionStats();

    this.LogMatrix();

    console.log("+------------------+\n\n");
  }

  private LogSelectElement(): void {
    if (!environment.navigationSelectLog) {
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

    switch (direction) {
      case AttachDirection.DOWN:
        if (!!this.CurrentNavigatable.DownNeighbour) {
          this.SetCurrentNavigatable(this.CurrentNavigatable.DownNeighbour);

          this.p.y = 0;
          this.p.x = 0;

          res.moved = true;
          res.jumped = true;
        }
        break;
      case AttachDirection.LEFT:
        if (!!this.CurrentNavigatable.LeftNeighbour) {
          this.SetCurrentNavigatable(this.CurrentNavigatable.LeftNeighbour);

          this.p.y = 0;
          this.p.x = 0;

          res.moved = true;
          res.jumped = true;
        }
        break;
      case AttachDirection.RIGHT:
        if (!!this.CurrentNavigatable.RightNeighbour) {
          this.SetCurrentNavigatable(this.CurrentNavigatable.RightNeighbour);

          this.p.y = 0;
          this.p.x = 0;

          res.moved = true;
          res.jumped = true;
        }
        break;
      default:
      case AttachDirection.UP:
        if (!!this.CurrentNavigatable.UpNeighbour) {
          this.SetCurrentNavigatable(this.CurrentNavigatable.UpNeighbour);

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

    if (this._locked) {
      return res;
    }

    if (this.CurrentNavigatable.IsSubMapping) {
      this.RemoveWidgetNavigatable();
      res.moved = true;
      res.jumped = true;
      this.SelectCurrentElement();
      this.CurrentSubMappingRootKey = undefined;
      return res;
    }

    // At left bound
    if (this.p.x === 0) {
      if (canJumpToNeighbourMatrix && this.CurrentNavigatable.OuterJump && !!this.CurrentNavigatable.LeftNeighbour) {
        if (this.CurrentNavigatable.LeftNeighbour.Matrix.length === 0 || this.CurrentNavigatable.LeftNeighbour.Matrix[0].length === 0) {
          res.moved = false;
          res.jumped = false;
          return res;
        }

        this.SetCurrentNavigatable(this.CurrentNavigatable.LeftNeighbour);

        if (this.CurrentNavigatable.DestWhenJumpedOnto !== undefined) {
          switch (this.CurrentNavigatable.DestWhenJumpedOnto) {
            case JumpDestination.LOWER_LEFT:
              this.p.y = this.maxCurrentWorldY;
              this.p.x = 0;
              break;
            case JumpDestination.LOWER_RIGHT:
              this.p.y = this.maxCurrentWorldY;
              this.p.x = this.maxCurrentWorldX;
              break;
            case JumpDestination.UPPER_LEFT:
              this.p.y = 0;
              this.p.x = 0;
              break;
            default:
            case JumpDestination.UPPER_RIGHT:
              this.p.y = 0;
              this.p.x = this.maxCurrentWorldX;
              break;
          }
        } else {
          this.p.y = 0;
          this.p.x = this.maxCurrentWorldX;
        }

        if (select) {
          this.SelectCurrentElement();
        }

        res.moved = true;
        res.jumped = true;
      }
      // Not at left bound
    } else {
      this.p.x--;

      if (select) {
        this.SelectCurrentElement();
      }

      res.moved = true;
    }

    if (select) {
      this.SelectCurrentElement();
    }

    return res;
  }

  public MoveRight(select: boolean = true, altKey: boolean = false, canJumpToNeighbourMatrix: boolean = true): MoveRes {
    this.LogMoveStats(AttachDirection.RIGHT, select, altKey, canJumpToNeighbourMatrix);

    const res = { moved: false, jumped: false } as MoveRes;

    if (this._locked) {
      return res;
    }

    if (this.CurrentNavigatable.IsSubMapping) {
      this.RemoveWidgetNavigatable();
      res.moved = true;
      res.jumped = true;
      this.SelectCurrentElement();
      this.CurrentSubMappingRootKey = undefined;
      return res;
    }

    // At right bound
    if (this.p.x === this.maxCurrentWorldX) {
      if (canJumpToNeighbourMatrix && this.CurrentNavigatable.OuterJump && !!this.CurrentNavigatable.RightNeighbour) {
        if (this.CurrentNavigatable.RightNeighbour.Matrix.length === 0 || this.CurrentNavigatable.RightNeighbour.Matrix[0].length === 0) {
          res.moved = false;
          res.jumped = false;
          return res;
        }

        this.SetCurrentNavigatable(this.CurrentNavigatable.RightNeighbour);

        if (this.CurrentNavigatable.DestWhenJumpedOnto !== undefined) {
          switch (this.CurrentNavigatable.DestWhenJumpedOnto) {
            case JumpDestination.LOWER_LEFT:
              this.p.y = this.maxCurrentWorldY;
              this.p.x = 0;
              break;
            case JumpDestination.LOWER_RIGHT:
              this.p.y = this.maxCurrentWorldY;
              this.p.x = this.maxCurrentWorldX;
              break;
            case JumpDestination.UPPER_LEFT:
              this.p.y = 0;
              this.p.x = 0;
              break;
            default:
            case JumpDestination.UPPER_RIGHT:
              this.p.y = 0;
              this.p.x = this.maxCurrentWorldX;
              break;
          }
        } else {
          this.p.y = 0;
          this.p.x = 0;
        }

        if (select) {
          this.SelectCurrentElement();
        }

        res.moved = true;
        res.jumped = true;
      }
      // Not at right bound
    } else {
      this.p.x++;

      if (select) {
        this.SelectCurrentElement();
      }

      res.moved = true;
    }

    if (select) {
      this.SelectCurrentElement();
    }

    return res;
  }

  public MoveUp(select: boolean = true, altKey: boolean = false, canJumpToNeighbourMatrix: boolean = true): MoveRes {
    this.LogMoveStats(AttachDirection.UP, select, altKey, canJumpToNeighbourMatrix);

    const res = { moved: false, jumped: false } as MoveRes;

    if (this._locked) {
      return res;
    }

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
        if (this.CurrentNavigatable.UpNeighbour.Matrix.length === 0 || this.CurrentNavigatable.UpNeighbour.Matrix[0].length === 0) {
          res.moved = false;
          res.jumped = false;
          return res;
        }

        this.SetCurrentNavigatable(this.CurrentNavigatable.UpNeighbour);

        if (this.CurrentNavigatable.DestWhenJumpedOnto !== undefined) {
          switch (this.CurrentNavigatable.DestWhenJumpedOnto) {
            case JumpDestination.LOWER_LEFT:
              this.p.y = this.maxCurrentWorldY;
              this.p.x = 0;
              break;
            case JumpDestination.LOWER_RIGHT:
              this.p.y = this.maxCurrentWorldY;
              this.p.x = this.maxCurrentWorldX;
              break;
            case JumpDestination.UPPER_LEFT:
              this.p.y = 0;
              this.p.x = 0;
              break;
            default:
            case JumpDestination.UPPER_RIGHT:
              this.p.y = 0;
              this.p.x = this.maxCurrentWorldX;
              break;
          }
        } else {
          this.p.y = this.maxCurrentWorldY;
          this.p.x = 0;
        }

        if (select) {
          this.SelectCurrentElement();
        }

        res.moved = true;
        res.jumped = true;
      }
      // Not at upper bound
    } else {
      this.p.y--;

      if (this.CurrentNavigatable.JumpPositionPriority !== undefined) {
        switch (this.CurrentNavigatable.JumpPositionPriority) {
          case JumpPosPriority.first: {
            this.p.x = 0;
            break;
          }
          case JumpPosPriority.last: {
            this.p.x = this.AroundHere[this.p.y].length - 1;
            break;
          }
          case JumpPosPriority.same: {
            this.p.x = this.p.x > this.maxCurrentWorldX ? this.maxCurrentWorldX : this.p.x
            break;
          }
        }
      } else if (this.p.x > this.maxCurrentWorldX) {
        this.p.x = 0;
      }

      if (select) {
        this.SelectCurrentElement();
      }

      res.moved = true;
    }

    if (select) {
      this.SelectCurrentElement();
    }

    return res;
  }

  public MoveDown(select: boolean = true, altKey: boolean = false, canJumpToNeighbourMatrix: boolean = true): MoveRes {
    this.LogMoveStats(AttachDirection.DOWN, select, altKey, canJumpToNeighbourMatrix);

    const res = { moved: false, jumped: false } as MoveRes;

    if (this._locked) {
      return res;
    }

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
        if (this.CurrentNavigatable.DownNeighbour.Matrix.length === 0 || this.CurrentNavigatable.DownNeighbour.Matrix[0].length === 0) {
          res.moved = false;
          res.jumped = false;
          return res;
        }

        this.SetCurrentNavigatable(this.CurrentNavigatable.DownNeighbour);

        if (this.CurrentNavigatable.DestWhenJumpedOnto !== undefined) {
          switch (this.CurrentNavigatable.DestWhenJumpedOnto) {
            case JumpDestination.LOWER_LEFT:
              this.p.y = this.maxCurrentWorldY;
              this.p.x = 0;
              break;
            case JumpDestination.LOWER_RIGHT:
              this.p.y = this.maxCurrentWorldY;
              this.p.x = this.maxCurrentWorldX;
              break;
            case JumpDestination.UPPER_LEFT:
              this.p.y = 0;
              this.p.x = 0;
              break;
            default:
            case JumpDestination.UPPER_RIGHT:
              this.p.y = 0;
              this.p.x = this.maxCurrentWorldX;
              break;
          }
        } else {
          this.p.y = 0;
          this.p.x = 0;
        }

        if (select) {
          this.SelectCurrentElement();
        }

        res.moved = true;
        res.jumped = true;
      }
      // Not at lower bound
    } else {
      this.p.y++;

      if (this.CurrentNavigatable.JumpPositionPriority !== undefined) {
        switch (this.CurrentNavigatable.JumpPositionPriority) {
          case JumpPosPriority.first: {
            this.p.x = 0;
            break;
          }
          case JumpPosPriority.last: {
            this.p.x = this.AroundHere[this.p.y].length - 1;
            break;
          }
          case JumpPosPriority.same: {
            this.p.x = this.p.x > this.maxCurrentWorldX ? this.maxCurrentWorldX : this.p.x
            break;
          }
        }
      } else if (this.p.x > this.maxCurrentWorldX) {
        this.p.x = 0;
      }

      if (select) {
        this.SelectCurrentElement();
      }

      res.moved = true;
    }

    if (select) {
      this.SelectCurrentElement();
    }

    return res;
  }

  public NextColumn(): MoveRes {
    const res = { moved: false, jumped: false } as MoveRes

    if (this.p.x === this.maxCurrentWorldX && this.p.y < this.maxCurrentWorldY) {
      this.SetPosition(0, this.p.y + 1)

      this.SelectCurrentElement()

      res.moved = true
    }

    return res
  }

  public SetRoot(n: INavigatable): void {
    this.Root = n;
    this.SetCurrentNavigatable(n);
  }

  public SetCurrentNavigatable(n: INavigatable): void {
    this.CurrentNavigatable = n;
    this.NavigatableChanged.next(this.CurrentNavigatable.constructor.name);
  }

  public Attach(n: INavigatable, direction: AttachDirection, setAsCurrentNavigatable: boolean = true): void {
    switch (direction) {
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
      console.log("[Attach] setting as current navigatable: ", (n as any).constructor.name);
      // try {
      //   throw new Error("hmmm");
      // } catch (error) {
      //   console.error(error);
      // }
      this.SetCurrentNavigatable(n);
      this.SelectFirstTile();
    }
  }

  public ResetToRoot(): void {
    this.SetCurrentNavigatable(this.Root);
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

    console.log(this.CurrentNavigatable);

    if (!!this.CurrentNavigatable.UpNeighbour) {
      let temp = this.CurrentNavigatable.UpNeighbour;
      this.CurrentNavigatable.ClearNeighbours();
      this.SetCurrentNavigatable(temp);
    }
    else if (!!this.CurrentNavigatable.LeftNeighbour) {
      let temp = this.CurrentNavigatable.LeftNeighbour;
      this.CurrentNavigatable.ClearNeighbours();
      this.SetCurrentNavigatable(temp);
    }
    else if (!!this.CurrentNavigatable.RightNeighbour) {
      let temp = this.CurrentNavigatable.RightNeighbour;
      this.CurrentNavigatable.ClearNeighbours();
      this.SetCurrentNavigatable(temp);
    }
    else if (!!this.CurrentNavigatable.DownNeighbour) {
      let temp = this.CurrentNavigatable.DownNeighbour;
      this.CurrentNavigatable.ClearNeighbours();
      this.SetCurrentNavigatable(temp);
    } else {
      this.SetCurrentNavigatable(this.Root);
    }

    if (newX !== undefined && newY !== undefined) {
      this.p.x = newX;
      this.p.y = newY;
      this.SelectCurrentElement();
    }
  }

  public SetWidgetNavigatable(n: INavigatable): void {
    this.loggerService.info(`[SetWidgetNavigatable] Navigatable: ${n.constructor.name}, JSON: ${JSON.stringify(n)}`)

    this.CurrentNavigatable.LastX = this.p.x;
    this.CurrentNavigatable.LastY = this.p.y;

    this.NavigatableStack.push(this.CurrentNavigatable);
    this.WidgetStack.push(n);

    this.SetCurrentNavigatable(n);

    this.p.x = 0;
    this.p.y = 0;
  }

  public IsDialogOpen(): boolean {
    return this.WidgetStack.length > 0;
  }

  public RemoveWidgetNavigatable(): void {
    this.loggerService.info(`[RemoveWidgetNavigatable] Removing widget from stack.`)

    this.SetCurrentNavigatable(this.NavigatableStack.pop() ?? this.Root);
    this.WidgetStack.pop();

    this.p.x = this.CurrentNavigatable.LastX! ?? 0.0;
    this.p.y = this.CurrentNavigatable.LastY! ?? 0.0;

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
