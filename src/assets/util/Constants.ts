import { NbIconConfig, NbToastrConfig } from "@nebular/theme";
import { Observable } from "rxjs";
import { ProcessStatus } from "../model/ProcessStatus";
import { Actions, KeyBindings } from "./KeyBindings";
import { createMask } from "@ngneat/input-mask";
import { AngularEditorConfig } from '@kolkov/angular-editor';

export module Constants {
    // Messages
    export const MSG_ERROR_DATE_OUT_OF_RANGE: string = 'A dátum a megadott értékhatáron kívülre esik.'
    export const MSG_ERROR_INVALID_FORM: string = 'Az űrlap hibásan van kitöltve.'
    export const MSG_ERROR_NEED_AT_LEAST_ONE_VALID_RECORD = 'Legalább egy érvényesen megadott tétel szükséges a mentéshez.'
    export const MSG_ERROR_WRONG_QUANTITY_ONE_OR_MORE = 'Egy vagy több tétel mezői hibásan (például: rossz mennyisség) vannak kitöltve.'

    export const OutgoingIncomingInvoiceDefaultPrintCopy: number = 2

    export const MSG_ERROR_USERDATA_NEEDED = 'A mentés előtt érvényes bejelentkezési adatok megadása szükséges!'
    export const MSG_ERROR_TAX_PAYER_NUMBER_IS_EMPTY = 'Adóalany ügyfélnek a számlázáshoz kötelező adószámot megadni!'

    export const MSG_MAXIMUM_QUANTITY_REACHED: string = 'A megadott mennyiség nagyobb az elérhető mennyiségnél.'
    export const MSG_CANNOT_BE_LOWER_THAN_ZERO: string = 'A mennyiségnek nagyobbnak kell lennie nullánál.'
    export const MSG_ERROR_PRICE_IS_LESS_THAN_LATEST_SUPPLY_PRICE = 'Beszerzési ár alatt nem lehet eladni!'

    export const MSG_CONFIRMATION_CUSTOMER_LOCK_RELEASE = 'Elvégezhető a zárolt partnerek feloldása?'
    export const MSG_CONFIRMATION_QUIT: string = "Biztosan szeretne kiléni az alkalmazásból?";
    export const MSG_CONFIRMATION_FILTER_DELETE: string = "Szeretné törölni keresés szövegét? Előfordulhat az új vagy frissített elem nem lesz látható mellette.";
    export const MSG_CONFIRMATION_DELETE: string = "Biztosan végre szeretné hajtani a törlést?";
    export const MSG_CONFIRMATION_DELETE_PARAM: string = "Biztosan végre szeretné hajtani a(z) {0} elem törlését?";
    export const MSG_CONFIRMATION_LOCK: string = "Biztosan végre szeretné hajtani a zárást?";
    export const MSG_CONFIRMATION_LOCK_PARAM: string = "Biztosan végre szeretné hajtani a(z) {0} elem zárását?";
    export const MSG_CONFIRMATION_SAVE: string = "El szeretné menteni?";
    export const MSG_CONFIRMATION_SAVE_PARAM: string = "El szeretné menteni a(z) {0} elemet vagy annak változásait?";
    export const MSG_CONFIRMATION_SAVE_DATA: string = "Adatok mentése?";
    export const MSG_CONFIRMATION_SAVE_INVOICE: string = "Menthető a bizonylat?";
    export const MSG_CONFIRMATION_DELETE_OFFER: string = "Biztosan törölni szeretné az ajánlatot?";
    export const MSG_CONFIRMATION_COPY_CUST_DISCOUNTS: string = "Biztosan felül szeretné írni a kedvezményeket a választott partnerével?";
    export const MSG_CONFIRMATION_PRINT: string = "Biztosan el szeretné végezni a nyomtatást?";
    export const MSG_INVALID_FILTER_FORM: string = "Hiányos vagy hibásan kitöltött mezők vannak a szűrőben!";
    export const MSG_LOAD_REMAINING_TSC: string = "Biztos be szeretné tölteni a még nem kiválasztott termékcsoportokat?";
    export const MSG_CANNOT_ON_EDIT_ROW: string = "A kijelölt sor új elemek felvételére alkalmas! A kért művelet nem végezhető el rajta.";
    export const MSG_WHS_ONLY_READY_CAN_BE_FINALIZED = "Csak 'Elkészült' státuszban lévő raktárközi bizonylatokat lehet véglegesíteni!"
    export const MSG_INVALID_CREDENTIALS: string = 'Helytelen felhasználónév vagy jelszó.'

