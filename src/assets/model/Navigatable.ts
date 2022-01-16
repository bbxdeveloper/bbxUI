import { ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { setupTestingRouter } from '@angular/router/testing';
import { KeyboardModes, KeyboardNavigationService, MoveRes } from 'src/app/services/keyboard-navigation.service';
import * as $ from 'jquery';
import { environment } from 'src/environments/environment';

export module Nav {

    export const TileCssClass: string = 'navmatrix-tile';

    export enum AttachDirection { DOWN, LEFT, RIGHT, UP };

    // Interfaces

    export interface INavigatable {
        Matrix: string[][];

        LastX?: number;
        LastY?: number;

        HasSubMapping: boolean;
        SubMapping?: { [id: string]: string[][]; };

        IsDialog: boolean;

        InnerJumpOnEnter: boolean;
        OuterJump: boolean;

        LeftNeighbour?: INavigatable;
        RightNeighbour?: INavigatable;
        DownNeighbour?: INavigatable;
        UpNeighbour?: INavigatable;

        ClearNeighbours(): void;
        GenerateAndSetNavMatrices(attach: boolean): void;
        Attach(): void;
        Detach(): void;
    }

    export interface NavigatableTable extends INavigatable {

    }

    // NullObject

    export class NullNavigatable implements INavigatable {
        Matrix: string[][] = [[]];
        LastX?: number | undefined = undefined;
        LastY?: number | undefined = undefined;
        HasSubMapping: boolean = false;
        SubMapping?: { [id: string]: string[][]; } | undefined;
        IsDialog: boolean = false;
        InnerJumpOnEnter: boolean = false;
        OuterJump: boolean = false;
        LeftNeighbour?: INavigatable | undefined;
        RightNeighbour?: INavigatable | undefined;
        DownNeighbour?: INavigatable | undefined;
        UpNeighbour?: INavigatable | undefined;

        private static _instance: NullNavigatable = new NullNavigatable();

        private constructor() { }

        ClearNeighbours(): void {}

        GenerateAndSetNavMatrices(attach: boolean): void { }
        Attach(): void { }
        Detach(): void { }

        public static get Instance(): NullNavigatable { return this._instance; }
    }

    // Classes

    export class NavigatableForm implements INavigatable {
        Matrix: string[][] = [[]];

        LastX?: number | undefined;
        LastY?: number | undefined;

        HasSubMapping: boolean = false;
        SubMapping?: { [id: string]: string[][]; } = undefined;

        IsDialog: boolean = false;

        InnerJumpOnEnter: boolean = true;
        OuterJump: boolean = false;

        LeftNeighbour?: INavigatable;
        RightNeighbour?: INavigatable;
        DownNeighbour?: INavigatable;
        UpNeighbour?: INavigatable;

        form: FormGroup;
        kbS: KeyboardNavigationService;
        cdref: ChangeDetectorRef;

        _data: any[];

        attachDirection: AttachDirection;

        formId: string;

        constructor(
            f: FormGroup,
            kbs: KeyboardNavigationService,
            cdr: ChangeDetectorRef,
            data: any[],
            formId: string,
            attachDirection: AttachDirection = AttachDirection.DOWN
        ) {
            this.form = f;
            this.kbS = kbs;
            this.cdref = cdr;
            this._data = data;
            this.attachDirection = attachDirection;
            this.formId = formId;
        }

        HandleFormEscape(): void {
            this.kbS.setEditMode(KeyboardModes.NAVIGATION);
            this.cdref.detectChanges();
        }

        private FeelFormAfterValueSelect(selectedValue: string, objectKey: string) {
            let buyer = this._data.find(b => b[objectKey] === selectedValue);
            if (!!buyer) {
                Object.keys(this.form.controls).forEach((x: string) => {
                    if (x !== objectKey) {
                        this.form.controls[x].setValue(buyer[x]);
                    }
                });
            }
        }

        private MoveNext(): MoveRes {
            let moveRes = this.kbS.MoveRight(true, false, false);
            if (!moveRes.moved) {
                moveRes = this.kbS.MoveDown(true, false, true);
            } 
            return moveRes;
        }

        private JumpToNextInput(event?: Event): void {
            const moveRes = this.MoveNext();
            // We can't know if we should click the first element if we moved to another navigation-matrix.
            if (!moveRes.jumped) {
                this.kbS.ClickCurrentElement();
                if (!this.kbS.isEditModeActivated) {
                    this.kbS.toggleEdit();
                }
            } else {
                // For example in case if we just moved onto a confirmation button in the next nav-matrix,
                // we don't want to automatically press it until the user directly presses enter after selecting it.
                if (!!event) {
                    event.stopImmediatePropagation();
                }
            }
        }

        HandleAutoCompleteSelect(event: any, key: string): void {
            if (event === "") {
                Object.keys(this.form.controls).forEach((x: string) => {
                    if (x !== key) {
                        this.form.controls[x].setValue("");
                    }
                });
            } else {
                this.FeelFormAfterValueSelect(event, key);
            }
            if (!this.kbS.isEditModeActivated) {
                this.JumpToNextInput(event);
            }
        }

        HandleFormEnter(event: Event, jumpNext: boolean = true, toggleEditMode: boolean = true): void {
            if (toggleEditMode) {
                this.kbS.toggleEdit();
            }
            // No edit mode means previous mode was edit so we just finalized the form and ready to jump to the next.
            if (!this.kbS.isEditModeActivated && jumpNext) {
                this.JumpToNextInput(event);
            }
        }

        ClearNeighbours(): void {
            this.LeftNeighbour = undefined;
            this.RightNeighbour = undefined;
            this.DownNeighbour = undefined;
            this.UpNeighbour = undefined;
        }

        private LogMatrixGenerationCycle(cssClass: string, totalTiles: number, node: string, parent: any, grandParent: any): void {
            if (environment.debug) {
                console.log("\n\n+---- MATRIX GEN ----+");
                console.log(`Time: ${Date.now().toLocaleString()}`);

                console.log(`Current node: ${node}`);
                console.log(`Parent: ${parent}`);
                console.log(`Grandparent: ${grandParent}`);

                console.log(`CSS Class: ${cssClass}`);

                console.log(`Total tiles: ${totalTiles}`);
                
                console.log("+------------------+\n\n");
            }
        }
        
        GenerateAndSetNavMatrices(attach: boolean): void {
            // Get tiles
            const tiles = $('.' + TileCssClass, '#' + this.formId);

            if (environment.debug) {
                console.log('[GenerateAndSetNavMatrices]', this.formId, tiles, '.' + TileCssClass, '#' + this.formId);
            }

            let currentParent = '';
            
            // Prepare matrix
            this.Matrix = [[]];
            let currentMatrixIndex = 0;

            // Getting tiles, rows for navigation matrix
            for (let i = 0; i < tiles.length; i++) {
                const next = tiles[i];

                this.LogMatrixGenerationCycle(
                    TileCssClass, tiles.length, next.nodeName, next?.parentElement?.nodeName, next?.parentElement?.parentElement?.nodeName
                );

                // Usually all form elements are in a nb-form-field
                // So we must examine the parent of that element to be sure two form element
                // is not in the same block
                if (!!next?.parentElement?.parentElement) {
                    const pE = next?.parentElement?.parentElement.nodeName;
                    if (pE !== currentParent) {
                        // currentParent was already initailized,
                        // so this parent name change must mean the tile is in another row
                        if (currentParent !== '') {
                            this.Matrix.push([]);
                            ++currentMatrixIndex;
                        }
                        currentParent = next.parentElement.nodeName;
                    }
                }

                next.id = TileCssClass + '-' + Math.floor(Date.now() * Math.random());
                this.Matrix[currentMatrixIndex].push(next.id);
            }

            if (environment.debug) {
                console.log('[GenerateAndSetNavMatrices]', this.Matrix);
            }

            if (attach) {
                this.kbS.Attach(this, this.attachDirection);
            }
        }

        Attach(): void {
            this.kbS.Attach(this, this.attachDirection);
        }

        Detach(): void {}
    }

}
