import { Constants } from "./Constants";
import { FooterCommandInfo } from 'src/assets/model/FooterCommandInfo';

export enum KeyBindings {
    // Menu Navigation
    zero = '0',
    one = '1',
    two = '2',
    three = '3',
    four = '4',
    // NAVIGATION
    up = 'ArrowUp',
    down = 'ArrowDown',
    left = 'ArrowLeft',
    right = 'ArrowRight',
    home = 'Home',
    end = 'End',
    pgUp = 'PageUp',
    pgDown = 'PageDown',
    // CRUD
    edit = 'Enter',
    delete = 'Delete',
    // CRUD for subitem
    editSubItem = 's',
    newSubItem = 'a',
    // MISC
    exit = 'Escape',
    exitIE = 'Esc',
    save = 's',
    // META
    F1 = 'F1',
    F2 = 'F2',
    F3 = 'F3',
    F4 = 'F4',
    F5 = 'F5',
    F6 = 'F6',
    F7 = 'F7',
    F8 = 'F8',
    F8orDelete = 'F8 vagy DELETE',
    F9 = 'F9',
    F10 = 'F10',
    F11 = 'F11',
    F12 = 'F12',
    Tab = 'Tab',
    Enter = 'Enter',
    // QUICK CRUD
    crudNew = F8,
    crudEdit = F7,
    crudReset = F9,
    crudSave = F10,
    crudDelete = F11,
    crudPrint = F6,
    unset = "unset",
    CtrlEnter = "CtrlEnter",
};

export enum Actions {
    Help = 'Help',
    Search = 'Search',
    Refresh = 'Refresh',
    CrudNew = 'CrudNew',
    CrudEdit = 'CrudEdit',
    CrudReset = 'CrudReset',
    CrudSave = 'CrudSave',
    CrudDelete = 'CrudDelete',
    Print = 'Print',
    ToggleForm = 'ToggleForm',
    CSV = 'CSV',
    Email = 'Email',
    CloseAndSave = 'CloseAndSave',
    Details = 'Details',
    JumpToForm = 'JumpToForm',
    ToggleAllDiscounts = 'ToggleAllDiscounts',
    SetGlobalDiscount = 'SetGlobalDiscount',
    EscapeEditor1 = 'EscapeEditor1',
    Lock = 'Lock',
}

// Misc: F6, F7, F10, F11

export let DefaultKeySettings: Constants.KeySettingsDct = {
    CrudNew: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Új felvitel', KeyType: Constants.KeyTypes.Fn },
    CrudEdit: { KeyCode: KeyBindings.F4, KeyLabel: KeyBindings.F4, FunctionLabel: 'Szerkesztés', KeyType: Constants.KeyTypes.Fn },
    Refresh: { KeyCode: KeyBindings.F5, KeyLabel: KeyBindings.F5, FunctionLabel: 'Frissítés', KeyType: Constants.KeyTypes.Fn },
    CrudReset: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Visszaállítás', KeyType: Constants.KeyTypes.Fn },
    CrudSave: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Fn },
    CrudDelete: { KeyCode: KeyBindings.F8, AlternativeKeyCode: KeyBindings.delete, KeyLabel: KeyBindings.F8, FunctionLabel: 'Törlés', KeyType: Constants.KeyTypes.Fn },
    ToggleForm: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Tétellap', KeyType: Constants.KeyTypes.Fn },
    JumpToForm: { KeyCode: KeyBindings.Tab, KeyLabel: KeyBindings.Tab, FunctionLabel: 'Ugrás tétellapra', KeyType: Constants.KeyTypes.Default },
    
    // Unset:
    Help: { KeyCode: KeyBindings.F1, KeyLabel: KeyBindings.F1, FunctionLabel: 'Súgó', KeyType: Constants.KeyTypes.Unset },
    ToggleAllDiscounts: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    SetGlobalDiscount: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    Search: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Unset },
    Print: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Nyomtatás', KeyType: Constants.KeyTypes.Unset },
    CSV: { KeyCode: KeyBindings.F11, KeyLabel: KeyBindings.F11, FunctionLabel: 'CSV', KeyType: Constants.KeyTypes.Unset },
    Email: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Email', KeyType: Constants.KeyTypes.Unset },
    CloseAndSave: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Details: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    EscapeEditor1: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Lock: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Zárolás', KeyType: Constants.KeyTypes.Unset },
};

