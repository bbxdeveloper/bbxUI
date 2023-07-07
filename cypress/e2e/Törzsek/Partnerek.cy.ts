var Name = null;
var BankNumber = null;
var CountryVATNumber = null;
var ForeignVATNumber = null;
var Address = null;
var Remarks = null;
var Email = null;


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

    cy.get('[id="active-prod-search"]').type('{alt}', { release: false }) // this should keep alt pressed
    cy.get('[id="active-prod-search"]').trigger('keydown', 
      {
        "key": "F4",
        "keyCode": 115,
        "which": 115,
        "code": "F4",
        "location": 0,
        "altKey": false,
        "ctrlKey": false,
        "metaKey": false,
        "shiftKey": false,
        "repeat": false
      }
      //ezzel lehet meglesni https://www.toptal.com/developers/keycode
     )
    cy.get('[id="active-prod-search"]').type('{alt}', { release: true }) // this should switch alt to release

    Name = generate_random_string(8);
    BankNumber = generate_random_number(26)
    //CountryVATNumber = generate_random_number(13)
    //ForeignVATNumber = generate_random_number(10)
    Address = generate_random_string(8);
    Remarks = generate_random_string(20);
    Email = generate_random_string(6) + '@' + generate_random_string(6) + '.' + generate_random_string(3);
    cy.get('[ng-reflect-name="customerName"]').type(Name).type('{enter}'
     + BankNumber + '{enter}'
     //+ CountryVATNumber 
     + '{enter}'
     //+ ForeignVATNumber 
     + '{enter}'
     + '{enter}'
     + 6300 + '{enter}'
     )

     cy.wait(700)

     cy.get('[ng-reflect-name="additionalAddressDetail"]').type(Address + '{enter}{enter}{enter}{enter}{enter}{enter}{enter}{enter}{enter}'
     + Remarks
     + '{enter}'
     + Email 
     + '{enter}'
     + '{enter}')

  })


  function generate_random_string(string_length: number) {
    let random_string = '';
    let random_ascii;
    for(let i = 0; i < string_length; i++) {
        random_ascii = Math.floor((Math.random() * 25) + 97);
        random_string += String.fromCharCode(random_ascii)
    }
    return random_string
  }

  function generate_random_number(number_length: number){
    var retVal = ''

    for(var i = 0; i < number_length; i++){
      retVal += Math.floor((Math.random() * 10) + 1)
    }

    return retVal
  }
  

  // it('Partnerek Létrehozása Ellenőrzése', () => {
  //   cy.contains(' Partnerek ').click()
  //   cy.wait(2000)
  // })


  
  // it('Partnerek Szerkesztése', () => {
  //   cy.contains(' Partnerek ').click()
  //   cy.wait(2000)
  // })

  

  // it('Partnerek Szerkesztése Ellenőrzése', () => {
  //   cy.contains(' Partnerek ').click()
  //   cy.wait(2000)
  // })


  
  // it('Partnerek Törlése', () => {
  //   cy.contains(' Partnerek ').click()
  //   cy.wait(2000)
  // })



  // it('Partnerek Törlése Ellenőrzése', () => {
  //   cy.contains(' Partnerek ').click()
  //   cy.wait(2000)
  // })
})