    export const MSG_ERROR_NO_DISCOUNT: string = 'A termékre engedmény tiltás van beállítva!'
    export const MSG_ERROR_NO_WAREHOUSE_SELECTED = "Nincs kiválasztott raktár. A művelethez bejelentkezés szükséges!"
    export const MSG_ERROR_NO_PRODUCT_SELECTED = "Nincs kiválasztott termék!"
    export const MSG_ERROR_NO_PRODUCTSTOCK_AVAILABLE = "Nincs elérhető készletinformáció ehhez a termékhez!"
    export const MSG_ERROR_NO_PRODUCTSTOCK_AVAILABLE_FOR_WAREHOUSE = "Nincs elérhető készletinformáció ehhez a termékhez erre a raktárra!"
    export const MSG_ERROR_CUSTOMER_LOCKED = 'Partner adatait más munkahelyen használják.'

    export const MSG_ERROR_PRODUCT_FA_NOT_AVAILABLE_IN_CUSTOMER = 'A {0} termék fordított áfás, de a partnernak ez nem engedélyezett'

    export const MSG_ERROR_NO_OPENED_INVENTORY_PERIOD = 'Nincs nyitott leltáridőszak megadva!'

    export const MSG_NO_DEFAULT_WAREHOUSE_FOR_USER = 'Nincs megadva alapértelmezett raktár a felhasználóhoz!'

    export const WAREHOUSEDOCUMENT_TITLE_FINALIZE_DATE = 'Véglegesítés dátuma'
    export const WAREHOUSEDOCUMENT_TITLE_FINALIZE_DATE_PARAM = 'Véglegesítés dátuma a(z) {0} elemre'
    export const WAREHOUSEDOCUMENT_MSG_DELETE_PARAM = 'Törölhető a {0} raktárközi átadás bizonylat?'
    export const WAREHOUSEDOCUMENT_MSG_CANNOT_EDIT = 'Csak abban a raktárban lehet elvégezni a raktárközi bizonylat módosítását, amelyből a kiadás megtörtént.'
    export const WAREHOUSEDOCUMENT_MSG_CANNOT_SAVE = 'Csak a bevétel raktár véglegesítheti.'

    export const NAV_INVOICE_SENT = 'A {{invoice-number}} bizonylat NAV küldésre előkészítve'
    export const NAV_INVOICE_CANCELLED = 'A {{invoice-number}} bizonylat technikai visszavonása elindítva. A visszavonást a NAV Online Számla felületén meg kell erősíteni'

    export const TITLE_ERROR: string = 'Hiba';
    export const TITLE_WARNING: string = 'Figyelmeztetés';
    export const TITLE_INFO: string = 'Információ';

    export const TITLE_PRINT_INVOICE = 'Bizonylat nyomtatása'
    export const TITLE_PRINT_INVOICE_2 = 'Számla nyomtatása'
    export const TITLE_PRINT_QUESTION = 'Nyomtatás indítása?'
    export const TITLE_PRINT_FINISHED = 'A nyomtatás rendben megtörtént!'

    export const TITLE_OFFER_TO_INVOICE_CONFIRMATION = 'Ajánlatból bizonylat generálása?'

    export const ERROR_OFFER_TO_INVOICE_PRODUCTS_NOT_FOUND = 'Az alábbi termékek nem lettek betöltve: '

    /**
     * Margin for print dialog on invoice pages. Provides enough
     * margin to make the number of the saved invoice visible.
     */
    export const INVOICE_PRINT_DIALOG_MARGIN_CLASS = 'general-margin-top-200'

    export const MSG_EMAIL_SUCCESFUL: string = 'Email sikeresen elküldve!'
    export const MSG_CUSTOMER_UPDATE_SUCCESFUL: string = 'Ügyfél sikeresen frissítve!'
    export const MSG_CUSTOMER_UPDATE_FAILED: string = 'Ügyfél frissítése sikertelen!'
    export const MSG_CUSTOMER_MISSING_OFFER_NAV: string = 'Az email küldéshez egy árajánlat kiválasztása szükséges.';

