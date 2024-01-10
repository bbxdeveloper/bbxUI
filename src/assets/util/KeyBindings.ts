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
    Create = F8,
    Edit = F7,
    Reset = F9,
    Save = F10,
    Delete = F11,
    crudPrint = F6,
    unset = "unset",
    CtrlEnter = "CtrlEnter",
};

export enum Actions {
    Help = 'Help',
    Search = 'Search',
    Refresh = 'Refresh',
    Create = 'Create',
    Edit = 'Edit',
    Reset = 'Reset',
    Save = 'Save',
    Delete = 'Delete',
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
    Help: { KeyCode: KeyBindings.F1, KeyLabel: KeyBindings.F1, FunctionLabel: 'Súgó', KeyType: Constants.KeyTypes.Fn },
    Create: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Új felvitel', KeyType: Constants.KeyTypes.Fn },
    Edit: { KeyCode: KeyBindings.F4, KeyLabel: KeyBindings.F4, FunctionLabel: 'Szerkesztés', KeyType: Constants.KeyTypes.Fn },
    Refresh: { KeyCode: KeyBindings.F5, KeyLabel: KeyBindings.F5, FunctionLabel: 'Frissítés', KeyType: Constants.KeyTypes.Fn },
    Reset: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Visszaállítás', KeyType: Constants.KeyTypes.Fn },
    Save: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Fn },
    Delete: { KeyCode: KeyBindings.F8, KeyLabel: KeyBindings.F8, FunctionLabel: 'Törlés', KeyType: Constants.KeyTypes.Fn },
    ToggleForm: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Tétellap', KeyType: Constants.KeyTypes.Fn },
    JumpToForm: { KeyCode: KeyBindings.Tab, KeyLabel: KeyBindings.Tab, FunctionLabel: 'Ugrás tétellapra', KeyType: Constants.KeyTypes.Default },

    // Unset:
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

export let DashboardKeySettings: Constants.KeySettingsDct = {
    Help: { KeyCode: KeyBindings.F1, KeyLabel: KeyBindings.F1, FunctionLabel: 'Súgó', KeyType: Constants.KeyTypes.Fn },

    // Unset:
    Create: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Új felvitel', KeyType: Constants.KeyTypes.Unset },
    Edit: { KeyCode: KeyBindings.F4, KeyLabel: KeyBindings.F4, FunctionLabel: 'Szerkesztés', KeyType: Constants.KeyTypes.Unset },
    Refresh: { KeyCode: KeyBindings.F5, KeyLabel: KeyBindings.F5, FunctionLabel: 'Frissítés', KeyType: Constants.KeyTypes.Unset },
    Reset: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Visszaállítás', KeyType: Constants.KeyTypes.Unset },
    Save: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Delete: { KeyCode: KeyBindings.F8, KeyLabel: KeyBindings.F8, FunctionLabel: 'Törlés', KeyType: Constants.KeyTypes.Unset },
    ToggleForm: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Tétellap', KeyType: Constants.KeyTypes.Unset },
    JumpToForm: { KeyCode: KeyBindings.Tab, KeyLabel: KeyBindings.Tab, FunctionLabel: 'Ugrás tétellapra', KeyType: Constants.KeyTypes.Unset },
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
    Help: { KeyCode: KeyBindings.F1, KeyLabel: KeyBindings.F1, FunctionLabel: 'Súgó', KeyType: Constants.KeyTypes.Fn },
    Create: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Új felvitel', KeyType: Constants.KeyTypes.Fn },
    Edit: { KeyCode: KeyBindings.F4, KeyLabel: KeyBindings.F4, FunctionLabel: 'Szerkesztés', KeyType: Constants.KeyTypes.Fn },
    Refresh: { KeyCode: KeyBindings.F5, KeyLabel: KeyBindings.F5, FunctionLabel: 'Frissítés', KeyType: Constants.KeyTypes.Fn },
    Reset: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Visszaállítás', KeyType: Constants.KeyTypes.Fn },
    Save: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Fn },
    Delete: { KeyCode: KeyBindings.F8, KeyLabel: KeyBindings.F8, FunctionLabel: 'Törlés', KeyType: Constants.KeyTypes.Fn },
    Lock: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Leltáridőszak zárása', KeyType: Constants.KeyTypes.Fn },
    ToggleForm: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Tétellap', KeyType: Constants.KeyTypes.Fn },

    // Unset:
    JumpToForm: { KeyCode: KeyBindings.Tab, KeyLabel: KeyBindings.Tab, FunctionLabel: 'Ugrás tétellapra', KeyType: Constants.KeyTypes.Unset },
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

export let ReceiptKeySettings: Constants.KeySettingsDct = {
    Help: { KeyCode: KeyBindings.F1, KeyLabel: KeyBindings.F1, FunctionLabel: 'Súgó', KeyType: Constants.KeyTypes.Fn },
    Refresh: { KeyCode: KeyBindings.F5, KeyLabel: KeyBindings.F5, FunctionLabel: 'Készlet', KeyType: Constants.KeyTypes.Fn },
    Reset: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Bizonylat betöltés', KeyType: Constants.KeyTypes.Fn },
    Delete: { KeyCode: KeyBindings.F8, KeyLabel: KeyBindings.F8, FunctionLabel: 'Törlés', KeyType: Constants.KeyTypes.Fn },
    CSV: { KeyCode: KeyBindings.F11, KeyLabel: KeyBindings.F11, FunctionLabel: 'Számológép', KeyType: Constants.KeyTypes.Fn },
    CloseAndSave: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Combo },

    // Unset:
    Create: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Új felvitel', KeyType: Constants.KeyTypes.Unset },
    Edit: { KeyCode: KeyBindings.F4, KeyLabel: KeyBindings.F4, FunctionLabel: 'Szerkesztés', KeyType: Constants.KeyTypes.Unset },
    Save: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    ToggleForm: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Tétellap', KeyType: Constants.KeyTypes.Unset },
    JumpToForm: { KeyCode: KeyBindings.Tab, KeyLabel: KeyBindings.Tab, FunctionLabel: 'Ugrás tétellapra', KeyType: Constants.KeyTypes.Unset },
    ToggleAllDiscounts: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    SetGlobalDiscount: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    Search: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Unset },
    Print: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Nyomtatás', KeyType: Constants.KeyTypes.Unset },
    Email: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Email', KeyType: Constants.KeyTypes.Unset },
    Details: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    EscapeEditor1: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Lock: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Zárolás', KeyType: Constants.KeyTypes.Unset },
};

