export enum ValidationMessage {
    ErrorRequired = 'A mező kitöltése kötelező!',
    ErrorMin = 'A mező értéke kisebb a megengedett minimumnál!',
    ErrorMax = 'A mező értéke nagyobb a megengedett maximumnál!',
    ErrorMinDate = 'A mezőben megadott dátum kisebb a megengedett minimumnál!',
    ErrorMaxDate = 'A mezőben megadott dátum nagyobb a megengedett maximumnál!',
    ErrorMinMaxDate = 'A mezőben megadott dátum a megengedett intervallumon kívülre esik!',
    ErrorTodaysDate = 'A mezőben csak mai, vagy annál korábbi dátum adható meg!',
}