    export const MSG_USER_GET_FAILED: string = 'Felhasználó lekérése sikertelen! Név: '

    export const MSG_USER_MUST_BE_CHOSEN: string = 'Nincs ügyfél kiválasztva!';
    export const MSG_DISCOUNT_CUSTOMER_MUST_BE_CHOSEN: string = 'Partnerkedvezmény felhasználásához egy vevőt szükséges választani előbb!';

    export const MSG_SAVE_SUCCESFUL: string = 'Sikeres mentés!'
    export const MSG_DELETE_SUCCESFUL: string = 'Sikeres törlés!'

    export const MSG_WHS_PROCESS_SUCCESFUL: string = 'Sikeres véglegesítés!'

    export const MSG_ERROR_CUSTOMER_NOT_FOUND_BY_TAX_ID = 'Az adószám keresés nem talált eredményt a NAV adatbázisában!'

    export const MSG_NO_PRODUCT_FOUND: string = 'Nincs a begépelt kódnak megfelelő termék! Kérem próbálja meg a keresőablak használatával.';
    export const MSG_NO_PRODUCT_GROUP_FOUND: string = 'Nincs a begépelt kódnak megfelelő termékcsoport! Kérem próbálja meg a keresőablak használatával.';
    export const MSG_PRODUCT_ALREADY_THERE: string = 'Ez a termék már szerepel a felvett tételek között.';
    export const MSG_PRODUCT_GROUP_ALREADY_THERE: string = 'Ez a termékcsoport már szerepel a felvett tételek között.';

    export const MSG_LOGIN_SUCCESFUL: string = 'Sikeres bejelentkezés!'
    export const MSG_LOGIN_FAILED: string = 'Sikertelen bejelentkezés!'
    export const MSG_LOGOUT_SUCCESFUL: string = 'Sikeres kijelentkezés!'
    export const MSG_LOGOUT_FAILED: string = 'Sikertelen kijelentkezés!'

    export const MSG_LOGOUT_CONFIGM: string = 'Biztos ki szeretne jelentkezni?';

    export const MSG_WARNING_CUSTDISCOUNT_PREV: string = 'Figyelem: A tétellapon engedményes ár szerepel!';

    export const MSG_PRINT_ONLY_WHEN_ROW_SELECTED = "Csak aktívan kijelölt rekord mellett lehet nyomtatni!"

    export const MSG_ERROR_WAREHOUSE_DOCUMENT_FINALIZE_DIFFERENT_WAREHOUSES = "Csak aktuális raktárba irányuló raktárközi átadsás véglegesíthető!"
    export const MSG_ERROR_WAREHOUSE_DOCUMENT_EDIT_COMPLETED = "Feldolgozott státuszú bizonylatok nem szerkeszthetőek!"

    export const TOASTR_SUCCESS: Partial<NbToastrConfig> =
        { duration: 0, status: 'primary' };
    export const TOASTR_ERROR: Partial<NbToastrConfig> =
        { duration: 0, status: 'danger' };

    export const TOASTR_SUCCESS_5_SEC: Partial<NbToastrConfig> =
        { duration: 5000, status: 'primary' };
    export const TOASTR_ERROR_5_SEC: Partial<NbToastrConfig> =
        { duration: 5000, status: 'danger' };

    export const ProductCodePatterns = {
        A: { pattern: new RegExp('[a-zA-Z0-9áéiíoóöőuúüűÁÉIÍOÓÖŐUÚÜŰä+?%=! ():.,;°~*&#@{}]') },
        C: { pattern: new RegExp('[a-zA-Z0-9áéiíoóöőuúüűÁÉIÍOÓÖŐUÚÜŰä+?%=! ():.,;°~*&#@{}\-]') }
    };
    export const ProductCodeMask = "AAA-ACCCCCCCCCCCCCCCCCCCCCCCCC";
    export const CustDiscountCodeMask = "CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC";