export let InvoiceKeySettings: Constants.KeySettingsDct = {
    Help: { KeyCode: KeyBindings.F1, KeyLabel: KeyBindings.F1, FunctionLabel: 'Súgó', KeyType: Constants.KeyTypes.Fn },
    Refresh: { KeyCode: KeyBindings.F5, KeyLabel: KeyBindings.F5, FunctionLabel: 'Frissítés', KeyType: Constants.KeyTypes.Fn },
    Delete: { KeyCode: KeyBindings.F8, KeyLabel: KeyBindings.F8, FunctionLabel: 'Törlés', KeyType: Constants.KeyTypes.Fn },
    CSV: { KeyCode: KeyBindings.F11, KeyLabel: KeyBindings.F11, FunctionLabel: 'Számológép', KeyType: Constants.KeyTypes.Fn },
    CloseAndSave: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Combo },

    // Unset:
    Create: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Új felvitel', KeyType: Constants.KeyTypes.Unset },
    Edit: { KeyCode: KeyBindings.F4, KeyLabel: KeyBindings.F4, FunctionLabel: 'Szerkesztés', KeyType: Constants.KeyTypes.Unset },
    Reset: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Visszaállítás', KeyType: Constants.KeyTypes.Unset },
    Save: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    ToggleForm: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Tétellap', KeyType: Constants.KeyTypes.Unset },
    JumpToForm: { KeyCode: KeyBindings.Tab, KeyLabel: KeyBindings.Tab, FunctionLabel: 'Ugrás tétellapra', KeyType: Constants.KeyTypes.Unset },
    ToggleAllDiscounts: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    SetGlobalDiscount: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    Search: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Unset },
    Print: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Nyomtatás', KeyType: Constants.KeyTypes.Unset },
    Email: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Email', KeyType: Constants.KeyTypes.Unset },
    Details: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    EscapeEditor1: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Lock: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Zárolás', KeyType: Constants.KeyTypes.Unset },
};

export let InvoiceManagerKeySettings: Constants.KeySettingsDct = {
    Help: { KeyCode: KeyBindings.F1, KeyLabel: KeyBindings.F1, FunctionLabel: 'Súgó', KeyType: Constants.KeyTypes.Fn },
    Search: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Fn },
    Create: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Partner / termék felvitel', KeyType: Constants.KeyTypes.Unset },
    Edit: { KeyCode: KeyBindings.F4, KeyLabel: KeyBindings.F4, FunctionLabel: 'Szerkesztés', KeyType: Constants.KeyTypes.Fn },
    Refresh: { KeyCode: KeyBindings.F5, KeyLabel: KeyBindings.F5, FunctionLabel: 'Készlet', KeyType: Constants.KeyTypes.Fn },
    Reset: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Bizonylat betöltés', KeyType: Constants.KeyTypes.Fn },
    Delete: { KeyCode: KeyBindings.F8, KeyLabel: KeyBindings.F8, FunctionLabel: 'Törlés', KeyType: Constants.KeyTypes.Fn },
    CSV: { KeyCode: KeyBindings.F11, KeyLabel: KeyBindings.F11, FunctionLabel: 'Számológép', KeyType: Constants.KeyTypes.Fn },
    CloseAndSave: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Combo },

    // Unset:
    Save: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    ToggleForm: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Tétellap', KeyType: Constants.KeyTypes.Unset },
    JumpToForm: { KeyCode: KeyBindings.Tab, KeyLabel: KeyBindings.Tab, FunctionLabel: 'Ugrás tétellapra', KeyType: Constants.KeyTypes.Unset },
    ToggleAllDiscounts: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    SetGlobalDiscount: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    Print: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Nyomtatás', KeyType: Constants.KeyTypes.Unset },
    Email: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Email', KeyType: Constants.KeyTypes.Unset },
    Details: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    EscapeEditor1: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Lock: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Zárolás', KeyType: Constants.KeyTypes.Unset },
};

export let InvoiceIncomeManagerKeySettings: Constants.KeySettingsDct = {
    Help: { KeyCode: KeyBindings.F1, KeyLabel: KeyBindings.F1, FunctionLabel: 'Súgó', KeyType: Constants.KeyTypes.Fn },
    Search: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Fn },
    Create: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Partner / termék felvitel', KeyType: Constants.KeyTypes.Unset },
    // itt a lock van használva mert az Edit már foglalt
    Lock: { KeyCode: KeyBindings.F4, KeyLabel: KeyBindings.F4, FunctionLabel: 'Partner szerkesztése', KeyType: Constants.KeyTypes.Fn },
    Refresh: { KeyCode: KeyBindings.F5, KeyLabel: KeyBindings.F5, FunctionLabel: 'Készlet', KeyType: Constants.KeyTypes.Fn },
    Reset: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Bizonylat betöltés', KeyType: Constants.KeyTypes.Fn },
    Delete: { KeyCode: KeyBindings.F8, KeyLabel: KeyBindings.F8, FunctionLabel: 'Törlés', KeyType: Constants.KeyTypes.Fn },
    Edit: { KeyCode: KeyBindings.F9, KeyLabel: KeyBindings.F9, FunctionLabel: 'Árváltozás', KeyType: Constants.KeyTypes.Fn },
    CSV: { KeyCode: KeyBindings.F11, KeyLabel: KeyBindings.F11, FunctionLabel: 'Számológép', KeyType: Constants.KeyTypes.Fn },
    CloseAndSave: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Combo },

    // Unset:
    Save: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    ToggleForm: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Tétellap', KeyType: Constants.KeyTypes.Unset },
    JumpToForm: { KeyCode: KeyBindings.Tab, KeyLabel: KeyBindings.Tab, FunctionLabel: 'Ugrás tétellapra', KeyType: Constants.KeyTypes.Unset },
    ToggleAllDiscounts: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    SetGlobalDiscount: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    Print: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Nyomtatás', KeyType: Constants.KeyTypes.Unset },
    Email: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Email', KeyType: Constants.KeyTypes.Unset },
    Details: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    EscapeEditor1: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
};