export let InventoryPeriodsKeySettings: Constants.KeySettingsDct = {
    CrudNew: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Új felvitel', KeyType: Constants.KeyTypes.Fn },
    CrudEdit: { KeyCode: KeyBindings.F4, KeyLabel: KeyBindings.F4, FunctionLabel: 'Szerkesztés', KeyType: Constants.KeyTypes.Fn },
    Refresh: { KeyCode: KeyBindings.F5, KeyLabel: KeyBindings.F5, FunctionLabel: 'Frissítés', KeyType: Constants.KeyTypes.Fn },
    CrudReset: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Visszaállítás', KeyType: Constants.KeyTypes.Fn },
    CrudSave: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Fn },
    CrudDelete: { KeyCode: KeyBindings.F8, AlternativeKeyCode: KeyBindings.delete, KeyLabel: KeyBindings.F8, FunctionLabel: 'Törlés', KeyType: Constants.KeyTypes.Fn },
    Lock: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Leltáridőszak zárása', KeyType: Constants.KeyTypes.Fn },
    ToggleForm: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Tétellap', KeyType: Constants.KeyTypes.Fn },
    JumpToForm: { KeyCode: KeyBindings.Tab, KeyLabel: KeyBindings.Tab, FunctionLabel: 'Ugrás tétellapra', KeyType: Constants.KeyTypes.Default },

    // Unset:
    Help: { KeyCode: KeyBindings.F1, KeyLabel: KeyBindings.F1, FunctionLabel: 'Súgó', KeyType: Constants.KeyTypes.Unset },
    ToggleAllDiscounts: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    SetGlobalDiscount: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    Search: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Unset },
    Print: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Nyomtatás', KeyType: Constants.KeyTypes.Unset },
    CSV: { KeyCode: KeyBindings.F11, KeyLabel: KeyBindings.F11, FunctionLabel: 'CSV', KeyType: Constants.KeyTypes.Unset },
    Email: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Email', KeyType: Constants.KeyTypes.Unset },
    CloseAndSave: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Details: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    EscapeEditor1: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
};

export let InvoiceKeySettings: Constants.KeySettingsDct = {
    Refresh: { KeyCode: KeyBindings.F5, KeyLabel: KeyBindings.F5, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Fn },
    CrudDelete: { KeyCode: KeyBindings.F8, AlternativeKeyCode: KeyBindings.delete, KeyLabel: KeyBindings.F8, FunctionLabel: 'Törlés', KeyType: Constants.KeyTypes.Fn },
    CloseAndSave: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Combo },
    
    // Unset:
    Help: { KeyCode: KeyBindings.F1, KeyLabel: KeyBindings.F1, FunctionLabel: 'Súgó', KeyType: Constants.KeyTypes.Unset },
    CrudNew: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Új felvitel', KeyType: Constants.KeyTypes.Unset },
    CrudEdit: { KeyCode: KeyBindings.F4, KeyLabel: KeyBindings.F4, FunctionLabel: 'Szerkesztés', KeyType: Constants.KeyTypes.Unset },
    CrudReset: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Visszaállítás', KeyType: Constants.KeyTypes.Unset },
    CrudSave: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    ToggleForm: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Tétellap', KeyType: Constants.KeyTypes.Unset },
    JumpToForm: { KeyCode: KeyBindings.Tab, KeyLabel: KeyBindings.Tab, FunctionLabel: 'Ugrás tétellapra', KeyType: Constants.KeyTypes.Unset },
    ToggleAllDiscounts: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    SetGlobalDiscount: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    Search: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Unset },
    Print: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Nyomtatás', KeyType: Constants.KeyTypes.Unset },
    CSV: { KeyCode: KeyBindings.F11, KeyLabel: KeyBindings.F11, FunctionLabel: 'CSV', KeyType: Constants.KeyTypes.Unset },
    Email: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Email', KeyType: Constants.KeyTypes.Unset },
    Details: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    EscapeEditor1: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Lock: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Zárolás', KeyType: Constants.KeyTypes.Unset },
};

