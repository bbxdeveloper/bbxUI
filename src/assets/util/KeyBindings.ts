import { Constants } from "./Constants";

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
    F9 = 'F9',
    F10 = 'F10',
    F11 = 'F11',
    F12 = 'F12',
    Tab = 'Tab',
    // QUICK CRUD
    crudNew = F8,
    crudEdit = F7,
    crudReset = F9,
    crudSave = F10,
    crudDelete = F11,
};

export enum Actions {
    TableSearch = 'TableSearch',
    CrudNew = 'CrudNew',
    CrudEdit = 'CrudEdit',
    CrudReset = 'CrudReset',
    CrudSave = 'CrudSave',
    CrudDelete = 'CrudDelete',
    OpenForm = 'OpenForm',
}

export let CrudManagerKeySettings: Constants.KeySettingsDct = {
    TableSearch: { KeyCode: KeyBindings.F2, KeyLabel: KeyBindings.F2, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Fn },
    CrudNew: { KeyCode: KeyBindings.F8, KeyLabel: KeyBindings.F8, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Fn },
    CrudEdit: { KeyCode: KeyBindings.F7, KeyLabel: KeyBindings.F7, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Fn },
    CrudReset: { KeyCode: KeyBindings.F9, KeyLabel: KeyBindings.F9, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Fn },
    CrudSave: { KeyCode: KeyBindings.F10, KeyLabel: KeyBindings.F10, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Fn },
    CrudDelete: { KeyCode: KeyBindings.F11, KeyLabel: KeyBindings.F11, FunctionLabel: 'Keresés', KeyType: Constants.KeyTypes.Fn },
    OpenForm: { KeyCode: KeyBindings.F12, KeyLabel: KeyBindings.F12, FunctionLabel: 'Tétellap', KeyType: Constants.KeyTypes.Fn },
};