export let SummaryInvoiceKeySettings: Constants.KeySettingsDct = {
    Help: { KeyCode: KeyBindings.F1, KeyLabel: KeyBindings.F1, FunctionLabel: 'Súgó', KeyType: Constants.KeyTypes.Fn },
    Search: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Fn },
    Create: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Partner felvitel', KeyType: Constants.KeyTypes.Fn },
    Edit: { KeyCode: KeyBindings.F4, KeyLabel: KeyBindings.F4, FunctionLabel: 'Partner szerkesztés', KeyType: Constants.KeyTypes.Fn },
    Refresh: { KeyCode: KeyBindings.F5, KeyLabel: KeyBindings.F5, FunctionLabel: 'Készlet', KeyType: Constants.KeyTypes.Fn },
    Delete: { KeyCode: KeyBindings.F8, KeyLabel: KeyBindings.F8, FunctionLabel: 'Törlés', KeyType: Constants.KeyTypes.Fn },
    CSV: { KeyCode: KeyBindings.F11, KeyLabel: KeyBindings.F11, FunctionLabel: 'Számológép', KeyType: Constants.KeyTypes.Fn },
    CloseAndSave: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Combo },

    // Unset:
    Reset: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Visszaállítás', KeyType: Constants.KeyTypes.Unset },
    Save: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    ToggleForm: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Tétellap', KeyType: Constants.KeyTypes.Unset },
    JumpToForm: { KeyCode: KeyBindings.Tab, KeyLabel: KeyBindings.Tab, FunctionLabel: 'Ugrás tétellapra', KeyType: Constants.KeyTypes.Unset },
    ToggleAllDiscounts: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    SetGlobalDiscount: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    Print: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Nyomtatás', KeyType: Constants.KeyTypes.Unset },
    Email: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Email', KeyType: Constants.KeyTypes.Unset },
    Details: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    EscapeEditor1: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Lock: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Zárolás', KeyType: Constants.KeyTypes.Unset },
};
export let MinusDeliveryNoteKeySettings: Constants.KeySettingsDct = {
    Help: { KeyCode: KeyBindings.F1, KeyLabel: KeyBindings.F1, FunctionLabel: 'Súgó', KeyType: Constants.KeyTypes.Fn },
    Search: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Fn },
    Refresh: { KeyCode: KeyBindings.F5, KeyLabel: KeyBindings.F5, FunctionLabel: 'Készlet', KeyType: Constants.KeyTypes.Fn },
    Delete: { KeyCode: KeyBindings.F8, KeyLabel: KeyBindings.F8, FunctionLabel: 'Törlés', KeyType: Constants.KeyTypes.Fn },
    CSV: { KeyCode: KeyBindings.F11, KeyLabel: KeyBindings.F11, FunctionLabel: 'Számológép', KeyType: Constants.KeyTypes.Fn },
    CloseAndSave: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Combo },

    // Unset:
    Create: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Partner felvitel', KeyType: Constants.KeyTypes.Unset },
    Edit: { KeyCode: KeyBindings.F4, KeyLabel: KeyBindings.F4, FunctionLabel: 'Partner szerkesztés', KeyType: Constants.KeyTypes.Unset },
    Reset: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Visszaállítás', KeyType: Constants.KeyTypes.Unset },
    Save: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    ToggleForm: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Tétellap', KeyType: Constants.KeyTypes.Unset },
    JumpToForm: { KeyCode: KeyBindings.Tab, KeyLabel: KeyBindings.Tab, FunctionLabel: 'Ugrás tétellapra', KeyType: Constants.KeyTypes.Unset },
    ToggleAllDiscounts: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    SetGlobalDiscount: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    Print: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Nyomtatás', KeyType: Constants.KeyTypes.Unset },
    Email: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Email', KeyType: Constants.KeyTypes.Unset },
    Details: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    EscapeEditor1: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Lock: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Zárolás', KeyType: Constants.KeyTypes.Unset },
};

export let InbetweenWarehouseKeySettings: Constants.KeySettingsDct = {
    Help: { KeyCode: KeyBindings.F1, KeyLabel: KeyBindings.F1, FunctionLabel: 'Súgó', KeyType: Constants.KeyTypes.Fn },
    Search: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Fn },
    Delete: { KeyCode: KeyBindings.F8, KeyLabel: KeyBindings.F8, FunctionLabel: 'Törlés', KeyType: Constants.KeyTypes.Fn },
    Details: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Bizonylatokhoz navigálás', KeyType: Constants.KeyTypes.Fn },
    CSV: { KeyCode: KeyBindings.F11, KeyLabel: KeyBindings.F11, FunctionLabel: 'Számológép', KeyType: Constants.KeyTypes.Fn },
    CloseAndSave: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Combo },

    // Unset:
    Create: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Partner felvitel', KeyType: Constants.KeyTypes.Unset },
    Refresh: { KeyCode: KeyBindings.F5, KeyLabel: KeyBindings.F5, FunctionLabel: 'Frissítés', KeyType: Constants.KeyTypes.Unset },
    Edit: { KeyCode: KeyBindings.F4, KeyLabel: KeyBindings.F4, FunctionLabel: 'Szerkesztés', KeyType: Constants.KeyTypes.Unset },
    Reset: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Visszaállítás', KeyType: Constants.KeyTypes.Unset },
    Save: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    ToggleForm: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Tétellap', KeyType: Constants.KeyTypes.Unset },
    JumpToForm: { KeyCode: KeyBindings.Tab, KeyLabel: KeyBindings.Tab, FunctionLabel: 'Ugrás tétellapra', KeyType: Constants.KeyTypes.Unset },
    ToggleAllDiscounts: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    SetGlobalDiscount: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    Email: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Email', KeyType: Constants.KeyTypes.Unset },
    Print: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    EscapeEditor1: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Lock: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Zárolás', KeyType: Constants.KeyTypes.Unset },
};

export let OfferNavKeySettings: Constants.KeySettingsDct = {
    Help: { KeyCode: KeyBindings.F1, KeyLabel: KeyBindings.F1, FunctionLabel: 'Súgó', KeyType: Constants.KeyTypes.Fn },
    Create: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Új felvitel', KeyType: Constants.KeyTypes.Fn },
    Edit: { KeyCode: KeyBindings.F4, KeyLabel: KeyBindings.F4, FunctionLabel: 'Szerkesztés', KeyType: Constants.KeyTypes.Fn },
    Refresh: { KeyCode: KeyBindings.F5, KeyLabel: KeyBindings.F5, FunctionLabel: 'Frissítés', KeyType: Constants.KeyTypes.Fn },
    Details: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Megjegyzés megtekintése', KeyType: Constants.KeyTypes.Fn },
    Delete: { KeyCode: KeyBindings.F8, KeyLabel: KeyBindings.F8, FunctionLabel: 'Törlés', KeyType: Constants.KeyTypes.Fn },
    ToggleForm: { KeyCode: KeyBindings.F9, KeyLabel: KeyBindings.F9, FunctionLabel: 'Árajánlat --> Számla', KeyType: Constants.KeyTypes.Fn },
    Print: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Nyomtatás', KeyType: Constants.KeyTypes.Fn },
    CSV: { KeyCode: KeyBindings.F11, KeyLabel: KeyBindings.F11, FunctionLabel: 'CSV', KeyType: Constants.KeyTypes.Fn },
    Email: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Email', KeyType: Constants.KeyTypes.Fn },

    // Unset
    Search: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Unset },
    CloseAndSave: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    ToggleAllDiscounts: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    SetGlobalDiscount: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    JumpToForm: { KeyCode: KeyBindings.Tab, KeyLabel: KeyBindings.Tab, FunctionLabel: 'Ugrás tétellapra', KeyType: Constants.KeyTypes.Unset },
    Reset: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Visszaállítás', KeyType: Constants.KeyTypes.Unset },
    Save: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    EscapeEditor1: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Lock: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Zárolás', KeyType: Constants.KeyTypes.Unset },
};