export let InvoiceManagerKeySettings: Constants.KeySettingsDct = {
    Refresh: { KeyCode: KeyBindings.F5, KeyLabel: KeyBindings.F5, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Fn },
    CrudDelete: { KeyCode: KeyBindings.F8, AlternativeKeyCode: KeyBindings.delete, KeyLabel: KeyBindings.F8orDelete, FunctionLabel: 'Törlés', KeyType: Constants.KeyTypes.Fn },
    CloseAndSave: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Combo },
    
    // Unset:
    Help: { KeyCode: KeyBindings.F1, KeyLabel: KeyBindings.F1, FunctionLabel: 'Súgó', KeyType: Constants.KeyTypes.Unset },
    CrudNew: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Új felvitel', KeyType: Constants.KeyTypes.Unset },
    CrudEdit: { KeyCode: KeyBindings.F4, KeyLabel: KeyBindings.F4, FunctionLabel: 'Szerkesztés', KeyType: Constants.KeyTypes.Unset },
    CrudReset: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Visszaállítás', KeyType: Constants.KeyTypes.Unset },
    CrudSave: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    ToggleForm: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Tétellap', KeyType: Constants.KeyTypes.Unset },
    JumpToForm: { KeyCode: KeyBindings.Tab, KeyLabel: KeyBindings.Tab, FunctionLabel: 'Ugrás tétellapra', KeyType: Constants.KeyTypes.Unset },
    ToggleAllDiscounts: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    SetGlobalDiscount: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    Search: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Unset },
    Print: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Nyomtatás', KeyType: Constants.KeyTypes.Unset },
    CSV: { KeyCode: KeyBindings.F11, KeyLabel: KeyBindings.F11, FunctionLabel: 'CSV', KeyType: Constants.KeyTypes.Unset },
    Email: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Email', KeyType: Constants.KeyTypes.Unset },
    Details: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    EscapeEditor1: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Lock: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Zárolás', KeyType: Constants.KeyTypes.Unset },
};

export let OfferNavKeySettings: Constants.KeySettingsDct = {
    CrudNew: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Új felvitel', KeyType: Constants.KeyTypes.Fn },
    CrudEdit: { KeyCode: KeyBindings.F4, KeyLabel: KeyBindings.F4, FunctionLabel: 'Szerkesztés', KeyType: Constants.KeyTypes.Fn },
    Refresh: { KeyCode: KeyBindings.F5, KeyLabel: KeyBindings.F5, FunctionLabel: 'Frissítés', KeyType: Constants.KeyTypes.Fn },
    Details: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Megjegyzés megtekintése', KeyType: Constants.KeyTypes.Fn },
    CrudDelete: { KeyCode: KeyBindings.F8, AlternativeKeyCode: KeyBindings.delete, KeyLabel: KeyBindings.F8, FunctionLabel: 'Törlés', KeyType: Constants.KeyTypes.Fn },
    Print: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Nyomtatás', KeyType: Constants.KeyTypes.Fn },
    CSV: { KeyCode: KeyBindings.F11, KeyLabel: KeyBindings.F11, FunctionLabel: 'CSV', KeyType: Constants.KeyTypes.Fn },
    Email: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Email', KeyType: Constants.KeyTypes.Fn },
    
    // Unset
    Search: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Unset },
    Help: { KeyCode: KeyBindings.F1, KeyLabel: KeyBindings.F1, FunctionLabel: 'Súgó', KeyType: Constants.KeyTypes.Unset },
    CloseAndSave: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    ToggleAllDiscounts: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    SetGlobalDiscount: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    JumpToForm: { KeyCode: KeyBindings.Tab, KeyLabel: KeyBindings.Tab, FunctionLabel: 'Ugrás tétellapra', KeyType: Constants.KeyTypes.Unset },
    ToggleForm: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Tétellap', KeyType: Constants.KeyTypes.Unset },
    CrudReset: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Visszaállítás', KeyType: Constants.KeyTypes.Unset },
    CrudSave: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    EscapeEditor1: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Lock: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Zárolás', KeyType: Constants.KeyTypes.Unset },
};

