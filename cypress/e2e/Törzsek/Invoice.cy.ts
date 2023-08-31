describe('template spec', () => {
  beforeEach(() => {
    //Navigate to page and log in.
    cy.visit('http://localhost:4200/home')

    //Raktár
    cy.get('[ng-reflect-name="wareHouse"]').click().type('Raktár')
    cy.get('[ng-reflect-value="Raktár"]').click()

    //Felhasználó
    cy.get('[ng-reflect-name="username"]').click().type('kk')

    //Jelszó
    cy.get('[ng-reflect-name="password"]').click().type('kk')

    //Belépés
    cy.get('[ng-reflect-status="primary"]').click()

    //Toast validation
    cy.get('.title.subtitle').should('have.text', 'Információ')
    cy.get('.message').should('have.text', 'Sikeres bejelentkezés!')

    
    cy.wait(300)
    cy.contains('Számlázás').click()
    cy.wait(300)
    cy.contains(' Számla ').click()
    cy.wait(300)

    cy.viewport(1920, 1080)
    Cypress.config('viewportWidth', 1920)
    cy.wrap(Cypress.config('viewportWidth')).should('eq', 1920)   // passing
    Cypress.config('viewportHeight', 1080)
    cy.wrap(Cypress.config('viewportHeight')).should('eq', 1080)   // passing
  })


  
  it('Vevő kiválasztása', () => {
    cy.get('[ng-reflect-name="customerSearch"]').click().trigger('keydown', {
      "key": "F2",
      "keyCode": 113,
      "which": 113,
      "code": "F2",
      "location": 0,
      "altKey": false,
      "ctrlKey": false,
      "metaKey": false,
      "shiftKey": false,
      "repeat": false
     })

     cy.get('[id="active-prod-search"]').click().type('Csaba partnere')
     cy.wait(1000)
     cy.get('[id="active-prod-search"]').click().type('{downArrow}{enter}')
     cy.wait(300)
     cy.get('[ng-reflect-name="paymentMethod"]').should('have.value','Kártya')


     var notice = (Math.random() + 1).toString(36).substring(7);

     cy.get('[ng-reflect-name="notice"]').type(notice + '{enter}')
     cy.get('[id="invoice-inline-table-invoice-line"]').trigger('keydown',
     {
      "key": "F2",
      "keyCode": 113,
      "which": 113,
      "code": "F2",
      "location": 0,
      "altKey": false,
      "ctrlKey": false,
      "metaKey": false,
      "shiftKey": false,
      "repeat": false
     })
     cy.wait(1000)
     cy.get('[ng-reflect-name="searchString"]').click().type('CSA-BA01')
     cy.wait(1000)
     cy.get('[ng-reflect-name="searchString"]').click().type('{downArrow}{enter}')
     cy.wait(500)
     cy.get('[ng-reflect-name="PRODUCT-EDIT"]').type('10')
  })




})