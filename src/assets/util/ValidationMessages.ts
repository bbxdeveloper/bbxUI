export enum ValidationMessage {
    ErrorRequired = 'A mező kitöltése kötelező!',
    ErrorMin = 'A mező értéke kisebb a minimumnál!',
    ErrorMax = 'A mező értéke nagyobb a maximumnál!',
    ErrorMinDate = 'A megadott dátum kisebb a minimumnál!',
    ErrorMaxDate = 'A megadott dátum nagyobb a maximumnál!',
    ErrorMinMaxDate = 'A megadott dátum a intervallumon kívülre esik!',
    ErrorTodaysDate = 'A mezőben maximum a mai dátum adható meg!',
    ErrorValidDate = 'Érvénytelen dátum!',
}