export let InvRowNavKeySettings: Constants.KeySettingsDct = {
    CrudNew: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Új felvitel', KeyType: Constants.KeyTypes.Unset },
    CrudEdit: { KeyCode: KeyBindings.F4, KeyLabel: KeyBindings.F4, FunctionLabel: 'Szerkesztés', KeyType: Constants.KeyTypes.Unset },
    Refresh: { KeyCode: KeyBindings.F5, KeyLabel: KeyBindings.F5, FunctionLabel: 'Frissítés', KeyType: Constants.KeyTypes.Fn },
    Details: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Megjegyzés megtekintése', KeyType: Constants.KeyTypes.Unset },
    CrudDelete: { KeyCode: KeyBindings.F8, AlternativeKeyCode: KeyBindings.delete, KeyLabel: KeyBindings.F8, FunctionLabel: 'Törlés', KeyType: Constants.KeyTypes.Unset },
    Print: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Nyomtatás', KeyType: Constants.KeyTypes.Fn },
    CSV: { KeyCode: KeyBindings.F11, KeyLabel: KeyBindings.F11, FunctionLabel: 'CSV', KeyType: Constants.KeyTypes.Unset },
    Email: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Email', KeyType: Constants.KeyTypes.Unset },

    // Unset
    Search: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Unset },
    Help: { KeyCode: KeyBindings.F1, KeyLabel: KeyBindings.F1, FunctionLabel: 'Súgó', KeyType: Constants.KeyTypes.Unset },
    CloseAndSave: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    ToggleAllDiscounts: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    SetGlobalDiscount: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    JumpToForm: { KeyCode: KeyBindings.Tab, KeyLabel: KeyBindings.Tab, FunctionLabel: 'Ugrás tétellapra', KeyType: Constants.KeyTypes.Unset },
    ToggleForm: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Tétellap', KeyType: Constants.KeyTypes.Unset },
    CrudReset: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Visszaállítás', KeyType: Constants.KeyTypes.Unset },
    CrudSave: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    EscapeEditor1: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Lock: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Zárolás', KeyType: Constants.KeyTypes.Unset },
};

export let StockNavKeySettings: Constants.KeySettingsDct = {
    Search: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Fn },
    CrudNew: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Új felvitel', KeyType: Constants.KeyTypes.Fn },
    CrudEdit: { KeyCode: KeyBindings.F4, KeyLabel: KeyBindings.F4, FunctionLabel: 'Szerkesztés', KeyType: Constants.KeyTypes.Fn },
    Refresh: { KeyCode: KeyBindings.F5, KeyLabel: KeyBindings.F5, FunctionLabel: 'Frissítés', KeyType: Constants.KeyTypes.Fn },
    Details: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Megjegyzés megtekintése', KeyType: Constants.KeyTypes.Unset },
    CrudDelete: { KeyCode: KeyBindings.F8, AlternativeKeyCode: KeyBindings.delete, KeyLabel: KeyBindings.F8, FunctionLabel: 'Törlés', KeyType: Constants.KeyTypes.Fn },
    Print: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Nyomtatás', KeyType: Constants.KeyTypes.Unset },
    CSV: { KeyCode: KeyBindings.F11, KeyLabel: KeyBindings.F11, FunctionLabel: 'CSV', KeyType: Constants.KeyTypes.Unset },
    Email: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Email', KeyType: Constants.KeyTypes.Unset },
    
    // Unset
    Help: { KeyCode: KeyBindings.F1, KeyLabel: KeyBindings.F1, FunctionLabel: 'Súgó', KeyType: Constants.KeyTypes.Unset },
    CloseAndSave: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    ToggleAllDiscounts: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    SetGlobalDiscount: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    JumpToForm: { KeyCode: KeyBindings.Tab, KeyLabel: KeyBindings.Tab, FunctionLabel: 'Ugrás tétellapra', KeyType: Constants.KeyTypes.Unset },
    ToggleForm: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Tétellap', KeyType: Constants.KeyTypes.Unset },
    CrudReset: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Visszaállítás', KeyType: Constants.KeyTypes.Unset },
    CrudSave: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    EscapeEditor1: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Lock: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Zárolás', KeyType: Constants.KeyTypes.Unset },
};