    export const ProductCodeMaskNew = createMask({
        autoUnmask: true,
        casing: 'upper',
        mask: 'A{3}-C{0,26}',
        placeholder: ' ',
        definitions: {
            'A': {
                validator: '[a-zA-Z0-9áéiíoóöőuúüűÁÉIÍOÓÖŐUÚÜŰä+?%=! ():.,;°~*&#@{}]',
            },
            'C': {
                validator: '[a-zA-Z0-9áéiíoóöőuúüűÁÉIÍOÓÖŐUÚÜŰä+?%=! ():.,;°~*&#@{}\-]',
            },
        },
        // autoUnmask removes the dash (-) but we need it so we have to put it back
        onUnMask: (maskedValue, unmaskedValue) => {
            if (unmaskedValue.length === 3) {
                return unmaskedValue + '-'
            }
            else if (unmaskedValue.length >= 4) {
                return unmaskedValue.slice(0, 3) + '-' + unmaskedValue.slice(3)
            }

            return unmaskedValue
        }
    })

    // This won't work! Characters like '/' will appear as empty string at validator checks!
    // export const CounterSuffixMaskPattern = {
    //     A: { pattern: new RegExp('[a-zA-Z0-9áéiíoóöőuúüűÁÉIÍOÓÖŐUÚÜŰä+?%=! ():.,;°~*&#@{}\/]') }
    // }
    // For custom required check
    export const ConuterSuffixCharacters = 'a-zA-Z0-9áéiíoóöőuúüűÁÉIÍOÓÖŐUÚÜŰä+?%=! ():.,;°~*&#@{}/-'

    export const SearchInputId = 'active-prod-search'

    // Util

    export enum FileExtensions {
        PDF = "pdf",
        CSV = "csv",
        UNKNOWN = "unknown"
    }

    export enum CommandType {
        POC_REPORT,
        PRINT_REPORT,
        PRINT_POC_GRADES,
        PRINT_INVOICE,
        ERROR,
        PRINT_OFFER,
        PRINT_GENERIC,
        DOWNLOAD_OFFER_NAV_CSV,
        DOWNLOAD_BLOB
    }

    export enum DataOperation {
        PRINT_BLOB,
        DOWNLOAD_BLOB
    }

    export enum FormState {
        new, default
    }

    export enum KeyTypes {
        Fn, Default, Combo, Unset
    }

    export enum SearchFieldTypes {
        Form, Product, Other
    }

    export enum RowChangeTypes {
        Add, Delete, Modify
    }

    export enum PrintReportProcessPhases { PROC_CMD, GENERATING, PROC_RESP, SEND_TO_PRINTER }
    export const PrintReportStatuses: ProcessStatus[] = [
        { title: 'Riport', value: 0, msg: '0/4 - Kérés feldolgozása', isSimple: false },
        { title: 'Riport', value: 33, msg: '1/4 - Generálás', isSimple: false },
        { title: 'Riport', value: 65, msg: '2/4 - Riport Feldolgozása', isSimple: false },
        { title: 'Riport', value: 100, msg: '3/4 - Küldés Nyomtatásra', isSimple: false }
    ];

    export enum DownloadReportProcessPhases { PROC_CMD, GENERATING, PROC_RESP }
    export const DownloadReportStatuses: ProcessStatus[] = [
        { title: 'Riport Letöltés', value: 0, msg: '0/3 - Kérés feldolgozása', isSimple: false },
        { title: 'Riport Letöltés', value: 50, msg: '1/3 - Generálás', isSimple: false },
        { title: 'Riport Letöltés', value: 100, msg: '2/3 - Letöltés előkészítése', isSimple: false }
    ];

    export enum DownloadOfferNavCSVProcessPhases { PROC_CMD, GENERATING, PROC_RESP }
    export const DownloadOfferNavCSVStatuses: ProcessStatus[] = [
        { title: 'CSV Letöltés', value: 0, msg: '0/3 - Kérés feldolgozása', isSimple: false },
        { title: 'CSV Letöltés', value: 50, msg: '1/3 - Generálás', isSimple: false },
        { title: 'CSV Letöltés', value: 100, msg: '2/3 - Letöltés előkészítése', isSimple: false }
    ];

    export enum DownloadProcessPhases { PROC_CMD, GENERATING, PROC_RESP }
    export const DownloadStatuses: ProcessStatus[] = [
        { title: 'Letöltés', value: 0, msg: '0/3 - Kérés feldolgozása', isSimple: false },
        { title: 'Letöltés', value: 50, msg: '1/3 - Generálás', isSimple: false },
        { title: 'Letöltés', value: 100, msg: '2/3 - Letöltés előkészítése', isSimple: false }
    ];