export let InvoiceNavKeySettings: Constants.KeySettingsDct = {
    Help: { KeyCode: KeyBindings.F1, KeyLabel: KeyBindings.F1, FunctionLabel: 'Súgó', KeyType: Constants.KeyTypes.Fn },
    Refresh: { KeyCode: KeyBindings.F5, KeyLabel: KeyBindings.F5, FunctionLabel: 'Frissítés', KeyType: Constants.KeyTypes.Fn },
    Print: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Bizonylatnyomtatás', KeyType: Constants.KeyTypes.Fn },
    CSV: { KeyCode: KeyBindings.F11, KeyLabel: KeyBindings.F11, FunctionLabel: 'CSV export', KeyType: Constants.KeyTypes.Fn },
    ToggleForm: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Tétellap', KeyType: Constants.KeyTypes.Fn },

    // Unset
    Create: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Új felvitel', KeyType: Constants.KeyTypes.Unset },
    Edit: { KeyCode: KeyBindings.F4, KeyLabel: KeyBindings.F4, FunctionLabel: 'Szerkesztés', KeyType: Constants.KeyTypes.Unset },
    Details: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Megjegyzés megtekintése', KeyType: Constants.KeyTypes.Unset },
    Delete: { KeyCode: KeyBindings.F8, KeyLabel: KeyBindings.F8, FunctionLabel: 'Törlés', KeyType: Constants.KeyTypes.Unset },
    Email: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Email', KeyType: Constants.KeyTypes.Unset },
    Search: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Unset },
    CloseAndSave: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    ToggleAllDiscounts: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    SetGlobalDiscount: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    JumpToForm: { KeyCode: KeyBindings.Tab, KeyLabel: KeyBindings.Tab, FunctionLabel: 'Ugrás tétellapra', KeyType: Constants.KeyTypes.Unset },
    Reset: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Visszaállítás', KeyType: Constants.KeyTypes.Unset },
    Save: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    EscapeEditor1: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Lock: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Zárolás', KeyType: Constants.KeyTypes.Unset },
};

export let InvRowNavKeySettings: Constants.KeySettingsDct = {
    Help: { KeyCode: KeyBindings.F1, KeyLabel: KeyBindings.F1, FunctionLabel: 'Súgó', KeyType: Constants.KeyTypes.Fn },
    Search: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Unset },
    Refresh: { KeyCode: KeyBindings.F5, KeyLabel: KeyBindings.F5, FunctionLabel: 'Frissítés', KeyType: Constants.KeyTypes.Fn },
    Delete: { KeyCode: KeyBindings.F8, KeyLabel: KeyBindings.F8, FunctionLabel: 'Törlés', KeyType: Constants.KeyTypes.Unset },
    Print: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Nyomtatás', KeyType: Constants.KeyTypes.Fn },
    CSV: { KeyCode: KeyBindings.F11, KeyLabel: KeyBindings.F11, FunctionLabel: 'CSV', KeyType: Constants.KeyTypes.Fn },

    // Unset
    Create: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Új felvitel', KeyType: Constants.KeyTypes.Unset },
    Email: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Email', KeyType: Constants.KeyTypes.Unset },
    Edit: { KeyCode: KeyBindings.F4, KeyLabel: KeyBindings.F4, FunctionLabel: 'Szerkesztés', KeyType: Constants.KeyTypes.Unset },
    Details: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Megjegyzés megtekintése', KeyType: Constants.KeyTypes.Unset },
    CloseAndSave: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    ToggleAllDiscounts: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    SetGlobalDiscount: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    JumpToForm: { KeyCode: KeyBindings.Tab, KeyLabel: KeyBindings.Tab, FunctionLabel: 'Ugrás tétellapra', KeyType: Constants.KeyTypes.Unset },
    ToggleForm: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Tétellap', KeyType: Constants.KeyTypes.Unset },
    Reset: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Visszaállítás', KeyType: Constants.KeyTypes.Unset },
    Save: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    EscapeEditor1: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Lock: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Zárolás', KeyType: Constants.KeyTypes.Unset },
};

export let StockNavKeySettings: Constants.KeySettingsDct = {
    Help: { KeyCode: KeyBindings.F1, KeyLabel: KeyBindings.F1, FunctionLabel: 'Súgó', KeyType: Constants.KeyTypes.Fn },
    Search: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Fn },
    Edit: { KeyCode: KeyBindings.F4, KeyLabel: KeyBindings.F4, FunctionLabel: 'Szerkesztés', KeyType: Constants.KeyTypes.Fn },
    Refresh: { KeyCode: KeyBindings.F5, KeyLabel: KeyBindings.F5, FunctionLabel: 'Frissítés', KeyType: Constants.KeyTypes.Fn },
    Details: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Készletkarton', KeyType: Constants.KeyTypes.Fn },
    ToggleForm: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Tétellap', KeyType: Constants.KeyTypes.Fn },

    // Unset
    Delete: { KeyCode: KeyBindings.F8, KeyLabel: KeyBindings.F8, FunctionLabel: 'Törlés', KeyType: Constants.KeyTypes.Unset },
    Create: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Új felvitel', KeyType: Constants.KeyTypes.Unset },
    Print: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Nyomtatás', KeyType: Constants.KeyTypes.Unset },
    CSV: { KeyCode: KeyBindings.F11, KeyLabel: KeyBindings.F11, FunctionLabel: 'CSV', KeyType: Constants.KeyTypes.Unset },
    Email: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Email', KeyType: Constants.KeyTypes.Unset },
    CloseAndSave: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    ToggleAllDiscounts: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    SetGlobalDiscount: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    JumpToForm: { KeyCode: KeyBindings.Tab, KeyLabel: KeyBindings.Tab, FunctionLabel: 'Ugrás tétellapra', KeyType: Constants.KeyTypes.Unset },
    Reset: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Visszaállítás', KeyType: Constants.KeyTypes.Unset },
    Save: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    EscapeEditor1: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Lock: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Zárolás', KeyType: Constants.KeyTypes.Unset },
};

export let StockCardNavKeySettings: Constants.KeySettingsDct = {
    Help: { KeyCode: KeyBindings.F1, KeyLabel: KeyBindings.F1, FunctionLabel: 'Súgó', KeyType: Constants.KeyTypes.Fn },
    Refresh: { KeyCode: KeyBindings.F5, KeyLabel: KeyBindings.F5, FunctionLabel: 'Frissítés', KeyType: Constants.KeyTypes.Fn },
    ToggleForm: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Tétellap', KeyType: Constants.KeyTypes.Fn },

    // Unset
    Delete: { KeyCode: KeyBindings.F8, KeyLabel: KeyBindings.F8, FunctionLabel: 'Törlés', KeyType: Constants.KeyTypes.Unset },
    Search: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Unset },
    Create: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Új felvitel', KeyType: Constants.KeyTypes.Unset },
    Edit: { KeyCode: KeyBindings.F4, KeyLabel: KeyBindings.F4, FunctionLabel: 'Szerkesztés', KeyType: Constants.KeyTypes.Unset },
    Details: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Megjegyzés megtekintése', KeyType: Constants.KeyTypes.Unset },
    Print: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Nyomtatás', KeyType: Constants.KeyTypes.Unset },
    CSV: { KeyCode: KeyBindings.F11, KeyLabel: KeyBindings.F11, FunctionLabel: 'CSV', KeyType: Constants.KeyTypes.Unset },
    Email: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Email', KeyType: Constants.KeyTypes.Unset },
    CloseAndSave: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    ToggleAllDiscounts: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    SetGlobalDiscount: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    JumpToForm: { KeyCode: KeyBindings.Tab, KeyLabel: KeyBindings.Tab, FunctionLabel: 'Ugrás tétellapra', KeyType: Constants.KeyTypes.Unset },
    Reset: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Visszaállítás', KeyType: Constants.KeyTypes.Unset },
    Save: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    EscapeEditor1: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Lock: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Zárolás', KeyType: Constants.KeyTypes.Unset },
};

