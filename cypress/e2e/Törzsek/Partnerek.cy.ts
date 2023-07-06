describe('Partnerek', () => {
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

    
    cy.get('[data-name="home"]').click()
    .type('{rightArrow}{rightArrow}{rightArrow}{enter}')
    cy.wait(300)
  })


  
  it('Partnerek Létrehozása', () => {
    cy.contains(' Partnerek ').click()
    cy.wait(2000)
  })

  

  it('Partnerek Ellenőrzése', () => {
    cy.contains(' Partnerek ').click()
    cy.wait(2000)
  })


  
  it('Partnerek Törlése', () => {
    cy.contains(' Partnerek ').click()
    cy.wait(2000)
  })



  it('Partnerek Ellenőrzése', () => {
    cy.contains(' Partnerek ').click()
    cy.wait(2000)
  })
})