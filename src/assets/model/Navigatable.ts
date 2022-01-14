import { ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { KeyboardModes, KeyboardNavigationService } from 'src/app/services/keyboard-navigation.service';

export module Navigatable {

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
        GenerateAndSetNavMatrices(): void;
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

        GenerateAndSetNavMatrices(): void {}

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

        buyerForm: FormGroup;
        kbS: KeyboardNavigationService;
        cdref: ChangeDetectorRef;

        _data: any[];

        constructor(f: FormGroup, kbs: KeyboardNavigationService, cdr: ChangeDetectorRef, data: any[]) {
            this.buyerForm = f;
            this.kbS = kbs;
            this.cdref = cdr;
            this._data = data;
        }

        handleFormEscape(): void {
            this.kbS.setEditMode(KeyboardModes.NAVIGATION);
            this.cdref.detectChanges();
        }

        private feelBuyerForm(selectedValue: string, objectKey: string) {
            let buyer = this._data.find(b => b[objectKey] === selectedValue);
            if (!!buyer) {
                Object.keys(this.buyerForm.controls).forEach((x: string) => {
                    if (x !== objectKey) {
                        this.buyerForm.controls[x].setValue(buyer[x]);
                    }
                });
            }
        }

        handleAutoCompleteSelect(event: any, key: string): void {
            if (event === "") {
                Object.keys(this.buyerForm.controls).forEach((x: string) => {
                    if (x !== key) {
                        this.buyerForm.controls[x].setValue("");
                    }
                });
            } else {
                this.feelBuyerForm(event, key);
            }
            // TODO
            // if (!this.kbS.isEditModeActivated) {
            //     let oldMy = this.kbS.worldPos.Y;
            //     this.kbS.moveNextInForm();
            //     // TODO: navigációs mátrixhoz típust rendelni, pl. "táblázat"
            //     if (oldMy < this.kbS.worldPos.Y) {
            //         console.log(this.kbS.getCurrentTile());
            //         this.kbS.setEditMode(KeyboardModes.NAVIGATION);
            //         this.gridNavHandler.handleGridEnter(this.productsData[0], 0, this.colDefs[0].objectKey, 0);
            //     } else {
            //         this.kbS.clickCurrentTile();
            //         this.kbS.toggleEdit();
            //     }
            // }
        }

        ClearNeighbours(): void {
            throw new Error('Method not implemented.');
        }
        
        GenerateAndSetNavMatrices(): void {
            throw new Error('Method not implemented.');
        }
    }

}
