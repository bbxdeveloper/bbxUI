describe('template spec', () => {
  beforeEach(() => {
    //Navigate to page and log in.
    cy.visit('http://localhost:4200/home')
    
    cy.viewport(1920, 1080)
    Cypress.config('viewportWidth', 1920)
    cy.wrap(Cypress.config('viewportWidth')).should('eq', 1920)   // passing
    Cypress.config('viewportHeight', 1080)
    cy.wrap(Cypress.config('viewportHeight')).should('eq', 1080)   // passing

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

  })

  let invoiceNumber = null

  
  it('Számlázás', () => {

    cy.contains(' Számla ').click()
    cy.wait(300)

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
     cy.get('[ng-reflect-name="PRODUCT-EDIT"]').type('{ctrl}{enter}')
     cy.wait(300)
     cy.get('[ng-reflect-name="invoiceDiscountPercent"]').type('10')
     cy.get('[formcontrolname="loginName"]').should('have.value', 'Kormos Krisztián')
     cy.get('[ng-reflect-name="input_p"]').type('kk')
     cy.wait(300)
     cy.get('[id="confirm-dialog-button-yes"]').click().type('{enter}')
     cy.wait(5000)
     cy.get('.title.subtitle').should('have.text', 'Információ')
     cy.get('.message').should('have.text', 'Sikeres mentés!')
     cy.get('[ng-reflect-name="answer"]').click().type('{enter}{rightArrow}{enter}')
     cy.wait(20)
     cy.get('.message').contains('számla nyomtatása nem történt meg').should(($input) => {
      // const val = $input.val()


      expect($input).to.contain('számla nyomtatása nem történt meg')
      }).then(x=>{
        let stringArray = x[0].innerText.split(' ')
        invoiceNumber = stringArray[1]
      })
    cy.wait(300)
    cy.get('.title.subtitle').first().should('have.text', 'Információ')
  })

  
  it('Szállítólevéll', () => {
    cy.contains(' Szállítólevél ').click()
    cy.wait(300)

    cy.get('[formcontrolname="customerSearch"]').click().trigger('keydown', {
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


     cy.wait(300)
     cy.get('[id="active-prod-search"]').click().type('csaba partnere')
     cy.wait(1000)
     cy.get('[id="active-prod-search"]').click().type('{downArrow}{enter}')
     cy.wait(300)

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
     cy.get('[ng-reflect-name="PRODUCT-EDIT"]').type('{ctrl}{enter}')
     cy.wait(300)
     cy.get('[ng-reflect-name="invoiceDiscountPercent"]').type('10')
     cy.get('[formcontrolname="loginName"]').should('have.value', 'Kormos Krisztián')
     cy.get('[ng-reflect-name="input_p"]').type('kk')
     cy.wait(300)
     cy.get('[id="confirm-dialog-button-yes"]').click().type('{enter}')
     cy.wait(5000)
     cy.get('.title.subtitle').should('have.text', 'Információ')
     cy.get('.message').should('have.text', 'Sikeres mentés!')
     cy.get('[ng-reflect-name="answer"]').click().type('{enter}{rightArrow}{enter}')
     cy.wait(20)
     cy.get('.message').contains('számla nyomtatása nem történt meg').should(($input) => {
      // const val = $input.val()


      expect($input).to.contain('számla nyomtatása nem történt meg')
      }).then(x=>{
        let stringArray = x[0].innerText.split(' ')
        invoiceNumber = stringArray[1]
      })
    cy.wait(300)
    cy.get('.title.subtitle').first().should('have.text', 'Információ')


  })
  


})