export let StockCardNavKeySettings: Constants.KeySettingsDct = {
    Refresh: { KeyCode: KeyBindings.F5, KeyLabel: KeyBindings.F5, FunctionLabel: 'Frissítés', KeyType: Constants.KeyTypes.Fn },
    ToggleForm: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Tétellap', KeyType: Constants.KeyTypes.Fn },
    
    // Unset
    CrudDelete: { KeyCode: KeyBindings.F8, AlternativeKeyCode: KeyBindings.delete, KeyLabel: KeyBindings.F8, FunctionLabel: 'Törlés', KeyType: Constants.KeyTypes.Unset },
    Search: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Unset },
    CrudNew: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Új felvitel', KeyType: Constants.KeyTypes.Unset },
    CrudEdit: { KeyCode: KeyBindings.F4, KeyLabel: KeyBindings.F4, FunctionLabel: 'Szerkesztés', KeyType: Constants.KeyTypes.Unset },
    Details: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Megjegyzés megtekintése', KeyType: Constants.KeyTypes.Unset },
    Print: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Nyomtatás', KeyType: Constants.KeyTypes.Unset },
    CSV: { KeyCode: KeyBindings.F11, KeyLabel: KeyBindings.F11, FunctionLabel: 'CSV', KeyType: Constants.KeyTypes.Unset },
    Email: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Email', KeyType: Constants.KeyTypes.Unset },
    Help: { KeyCode: KeyBindings.F1, KeyLabel: KeyBindings.F1, FunctionLabel: 'Súgó', KeyType: Constants.KeyTypes.Unset },
    CloseAndSave: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    ToggleAllDiscounts: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    SetGlobalDiscount: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    JumpToForm: { KeyCode: KeyBindings.Tab, KeyLabel: KeyBindings.Tab, FunctionLabel: 'Ugrás tétellapra', KeyType: Constants.KeyTypes.Unset },
    CrudReset: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Visszaállítás', KeyType: Constants.KeyTypes.Unset },
    CrudSave: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    EscapeEditor1: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Lock: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Zárolás', KeyType: Constants.KeyTypes.Unset },
};

export let OfferCreatorKeySettings: Constants.KeySettingsDct = {
    Search: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Fn },
    Refresh: { KeyCode: KeyBindings.F5, KeyLabel: KeyBindings.F5, FunctionLabel: 'Frissítés', KeyType: Constants.KeyTypes.Fn },
    ToggleAllDiscounts: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Kedvezmény mutatás összesre', KeyType: Constants.KeyTypes.Fn },
    SetGlobalDiscount: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Fn },
    CrudDelete: { KeyCode: KeyBindings.F8, AlternativeKeyCode: KeyBindings.delete, KeyLabel: KeyBindings.F8orDelete, FunctionLabel: 'Törlés', KeyType: Constants.KeyTypes.Fn },
    EscapeEditor1: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Átlépés Navigációba', KeyType: Constants.KeyTypes.Fn },
    CloseAndSave: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Combo },

    // Unset
    Help: { KeyCode: KeyBindings.F1, KeyLabel: KeyBindings.F1, FunctionLabel: 'Súgó', KeyType: Constants.KeyTypes.Unset },
    JumpToForm: { KeyCode: KeyBindings.Tab, KeyLabel: KeyBindings.Tab, FunctionLabel: 'Ugrás tétellapra', KeyType: Constants.KeyTypes.Unset },
    Print: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Nyomtatás', KeyType: Constants.KeyTypes.Unset },
    CSV: { KeyCode: KeyBindings.F11, KeyLabel: KeyBindings.F11, FunctionLabel: 'CSV', KeyType: Constants.KeyTypes.Unset },
    Email: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Email', KeyType: Constants.KeyTypes.Unset },
    ToggleForm: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Tétellap', KeyType: Constants.KeyTypes.Unset },
    CrudNew: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Új felvitel', KeyType: Constants.KeyTypes.Unset },
    CrudEdit: { KeyCode: KeyBindings.F4, KeyLabel: KeyBindings.F4, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Unset },
    CrudReset: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Visszaállítás', KeyType: Constants.KeyTypes.Unset },
    CrudSave: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Details: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Lock: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Zárolás', KeyType: Constants.KeyTypes.Unset },
};