    export enum EmailPhases { SENDING }
    export const EmailStatuses: ProcessStatus[] = [
        { title: 'Levél küldése', value: 0, msg: '1/1 - Küldés', isSimple: true }
    ];

    export enum CRUDSavingPhases { SAVING }
    export const CRUDSavingStatuses: ProcessStatus[] = [
        { title: 'Mentés', value: 0, msg: '1/1 - Új rekord mentése', isSimple: true }
    ];

    export enum GeneralAutoSavingPhases { SAVING }
    export const GeneralAutoSavingStatuses: ProcessStatus[] = [
        { title: 'Automatikus Mentés', value: 0, msg: '1/1 - Mentés', isSimple: true }
    ];

    export enum GeneralSavingPhases { SAVING }
    export const GeneralSavingStatuses: ProcessStatus[] = [
        { title: 'Mentés', value: 0, msg: '1/1 - Mentés', isSimple: true }
    ];

    export enum CRUDPutPhases { UPDATING }
    export const CRUDPutStatuses: ProcessStatus[] = [
        { title: 'Mentés', value: 0, msg: '1/1 - Rekord változásának mentése', isSimple: true }
    ];

    export enum DeletePhases { DELETING }
    export const DeleteStatuses: ProcessStatus[] = [
        { title: 'Törlés', value: 0, msg: '1/1 - Rekord törlése', isSimple: true }
    ];

    export enum LoadDataPhases { LOADING }
    export const LoadDataStatuses: ProcessStatus[] = [
        { title: 'Betöltés', value: 0, msg: '1/1 - Adatok betöltése folyamatban...', isSimple: true }
    ];

    export enum LogoutSavingPhases { LOGGING_OUT }
    export const LogoutSavingStatuses: ProcessStatus[] = [
        { title: 'Kijelentkezés', value: 0, msg: '1/1 - Kijelentkezés...', isSimple: true }
    ];

    export const LoggingInStatus: ProcessStatus = {
        title: 'Bejelentkezés folyamatban...',
        value: 0,
        msg: '1/1 - Bejelentkezés',
        isSimple: true
    }

    export const BlankProcessStatus: ProcessStatus = { value: -1 } as ProcessStatus;

    // Types

    export interface KeySettingRow {
        KeyCode: KeyBindings;
        AlternativeKeyCode?: KeyBindings;
        KeyLabel: string;
        FunctionLabel: string;
        KeyType: KeyTypes;
    }

    export type Dct = { [id: string]: any; };
    export type KeySettingsDct = { [key in Actions]: KeySettingRow; };
    export type ServiceFunctionGenericParams = (p: Constants.Dct) => Observable<any>

    export interface CommandDescriptor {
        Id: number,
        /**
         * Type of the result.
         * Printing reports will be always PRINT_REPORT
         * Downlading blob will be always DOWNLOAD_BLOB
         */
        ResultCmdType: CommandType;
        State?: CommandType;
    }

    export const GeneralEditorConfig: AngularEditorConfig = {
        editable: true,
        spellcheck: true,
        height: 'auto',
        minHeight: '0',
        maxHeight: '100px',
        width: 'auto',
        minWidth: '0',
        translate: 'yes',
        enableToolbar: true,
        showToolbar: true,
        placeholder: 'Enter text here...',
        defaultParagraphSeparator: '',
        defaultFontName: '',
        defaultFontSize: '',
        fonts: [
            { class: 'arial', name: 'Arial' },
            { class: 'times-new-roman', name: 'Times New Roman' },
            { class: 'calibri', name: 'Calibri' },
            { class: 'comic-sans-ms', name: 'Comic Sans MS' }
        ],
        customClasses: [
        {
            name: 'quote',
            class: 'quote',
        },
        {
            name: 'redText',
            class: 'redText'
        },
        {
            name: 'titleText',
            class: 'titleText',
            tag: 'h1',
        },
        ],
            uploadUrl: 'v1/image',
            uploadWithCredentials: false,
            sanitize: true,
            toolbarPosition: 'top',
            toolbarHiddenButtons: [
            ['bold', 'italic'],
            ['fontSize']
        ]
    }
}
