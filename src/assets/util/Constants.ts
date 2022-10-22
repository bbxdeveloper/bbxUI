import { NbIconConfig, NbToastrConfig } from "@nebular/theme";
import { ProcessStatus } from "../model/ProcessStatus";
import { Actions, KeyBindings } from "./KeyBindings";

export module Constants {
    // Messages

    export const MSG_CONFIRMATION_QUIT: string = "Biztosan szeretne kiléni az alkalmazásból?";
    export const MSG_CONFIRMATION_FILTER_DELETE: string = "Szeretné törölni keresés szövegét? Előfordulhat az új vagy frissített elem nem lesz látható mellette.";
    export const MSG_CONFIRMATION_DELETE: string = "Biztosan végre szeretné hajtani a törlést?";
    export const MSG_CONFIRMATION_LOCK: string = "Biztosan végre szeretné hajtani a zárást?";
    export const MSG_CONFIRMATION_SAVE: string = "El szeretné menteni?";
    export const MSG_CONFIRMATION_SAVE_DATA: string = "Adatok mentése?";
    export const MSG_CONFIRMATION_DELETE_OFFER: string = "Biztosan törölni szeretné az ajánlatot?";
    export const MSG_INVALID_FILTER_FORM: string = "Hiányos vagy hibásan kitöltött mezők vannak a szűrőben!";
    export const MSG_LOAD_REMAINING_TSC: string = "Biztos be szeretné tölteni a még nem kiválasztott termékcsoportokat?";

    export const TITLE_ERROR: string = 'Hiba';
    export const TITLE_WARNING: string = 'Figyelmeztetés';
    export const TITLE_INFO: string = 'Információ';

    export const MSG_EMAIL_SUCCESFUL: string = 'Email sikeresen elküldve!'
    export const MSG_CUSTOMER_UPDATE_SUCCESFUL: string = 'Ügyfél sikeresen frissítve!'
    export const MSG_CUSTOMER_UPDATE_FAILED: string = 'Ügyfél frissítése sikertelen!'

    export const MSG_USER_GET_FAILED: string = 'Felhasználó lekérése sikertelen! Név: '

    export const MSG_SAVE_SUCCESFUL: string = 'Sikeres mentés!'
    export const MSG_DELETE_SUCCESFUL: string = 'Sikeres törlés!'

    export const MSG_NO_PRODUCT_FOUND: string = 'Nincs a begépelt kódnak megfelelő termék! Kérem próbálja meg a keresőablak használatával.';
    export const MSG_NO_PRODUCT_GROUP_FOUND: string = 'Nincs a begépelt kódnak megfelelő termékcsoport! Kérem próbálja meg a keresőablak használatával.';
    export const MSG_PRODUCT_ALREADY_THERE: string = 'Ez a termék már szerepel a felvett tételek között.';
    export const MSG_PRODUCT_GROUP_ALREADY_THERE: string = 'Ez a termékcsoport már szerepel a felvett tételek között.';

    export const MSG_LOGIN_SUCCESFUL: string = 'Sikeres bejelentkezés!'
    export const MSG_LOGIN_FAILED: string = 'Sikertelen bejelentkezés!'
    export const MSG_LOGOUT_SUCCESFUL: string = 'Sikeres kijelentkezés!'
    export const MSG_LOGOUT_FAILED: string = 'Sikertelen kijelentkezés!'

    export const TOASTR_SUCCESS: Partial<NbToastrConfig> =
        { duration: 0, status: 'primary' };
    export const TOASTR_ERROR: Partial<NbToastrConfig> =
        { duration: 0, status: 'danger' };

    export const TOASTR_SUCCESS_5_SEC: Partial<NbToastrConfig> =
        { duration: 5000, status: 'primary' };
    export const TOASTR_ERROR_5_SEC: Partial<NbToastrConfig> =
        { duration: 5000, status: 'danger' };

    export const ProductCodePatterns = {
        A: { pattern: new RegExp('[a-zA-Z0-9áéiíoóöőuúüűÁÉIÍOÓÖŐUÚÜŰä]') },
        C: { pattern: new RegExp('[a-zA-Z0-9áéiíoóöőuúüűÁÉIÍOÓÖŐUÚÜŰä]') }
    };
    export const ProductCodeMask = "AAA-ACCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC";
    export const CustDiscountCodeMask = "CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC";

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

    export enum PrintReportProcessPhases { PROC_CMD, GENERATING, PROC_RESP, SEND_TO_PRINTER }
    export const PrintReportStatuses: ProcessStatus[] = [
        { title: 'Riport Nyomtatás', value: 0, msg: '0/4 - Kérés feldolgozása', isSimple: false },
        { title: 'Riport Nyomtatás', value: 33, msg: '1/4 - Generálás', isSimple: false },
        { title: 'Riport Nyomtatás', value: 65, msg: '2/4 - Riport Feldolgozása', isSimple: false },
        { title: 'Riport Nyomtatás', value: 100, msg: '3/4 - Küldés Nyomtatásra', isSimple: false }
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

    export enum CRUDSavingPhases { SAVING }
    export const CRUDSavingStatuses: ProcessStatus[] = [
        { title: 'Mentés', value: 0, msg: '1/1 - Új rekord mentése', isSimple: true }
    ];

    export enum GeneralSavingPhases { SAVING }
    export const GeneralSavingStatuses: ProcessStatus[] = [
        { title: 'Mentés', value: 0, msg: '1/1 - Mentés', isSimple: true }
    ];

    export enum CRUDPutPhases { UPDATING }
    export const CRUDPutStatuses: ProcessStatus[] = [
        { title: 'Mentés', value: 0, msg: '1/1 - Rekord változásának mentése', isSimple: true }
    ];

    export enum CRUDDeletePhases { DELETING }
    export const CRUDDeleteStatuses: ProcessStatus[] = [
        { title: 'Törlés', value: 0, msg: '1/1 - Rekord törlése', isSimple: true }
    ];

    export enum LoadDataPhases { LOADING }
    export const LoadDataStatuses: ProcessStatus[] = [
        { title: 'Betöltés', value: 0, msg: '1/1 - Adatok betöltése folyamatban...', isSimple: true }
    ];

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
}