export let InvCtrlItemCreatorKeySettings: Constants.KeySettingsDct = {
    Search: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Fn },
    Refresh: { KeyCode: KeyBindings.F5, KeyLabel: KeyBindings.F5, FunctionLabel: 'Frissítés', KeyType: Constants.KeyTypes.Fn },
    CloseAndSave: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Combo },
    CrudDelete: { KeyCode: KeyBindings.F8, AlternativeKeyCode: KeyBindings.delete, KeyLabel: KeyBindings.F8orDelete, FunctionLabel: 'Törlés', KeyType: Constants.KeyTypes.Fn },
    
    // Unset
    ToggleAllDiscounts: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Kedvezmény mutatás összesre', KeyType: Constants.KeyTypes.Unset },
    SetGlobalDiscount: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    EscapeEditor1: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Átlépés Navigációba', KeyType: Constants.KeyTypes.Unset },
    Help: { KeyCode: KeyBindings.F1, KeyLabel: KeyBindings.F1, FunctionLabel: 'Súgó', KeyType: Constants.KeyTypes.Unset },
    JumpToForm: { KeyCode: KeyBindings.Tab, KeyLabel: KeyBindings.Tab, FunctionLabel: 'Ugrás tétellapra', KeyType: Constants.KeyTypes.Unset },
    Print: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Nyomtatás', KeyType: Constants.KeyTypes.Unset },
    CSV: { KeyCode: KeyBindings.F11, KeyLabel: KeyBindings.F11, FunctionLabel: 'CSV', KeyType: Constants.KeyTypes.Unset },
    Email: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Email', KeyType: Constants.KeyTypes.Unset },
    ToggleForm: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Tétellap', KeyType: Constants.KeyTypes.Unset },
    CrudNew: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Új felvitel', KeyType: Constants.KeyTypes.Unset },
    CrudEdit: { KeyCode: KeyBindings.F4, KeyLabel: KeyBindings.F4, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Unset },
    CrudReset: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Visszaállítás', KeyType: Constants.KeyTypes.Unset },
    CrudSave: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Details: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Lock: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Zárolás', KeyType: Constants.KeyTypes.Unset },
};