export let OfferCreatorKeySettings: Constants.KeySettingsDct = {
    Help: { KeyCode: KeyBindings.F1, KeyLabel: KeyBindings.F1, FunctionLabel: 'Súgó', KeyType: Constants.KeyTypes.Fn },
    Search: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Fn },
    Create: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Partner / termék felvitel', KeyType: Constants.KeyTypes.Unset },
    Edit: { KeyCode: KeyBindings.F4, KeyLabel: KeyBindings.F4, FunctionLabel: 'Partner szerkesztés', KeyType: Constants.KeyTypes.Fn },
    Refresh: { KeyCode: KeyBindings.F5, KeyLabel: KeyBindings.F5, FunctionLabel: 'Készlet', KeyType: Constants.KeyTypes.Fn },
    ToggleAllDiscounts: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Kedvezmény mutatás összesre', KeyType: Constants.KeyTypes.Fn },
    SetGlobalDiscount: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Fn },
    Delete: { KeyCode: KeyBindings.F8, KeyLabel: KeyBindings.F8, FunctionLabel: 'Törlés', KeyType: Constants.KeyTypes.Fn },
    ToggleForm: { KeyCode: KeyBindings.F9, KeyLabel: KeyBindings.F9, FunctionLabel: 'Á.T. összesre', KeyType: Constants.KeyTypes.Fn },
    EscapeEditor1: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Átlépés Navigációba', KeyType: Constants.KeyTypes.Fn },
    CSV: { KeyCode: KeyBindings.F11, KeyLabel: KeyBindings.F11, FunctionLabel: 'Számológép', KeyType: Constants.KeyTypes.Fn },
    CloseAndSave: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Combo },

    // Unset
    JumpToForm: { KeyCode: KeyBindings.Tab, KeyLabel: KeyBindings.Tab, FunctionLabel: 'Ugrás tétellapra', KeyType: Constants.KeyTypes.Unset },
    Print: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Nyomtatás', KeyType: Constants.KeyTypes.Unset },
    Email: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Email', KeyType: Constants.KeyTypes.Unset },
    Reset: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Visszaállítás', KeyType: Constants.KeyTypes.Unset },
    Save: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Details: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Lock: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Zárolás', KeyType: Constants.KeyTypes.Unset },
};

export let InvCtrlItemCreatorKeySettings: Constants.KeySettingsDct = {
    Help: { KeyCode: KeyBindings.F1, KeyLabel: KeyBindings.F1, FunctionLabel: 'Súgó', KeyType: Constants.KeyTypes.Fn },
    Search: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Fn },
    Create: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Új termék', KeyType: Constants.KeyTypes.Fn },
    Refresh: { KeyCode: KeyBindings.F5, KeyLabel: KeyBindings.F5, FunctionLabel: 'Termék készletadatok', KeyType: Constants.KeyTypes.Fn },
    Delete: { KeyCode: KeyBindings.F8, KeyLabel: KeyBindings.F8, FunctionLabel: 'Törlés', KeyType: Constants.KeyTypes.Fn },
    CSV: { KeyCode: KeyBindings.F11, KeyLabel: KeyBindings.F11, FunctionLabel: 'Számológép', KeyType: Constants.KeyTypes.Fn },
    CloseAndSave: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Combo },

    // Unset
    ToggleAllDiscounts: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Kedvezmény mutatás összesre', KeyType: Constants.KeyTypes.Unset },
    SetGlobalDiscount: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    EscapeEditor1: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Átlépés Navigációba', KeyType: Constants.KeyTypes.Unset },
    JumpToForm: { KeyCode: KeyBindings.Tab, KeyLabel: KeyBindings.Tab, FunctionLabel: 'Ugrás tétellapra', KeyType: Constants.KeyTypes.Unset },
    Print: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Nyomtatás', KeyType: Constants.KeyTypes.Unset },
    Email: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Email', KeyType: Constants.KeyTypes.Unset },
    ToggleForm: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Tétellap', KeyType: Constants.KeyTypes.Unset },
    Edit: { KeyCode: KeyBindings.F4, KeyLabel: KeyBindings.F4, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Unset },
    Reset: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Visszaállítás', KeyType: Constants.KeyTypes.Unset },
    Save: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Details: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Lock: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Zárolás', KeyType: Constants.KeyTypes.Unset },
};

export let EqualizationCreatorKeySettings: Constants.KeySettingsDct = {
    Help: { KeyCode: KeyBindings.F1, KeyLabel: KeyBindings.F1, FunctionLabel: 'Súgó', KeyType: Constants.KeyTypes.Fn },
    Delete: { KeyCode: KeyBindings.F8, KeyLabel: KeyBindings.F8, FunctionLabel: 'Törlés', KeyType: Constants.KeyTypes.Fn },
    CloseAndSave: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Combo },
    
    // Unset
    Search: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Unset },
    Create: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Új termék', KeyType: Constants.KeyTypes.Unset },
    Refresh: { KeyCode: KeyBindings.F5, KeyLabel: KeyBindings.F5, FunctionLabel: 'Termék készletadatok', KeyType: Constants.KeyTypes.Unset },
    CSV: { KeyCode: KeyBindings.F11, KeyLabel: KeyBindings.F11, FunctionLabel: 'Számológép', KeyType: Constants.KeyTypes.Unset },
    ToggleAllDiscounts: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Kedvezmény mutatás összesre', KeyType: Constants.KeyTypes.Unset },
    SetGlobalDiscount: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    EscapeEditor1: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Átlépés Navigációba', KeyType: Constants.KeyTypes.Unset },
    JumpToForm: { KeyCode: KeyBindings.Tab, KeyLabel: KeyBindings.Tab, FunctionLabel: 'Ugrás tétellapra', KeyType: Constants.KeyTypes.Unset },
    Print: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Nyomtatás', KeyType: Constants.KeyTypes.Unset },
    Email: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Email', KeyType: Constants.KeyTypes.Unset },
    ToggleForm: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Tétellap', KeyType: Constants.KeyTypes.Unset },
    Edit: { KeyCode: KeyBindings.F4, KeyLabel: KeyBindings.F4, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Unset },
    Reset: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Visszaállítás', KeyType: Constants.KeyTypes.Unset },
    Save: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Details: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Lock: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Zárolás', KeyType: Constants.KeyTypes.Unset },
};

