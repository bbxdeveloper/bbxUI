// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  electron: false,
  apiUrl: "https://bbxbe.azurewebsites.net/", // https://localhost:44378/
  apiVersion: "/v1/",

  buildType: 'non production - local dev',

  debug: false,

  flatDesignFormDebug: false,
  flatDesignTableDebug: false,
  flatDesignCRUDManagerDebug: false,

  navigationMiscLog: false,
  navigationPositionLog: false,
  navigationMoveLog: false,
  navigationMatrixLog: false,
  navigationSelectLog: false,
  utilityLogs: false,
  getterSetterLogs: false,
  managerComponentLogs: false,
  invoiceSaveDialogLogs: false,
  inlineEditableTableMatrixGenerationLog: false,
  inlineEditableTableNavigatableFormLog: false,
  inlineEditableTableKeyboardDebug: false,
  matrixGenerationLog: false,

  offerLineLog: false,
  InvSaveDlgLogs: false,

  consoleLogsWrapperLogs: false,
  bbxProductCodeInputComponentLogs: false,

  partnerLock: false,

  theme: 'cosmic-custom',

  userManualsLink: 'https://drive.google.com/drive/folders/1wzrCpPJK6gEcTVbINSETUDt8J7_X8IIg?usp=sharing',

  inventoryItemManagerAutoSaveEnabled: true,
  inventoryItemManagerAutoSaveAmount: 10,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
