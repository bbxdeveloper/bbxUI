import { Constants } from "../util/Constants";
import { Actions } from "../util/KeyBindings";

export interface ModelFieldDescriptor {
    label: string;

    defaultValue?: string;

    objectKey: string;
    colKey: string;

    type?: string;

    mask: string;
    
    colWidth?: string;
    textAlign?: string;

    navMatrixCssClass?: string;

    fRequired?: boolean;
    fInputType?: string;

    fLast?: boolean;

    fReadonly?: boolean;
    fUnclickable?: boolean;

    calc?: (x: any) => any;
    inputMask?: any;
    placeHolder?: string;

    keyAction?: Actions,
    keySettingsRow?: Constants.KeySettingRow
}