export let OfferEditorKeySettings: Constants.KeySettingsDct = {
    Help: { KeyCode: KeyBindings.F1, KeyLabel: KeyBindings.F1, FunctionLabel: 'Súgó', KeyType: Constants.KeyTypes.Fn },
    Search: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Ügyfél Keresés', KeyType: Constants.KeyTypes.Fn },
    Create: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Partner / termék felvitel', KeyType: Constants.KeyTypes.Unset },
    Refresh: { KeyCode: KeyBindings.F5, KeyLabel: KeyBindings.F5, FunctionLabel: 'Frissítés', KeyType: Constants.KeyTypes.Fn },
    ToggleAllDiscounts: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Kedvezmény mutatás összesre', KeyType: Constants.KeyTypes.Fn },
    SetGlobalDiscount: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Fn },
    Delete: { KeyCode: KeyBindings.F8, KeyLabel: KeyBindings.F8, FunctionLabel: 'Törlés', KeyType: Constants.KeyTypes.Fn },
    ToggleForm: { KeyCode: KeyBindings.F9, KeyLabel: KeyBindings.F9, FunctionLabel: 'Á.T. összesre', KeyType: Constants.KeyTypes.Fn },
    EscapeEditor1: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Visszalépés Navigációba', KeyType: Constants.KeyTypes.Fn },
    CSV: { KeyCode: KeyBindings.F11, KeyLabel: KeyBindings.F11, FunctionLabel: 'Számológép', KeyType: Constants.KeyTypes.Fn },
    CloseAndSave: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Combo },

    // Unset
    Print: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Nyomtatás', KeyType: Constants.KeyTypes.Unset },
    JumpToForm: { KeyCode: KeyBindings.Tab, KeyLabel: KeyBindings.Tab, FunctionLabel: 'Ugrás tétellapra', KeyType: Constants.KeyTypes.Unset },
    Email: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Email', KeyType: Constants.KeyTypes.Unset },
    Edit: { KeyCode: KeyBindings.F4, KeyLabel: KeyBindings.F4, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Unset },
    Reset: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Visszaállítás', KeyType: Constants.KeyTypes.Unset },
    Save: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Details: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Lock: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Zárolás', KeyType: Constants.KeyTypes.Unset },
};

export let CustDiscountKeySettings: Constants.KeySettingsDct = {
    Help: { KeyCode: KeyBindings.F1, KeyLabel: KeyBindings.F1, FunctionLabel: 'Súgó', KeyType: Constants.KeyTypes.Fn },
    Search: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Ügyfél / TCS Keresés', KeyType: Constants.KeyTypes.Fn },
    Create: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'TCS betöltés', KeyType: Constants.KeyTypes.Fn },
    ToggleAllDiscounts: { KeyCode: KeyBindings.F4, KeyLabel: KeyBindings.F4, FunctionLabel: 'Kedvezmények másolása', KeyType: Constants.KeyTypes.Fn },
    Refresh: { KeyCode: KeyBindings.F5, KeyLabel: KeyBindings.F5, FunctionLabel: 'Frissítés', KeyType: Constants.KeyTypes.Fn },
    SetGlobalDiscount: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Fn },
    Delete: { KeyCode: KeyBindings.F8, KeyLabel: KeyBindings.F8, FunctionLabel: 'Törlés', KeyType: Constants.KeyTypes.Fn },
    CSV: { KeyCode: KeyBindings.F11, KeyLabel: KeyBindings.F11, FunctionLabel: 'Számológép', KeyType: Constants.KeyTypes.Fn },
    CloseAndSave: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Combo },

    // Unset
    EscapeEditor1: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Visszalépés Navigációba', KeyType: Constants.KeyTypes.Unset },
    Print: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Nyomtatás', KeyType: Constants.KeyTypes.Unset },
    JumpToForm: { KeyCode: KeyBindings.Tab, KeyLabel: KeyBindings.Tab, FunctionLabel: 'Ugrás tétellapra', KeyType: Constants.KeyTypes.Unset },
    Email: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Email', KeyType: Constants.KeyTypes.Unset },
    ToggleForm: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Tétellap', KeyType: Constants.KeyTypes.Unset },
    Edit: { KeyCode: KeyBindings.F4, KeyLabel: KeyBindings.F4, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Unset },
    Reset: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Visszaállítás', KeyType: Constants.KeyTypes.Unset },
    Save: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Details: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Lock: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Zárolás', KeyType: Constants.KeyTypes.Unset },
};

export let GeneralFlatDesignKeySettings: Constants.KeySettingsDct = {
    Help: { KeyCode: KeyBindings.F1, KeyLabel: KeyBindings.F1, FunctionLabel: 'Súgó', KeyType: Constants.KeyTypes.Fn},
    Search: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Fn },
    Create: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Új felvitel', KeyType: Constants.KeyTypes.Fn },
    Edit: { KeyCode: KeyBindings.F4, KeyLabel: KeyBindings.F4, FunctionLabel: 'Szerkesztés', KeyType: Constants.KeyTypes.Fn },
    Refresh: { KeyCode: KeyBindings.F5, KeyLabel: KeyBindings.F5, FunctionLabel: 'Frissítés', KeyType: Constants.KeyTypes.Fn },
    Reset: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Visszaállítás', KeyType: Constants.KeyTypes.Fn },
    Delete: { KeyCode: KeyBindings.F8, KeyLabel: KeyBindings.F8, FunctionLabel: 'Törlés', KeyType: Constants.KeyTypes.Fn },
    CSV: { KeyCode: KeyBindings.F11, KeyLabel: KeyBindings.F11, FunctionLabel: 'Számológép', KeyType: Constants.KeyTypes.Fn },
    ToggleForm: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Tétellap', KeyType: Constants.KeyTypes.Fn },

    // Unset
    EscapeEditor1: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Visszalépés Navigációba', KeyType: Constants.KeyTypes.Unset },
    CloseAndSave: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    ToggleAllDiscounts: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Kedvezmény mutatás összesre', KeyType: Constants.KeyTypes.Unset },
    SetGlobalDiscount: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    Print: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Nyomtatás', KeyType: Constants.KeyTypes.Unset },
    JumpToForm: { KeyCode: KeyBindings.Tab, KeyLabel: KeyBindings.Tab, FunctionLabel: 'Ugrás tétellapra', KeyType: Constants.KeyTypes.Unset },
    Email: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Email', KeyType: Constants.KeyTypes.Unset },
    Save: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Details: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Lock: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Zárolás', KeyType: Constants.KeyTypes.Unset },
};