export let OfferEditorKeySettings: Constants.KeySettingsDct = {
    Search: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Ügyfél Keresés', KeyType: Constants.KeyTypes.Fn },
    Refresh: { KeyCode: KeyBindings.F5, KeyLabel: KeyBindings.F5, FunctionLabel: 'Frissítés', KeyType: Constants.KeyTypes.Fn },
    ToggleAllDiscounts: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Kedvezmény mutatás összesre', KeyType: Constants.KeyTypes.Fn },
    SetGlobalDiscount: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Fn },
    CrudDelete: { KeyCode: KeyBindings.F8, AlternativeKeyCode: KeyBindings.delete, KeyLabel: KeyBindings.F8orDelete, FunctionLabel: 'Törlés', KeyType: Constants.KeyTypes.Fn },
    EscapeEditor1: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Visszalépés Navigációba', KeyType: Constants.KeyTypes.Fn },
    CloseAndSave: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Combo },
    
    // Unset
    Print: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Nyomtatás', KeyType: Constants.KeyTypes.Unset },
    Help: { KeyCode: KeyBindings.F1, KeyLabel: KeyBindings.F1, FunctionLabel: 'Súgó', KeyType: Constants.KeyTypes.Unset },
    JumpToForm: { KeyCode: KeyBindings.Tab, KeyLabel: KeyBindings.Tab, FunctionLabel: 'Ugrás tétellapra', KeyType: Constants.KeyTypes.Unset },
    CSV: { KeyCode: KeyBindings.F11, KeyLabel: KeyBindings.F11, FunctionLabel: 'CSV', KeyType: Constants.KeyTypes.Unset },
    Email: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Email', KeyType: Constants.KeyTypes.Unset },
    ToggleForm: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Tétellap', KeyType: Constants.KeyTypes.Unset },
    CrudNew: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Új felvitel', KeyType: Constants.KeyTypes.Unset },
    CrudEdit: { KeyCode: KeyBindings.F4, KeyLabel: KeyBindings.F4, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Unset },
    CrudReset: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Visszaállítás', KeyType: Constants.KeyTypes.Unset },
    CrudSave: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Details: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Lock: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Zárolás', KeyType: Constants.KeyTypes.Unset },
};

export let GeneralFlatDesignKeySettings: Constants.KeySettingsDct = {
    Help: { KeyCode: KeyBindings.F1, KeyLabel: KeyBindings.F1, FunctionLabel: 'Súgó', KeyType: Constants.KeyTypes.Unset },
    Search: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Fn },
    CrudNew: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Új felvitel', KeyType: Constants.KeyTypes.Fn },
    CrudEdit: { KeyCode: KeyBindings.F4, KeyLabel: KeyBindings.F4, FunctionLabel: 'Szerkesztés', KeyType: Constants.KeyTypes.Fn },
    Refresh: { KeyCode: KeyBindings.F5, KeyLabel: KeyBindings.F5, FunctionLabel: 'Frissítés', KeyType: Constants.KeyTypes.Fn },
    CrudDelete: { KeyCode: KeyBindings.F8, AlternativeKeyCode: KeyBindings.delete, KeyLabel: KeyBindings.F8, FunctionLabel: 'Törlés', KeyType: Constants.KeyTypes.Fn },
    ToggleForm: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Tétellap', KeyType: Constants.KeyTypes.Fn },
    
    // Unset
    EscapeEditor1: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Visszalépés Navigációba', KeyType: Constants.KeyTypes.Unset },
    CloseAndSave: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    ToggleAllDiscounts: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Kedvezmény mutatás összesre', KeyType: Constants.KeyTypes.Unset },
    SetGlobalDiscount: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    Print: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Nyomtatás', KeyType: Constants.KeyTypes.Unset },
    JumpToForm: { KeyCode: KeyBindings.Tab, KeyLabel: KeyBindings.Tab, FunctionLabel: 'Ugrás tétellapra', KeyType: Constants.KeyTypes.Unset },
    CSV: { KeyCode: KeyBindings.F11, KeyLabel: KeyBindings.F11, FunctionLabel: 'CSV', KeyType: Constants.KeyTypes.Unset },
    Email: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Email', KeyType: Constants.KeyTypes.Unset },
    CrudReset: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Visszaállítás', KeyType: Constants.KeyTypes.Unset },
    CrudSave: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Details: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Lock: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Zárolás', KeyType: Constants.KeyTypes.Unset },
};

export function GetFooterCommandListFromKeySettings(keySettings: Constants.KeySettingsDct): FooterCommandInfo[] {
    let commands: FooterCommandInfo[] = [];
    
    for (let key in keySettings) {
        let keyRow = keySettings[key as keyof Constants.KeySettingsDct];
        if (keyRow.KeyType !== Constants.KeyTypes.Unset) {
            commands.push({
                key: keyRow.KeyLabel,
                value: keyRow.FunctionLabel
            } as FooterCommandInfo);
        }
    }

    return commands;
}
