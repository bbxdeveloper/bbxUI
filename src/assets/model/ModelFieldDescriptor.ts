import { Constants } from "../util/Constants";
import { Actions } from "../util/KeyBindings";

/**
 * Táblázat oszlopleírója
 */
export interface ModelFieldDescriptor {
    label: string;

    defaultValue?: string;

    objectKey: string;
    colKey: string;

    type?: string;

    mask: string;
    
    colWidth?: string;
    textAlign?: string;

    /**
     * Navigációs osztály
     */
    navMatrixCssClass?: string;

    fRequired?: boolean;
    fInputType?: string;

    /**
     * Utolsó oszlop
     */
    fLast?: boolean;

    fReadonly?: boolean;
    fUnclickable?: boolean;

    calc?: (x: any) => any;
    inputMask?: any;
    placeHolder?: string;

    keyAction?: Actions,
    keySettingsRow?: Constants.KeySettingRow,

    /**
     * Nem bejelölt ch karaktere
     */
    checkboxFalse?: string,
    /**
     * Bejelölt ch karaktere
     */
    checkboxTrue?: string,

    /**
     * Autoselect on focus the first position after the last entered char.
     */
    cursorAfterLastChar?: boolean
}