export let CustomerInvoiceSummaryKeySettings: Constants.KeySettingsDct = {
    Help: { KeyCode: KeyBindings.F1, KeyLabel: KeyBindings.F1, FunctionLabel: 'Súgó', KeyType: Constants.KeyTypes.Fn },
    Search: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Partner Keresés', KeyType: Constants.KeyTypes.Fn },
    Refresh: { KeyCode: KeyBindings.F5, KeyLabel: KeyBindings.F5, FunctionLabel: 'Frissítés', KeyType: Constants.KeyTypes.Fn },
    Print: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Nyomtatás', KeyType: Constants.KeyTypes.Fn },
    ToggleForm: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Tétellap', KeyType: Constants.KeyTypes.Fn },

    // Unset
    Delete: { KeyCode: KeyBindings.F8, KeyLabel: KeyBindings.F8, FunctionLabel: 'Törlés', KeyType: Constants.KeyTypes.Unset },
    CSV: { KeyCode: KeyBindings.F11, KeyLabel: KeyBindings.F11, FunctionLabel: 'Véglegesítés', KeyType: Constants.KeyTypes.Unset },
    Edit: { KeyCode: KeyBindings.F4, KeyLabel: KeyBindings.F4, FunctionLabel: 'Szerkesztés', KeyType: Constants.KeyTypes.Unset },
    Create: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Új felvitel', KeyType: Constants.KeyTypes.Unset },
    Reset: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Visszaállítás', KeyType: Constants.KeyTypes.Unset },
    EscapeEditor1: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Visszalépés Navigációba', KeyType: Constants.KeyTypes.Unset },
    CloseAndSave: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    ToggleAllDiscounts: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Kedvezmény mutatás összesre', KeyType: Constants.KeyTypes.Unset },
    SetGlobalDiscount: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    JumpToForm: { KeyCode: KeyBindings.Tab, KeyLabel: KeyBindings.Tab, FunctionLabel: 'Ugrás tétellapra', KeyType: Constants.KeyTypes.Unset },
    Email: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Email', KeyType: Constants.KeyTypes.Unset },
    Save: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Details: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Lock: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Zárolás', KeyType: Constants.KeyTypes.Unset },
};

export let WarehouseDocumentsKeySettings: Constants.KeySettingsDct = {
    Help: { KeyCode: KeyBindings.F1, KeyLabel: KeyBindings.F1, FunctionLabel: 'Súgó', KeyType: Constants.KeyTypes.Fn },
    Edit: { KeyCode: KeyBindings.F4, KeyLabel: KeyBindings.F4, FunctionLabel: 'Szerkesztés', KeyType: Constants.KeyTypes.Fn },
    Refresh: { KeyCode: KeyBindings.F5, KeyLabel: KeyBindings.F5, FunctionLabel: 'Frissítés', KeyType: Constants.KeyTypes.Fn },
    Reset: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Részletek', KeyType: Constants.KeyTypes.Fn },
    Delete: { KeyCode: KeyBindings.F8, KeyLabel: KeyBindings.F8, FunctionLabel: 'Törlés', KeyType: Constants.KeyTypes.Fn },
    Print: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Nyomtatás', KeyType: Constants.KeyTypes.Fn },
    Lock: { KeyCode: KeyBindings.F11, KeyLabel: KeyBindings.F11, FunctionLabel: 'Feldolgozás/véglegesítés', KeyType: Constants.KeyTypes.Unset },
    ToggleForm: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Tétellap', KeyType: Constants.KeyTypes.Fn },

    // Unset
    CSV: { KeyCode: KeyBindings.F11, KeyLabel: KeyBindings.F11, FunctionLabel: 'Véglegesítés', KeyType: Constants.KeyTypes.Unset },
    Search: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Unset },
    Create: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Új felvitel', KeyType: Constants.KeyTypes.Unset },
    EscapeEditor1: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Visszalépés Navigációba', KeyType: Constants.KeyTypes.Unset },
    CloseAndSave: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    ToggleAllDiscounts: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Kedvezmény mutatás összesre', KeyType: Constants.KeyTypes.Unset },
    SetGlobalDiscount: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    JumpToForm: { KeyCode: KeyBindings.Tab, KeyLabel: KeyBindings.Tab, FunctionLabel: 'Ugrás tétellapra', KeyType: Constants.KeyTypes.Unset },
    Email: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Email', KeyType: Constants.KeyTypes.Unset },
    Save: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Details: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
};

export let UnbalancedInvoicesNavigationManagerComponentKeySettings: Constants.KeySettingsDct = {
    Help: { KeyCode: KeyBindings.F1, KeyLabel: KeyBindings.F1, FunctionLabel: 'Súgó', KeyType: Constants.KeyTypes.Fn },
    Refresh: { KeyCode: KeyBindings.F5, KeyLabel: KeyBindings.F5, FunctionLabel: 'Frissítés', KeyType: Constants.KeyTypes.Fn },
    
    // Unset
    ToggleForm: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Tétellap', KeyType: Constants.KeyTypes.Unset },
    Delete: { KeyCode: KeyBindings.F8, KeyLabel: KeyBindings.F8, FunctionLabel: 'Törlés', KeyType: Constants.KeyTypes.Unset },
    Reset: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Részletek', KeyType: Constants.KeyTypes.Unset },
    Edit: { KeyCode: KeyBindings.F4, KeyLabel: KeyBindings.F4, FunctionLabel: 'Szerkesztés', KeyType: Constants.KeyTypes.Unset },
    Print: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Nyomtatás', KeyType: Constants.KeyTypes.Unset },
    Lock: { KeyCode: KeyBindings.F11, KeyLabel: KeyBindings.F11, FunctionLabel: 'Feldolgozás/véglegesítés', KeyType: Constants.KeyTypes.Unset },
    CSV: { KeyCode: KeyBindings.F11, KeyLabel: KeyBindings.F11, FunctionLabel: 'Véglegesítés', KeyType: Constants.KeyTypes.Unset },
    Search: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Unset },
    Create: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Új felvitel', KeyType: Constants.KeyTypes.Unset },
    EscapeEditor1: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Visszalépés Navigációba', KeyType: Constants.KeyTypes.Unset },
    CloseAndSave: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    ToggleAllDiscounts: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Kedvezmény mutatás összesre', KeyType: Constants.KeyTypes.Unset },
    SetGlobalDiscount: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    JumpToForm: { KeyCode: KeyBindings.Tab, KeyLabel: KeyBindings.Tab, FunctionLabel: 'Ugrás tétellapra', KeyType: Constants.KeyTypes.Unset },
    Email: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Email', KeyType: Constants.KeyTypes.Unset },
    Save: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Details: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
};

export let EqualizationNavigationManagerComponentKeySettings: Constants.KeySettingsDct = {
    Help: { KeyCode: KeyBindings.F1, KeyLabel: KeyBindings.F1, FunctionLabel: 'Súgó', KeyType: Constants.KeyTypes.Fn },
    Refresh: { KeyCode: KeyBindings.F5, KeyLabel: KeyBindings.F5, FunctionLabel: 'Frissítés', KeyType: Constants.KeyTypes.Fn },
    ToggleForm: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Tétellap', KeyType: Constants.KeyTypes.Fn },
    
    // Unset
    Delete: { KeyCode: KeyBindings.F8, KeyLabel: KeyBindings.F8, FunctionLabel: 'Törlés', KeyType: Constants.KeyTypes.Unset },
    Reset: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Részletek', KeyType: Constants.KeyTypes.Unset },
    Edit: { KeyCode: KeyBindings.F4, KeyLabel: KeyBindings.F4, FunctionLabel: 'Szerkesztés', KeyType: Constants.KeyTypes.Unset },
    Print: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Nyomtatás', KeyType: Constants.KeyTypes.Unset },
    Lock: { KeyCode: KeyBindings.F11, KeyLabel: KeyBindings.F11, FunctionLabel: 'Feldolgozás/véglegesítés', KeyType: Constants.KeyTypes.Unset },
    CSV: { KeyCode: KeyBindings.F11, KeyLabel: KeyBindings.F11, FunctionLabel: 'Véglegesítés', KeyType: Constants.KeyTypes.Unset },
    Search: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Unset },
    Create: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: 'Új felvitel', KeyType: Constants.KeyTypes.Unset },
    EscapeEditor1: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Visszalépés Navigációba', KeyType: Constants.KeyTypes.Unset },
    CloseAndSave: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    ToggleAllDiscounts: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Kedvezmény mutatás összesre', KeyType: Constants.KeyTypes.Unset },
    SetGlobalDiscount: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    JumpToForm: { KeyCode: KeyBindings.Tab, KeyLabel: KeyBindings.Tab, FunctionLabel: 'Ugrás tétellapra', KeyType: Constants.KeyTypes.Unset },
    Email: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Email', KeyType: Constants.KeyTypes.Unset },
    Save: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Details: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
};

export const PricePreviewKeySettings: Constants.KeySettingsDct = {
    Help: { KeyCode: KeyBindings.F1, KeyLabel: KeyBindings.F1, FunctionLabel: 'Súgó', KeyType: Constants.KeyTypes.Fn },
    Edit: { KeyCode: KeyBindings.F4, KeyLabel: KeyBindings.F4, FunctionLabel: 'Szerkesztés', KeyType: Constants.KeyTypes.Fn },
    ToggleForm: { KeyCode: KeyBindings.F5, KeyLabel: KeyBindings.F5, FunctionLabel: 'Készlet', KeyType: Constants.KeyTypes.Fn },
    Delete: { KeyCode: KeyBindings.F8, KeyLabel: KeyBindings.F8, FunctionLabel: 'Törlés', KeyType: Constants.KeyTypes.Fn },
    Refresh: { KeyCode: KeyBindings.F9, KeyLabel: KeyBindings.F9, FunctionLabel: 'Árak frissítése', KeyType: Constants.KeyTypes.Fn},
    CSV: { KeyCode: KeyBindings.F11, KeyLabel: KeyBindings.F11, FunctionLabel: 'Számológép', KeyType: Constants.KeyTypes.Fn },
    CloseAndSave: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Fn },

    // Unset
    Search: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: '', KeyType: Constants.KeyTypes.Unset },
    Create: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: '', KeyType: Constants.KeyTypes.Unset },
    Reset: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: '', KeyType: Constants.KeyTypes.Unset },
    EscapeEditor1: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: '', KeyType: Constants.KeyTypes.Unset },
    ToggleAllDiscounts: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Kedvezmény mutatás összesre', KeyType: Constants.KeyTypes.Unset },
    SetGlobalDiscount: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    Print: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Nyomtatás', KeyType: Constants.KeyTypes.Unset },
    JumpToForm: { KeyCode: KeyBindings.Tab, KeyLabel: KeyBindings.Tab, FunctionLabel: 'Ugrás tétellapra', KeyType: Constants.KeyTypes.Unset },
    Email: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Email', KeyType: Constants.KeyTypes.Unset },
    Save: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Details: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Lock: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Zárolás', KeyType: Constants.KeyTypes.Unset },
}

export const CorrectionInvoiceKeySettings: Constants.KeySettingsDct = {
    Help: { KeyCode: KeyBindings.F1, KeyLabel: KeyBindings.F1, FunctionLabel: 'Súgó', KeyType: Constants.KeyTypes.Fn },
    Search: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Fn },
    Refresh: { KeyCode: KeyBindings.F5, KeyLabel: KeyBindings.F5, FunctionLabel: 'Készlet', KeyType: Constants.KeyTypes.Fn },
    Delete: { KeyCode: KeyBindings.F8, KeyLabel: KeyBindings.F8, FunctionLabel: 'Törlés', KeyType: Constants.KeyTypes.Fn },
    CSV: { KeyCode: KeyBindings.F11, KeyLabel: KeyBindings.F11, FunctionLabel: 'Számológép', KeyType: Constants.KeyTypes.Fn },
    CloseAndSave: { KeyCode: KeyBindings.CtrlEnter, KeyLabel: KeyBindings.CtrlEnter, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Fn },

    // Unset
    Create: { KeyCode: KeyBindings.F3, KeyLabel: KeyBindings.F3, FunctionLabel: '', KeyType: Constants.KeyTypes.Unset },
    Edit: { KeyCode: KeyBindings.F4, KeyLabel: KeyBindings.F4, FunctionLabel: '', KeyType: Constants.KeyTypes.Unset },
    Reset: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: '', KeyType: Constants.KeyTypes.Unset },
    ToggleForm: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: '', KeyType: Constants.KeyTypes.Unset },
    EscapeEditor1: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: '', KeyType: Constants.KeyTypes.Unset },
    ToggleAllDiscounts: { KeyCode: KeyBindings.F6, KeyLabel: KeyBindings.F6, FunctionLabel: 'Kedvezmény mutatás összesre', KeyType: Constants.KeyTypes.Unset },
    SetGlobalDiscount: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Kedvezmény összesre', KeyType: Constants.KeyTypes.Unset },
    Print: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Nyomtatás', KeyType: Constants.KeyTypes.Unset },
    JumpToForm: { KeyCode: KeyBindings.Tab, KeyLabel: KeyBindings.Tab, FunctionLabel: 'Ugrás tétellapra', KeyType: Constants.KeyTypes.Unset },
    Email: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Email', KeyType: Constants.KeyTypes.Unset },
    Save: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Details: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Mentés', KeyType: Constants.KeyTypes.Unset },
    Lock: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Zárolás', KeyType: Constants.KeyTypes.Unset },
}

export function IsKeyFunctionKey(keyVal: string): boolean {
    for (let key in GeneralFlatDesignKeySettings) {
        let keyRow = GeneralFlatDesignKeySettings[key as keyof Constants.KeySettingsDct];
        if (keyRow.KeyLabel === keyVal) {
            return true;
        }
    }
    return false;
}

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

export function GetUpdatedKeySettings(keySettings: Constants.KeySettingsDct, row: Constants.KeySettingRow, action?: Actions): Constants.KeySettingsDct {
    let k = { ...keySettings };
    if (action !== undefined) {
        k[action] = row;
    } else {
        for (let key in k) {
            let keyRow = k[key as keyof Constants.KeySettingsDct];
            if (keyRow.KeyCode === row.KeyCode) {
                k[key as keyof Constants.KeySettingsDct] = row;
            }
        }
    }
    return k;
}

export function EqualRows(row1: Constants.KeySettingRow, row2: Constants.KeySettingRow): boolean {
    return row1.AlternativeKeyCode == row2.AlternativeKeyCode
        && row1.FunctionLabel == row2.FunctionLabel && row1.KeyCode == row2.KeyCode
        && row1.KeyLabel == row2.KeyLabel && row1.KeyType == row2.KeyType;
}