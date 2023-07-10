var Name: string = "";
var BankNumber: string = "";
var CountryVATNumber: string = "";
var ForeignVATNumber = null;
var Address: string = "";
var Remarks: string = "";
var Email: string = "";


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
      "key": "F3",
      "keyCode": 114,
      "which": 114,
      "code": "F3",
      "location": 0,
      "altKey": false,
      "ctrlKey": false,
      "metaKey": false,
      "shiftKey": false,
      "repeat": false
     }
      //  Ezzel lehet meglesni https://www.toptal.com/developers/keycode
     )
    cy.get('[id="active-prod-search"]').type('{alt}', { release: true }) // this should switch alt to release

    //  Negatív teszteset
    cy.get('[ng-reflect-content="Mentés"]').click()
    cy.get('[ng-reflect-control-name="customerName"]').contains('A név kitöltése kötelező!')
    cy.get('[ng-reflect-control-name="city"]').contains('A város kitöltése kötelező!')
    cy.get('[ng-reflect-control-name="additionalAddressDetail"]').contains('Kitöltése kötelező!')

    Name = generate_random_string(8);
    BankNumber = generate_random_number(24)
    CountryVATNumber = generate_random_number(8) + '226'
    //  ForeignVATNumber = generate_random_number(10)
    Address = generate_random_string(8);
    Remarks = generate_random_string(20);
    Email = generate_random_string(6) + '@' + generate_random_string(6) + '.' + generate_random_string(3);
    cy.get('[ng-reflect-name="customerName"]').click()
    cy.get('[ng-reflect-name="customerName"]').type(Name).type('{enter}'
     + BankNumber + '{enter}'
     + CountryVATNumber 
     + '{enter}'
     // + ForeignVATNumber 
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

    //  Mentés ellenőrzése
     cy.wait(2000)
     cy.get('.title.subtitle').should('have.text', 'Információ')
     cy.get('.message').should('have.text', 'Sikeres mentés!')

    //  Adatok visszanézése
    cy.get('[formcontrolname="customerName"]').should('have.value', Name)
    cy.get('[ng-reflect-name="customerBankAccountNumber"]').should(($input) => {
      const val = $input.val()
      
      expect(String(val).replace('-', '').replace('-', '')).to.eq(String(BankNumber))
    })
    cy.get('[formcontrolname="taxpayerNumber"]').should(($input) => {
      const val = $input.val()
      
      expect(String(val).replace('-', '').replace('-', '')).to.eq(String(CountryVATNumber))
    })
    cy.get('[formcontrolname="additionalAddressDetail"]').should('have.value', Address)
    cy.get('[formcontrolname="comment"]').should('have.value', Remarks)
    cy.get('[formcontrolname="email"]').should('have.value', Email)
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
      retVal += Math.floor((Math.random() * 9) + 1)
    }

    return retVal
  }
  

  it('Partnerek Létrehozása Ellenőrzése', () => {
    cy.contains(' Partnerek ').click()
    cy.wait(2000)

    cy.get('[id="active-prod-search"]').click().type(Name)

    cy.wait(2000)

    cy.get('[class="ng-star-inserted"]').contains(Name).click().type('{alt}', { release: false }) // this should keep alt pressed
    cy.get('[id="active-prod-search"]').trigger('keydown', 
    {
      "key": "F3",
      "keyCode": 114,
      "which": 114,
      "code": "F3",
      "location": 0,
      "altKey": false,
      "ctrlKey": false,
      "metaKey": false,
      "shiftKey": false,
      "repeat": false
     }
      //  Ezzel lehet meglesni https://www.toptal.com/developers/keycode
     )
     cy.get('[class="ng-star-inserted"]').contains(Name).click().type('{alt}', { release: true }) // this should switch alt to release


   //  Adatok visszanézése
   cy.get('[formcontrolname="customerName"]').should('have.value', Name)
   cy.get('[ng-reflect-name="customerBankAccountNumber"]').should(($input) => {
     const val = $input.val()
     
     expect(String(val).replace('-', '').replace('-', '')).to.eq(String(BankNumber))
   })
   cy.get('[formcontrolname="taxpayerNumber"]').should(($input) => {
     const val = $input.val()
     
     expect(String(val).replace('-', '').replace('-', '')).to.eq(String(CountryVATNumber))
   })
   cy.get('[formcontrolname="additionalAddressDetail"]').should('have.value', Address)
   cy.get('[formcontrolname="comment"]').should('have.value', Remarks)
   cy.get('[formcontrolname="email"]').should('have.value', Email)
  })


  
  it('Partnerek Szerkesztése', () => {
    cy.contains(' Partnerek ').click()
    cy.wait(2000)

    cy.get('[id="active-prod-search"]').click().type(Name)

    cy.wait(2000)

    cy.get('[class="ng-star-inserted"]').contains(Name).click()
    cy.get('[class="ng-star-inserted"]').contains(Name).trigger('keydown', 
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
     })//  Ezzel lehet meglesni https://www.toptal.com/developers/keycode
     

    Name = generate_random_string(8);
    BankNumber = generate_random_number(24)
    CountryVATNumber = generate_random_number(8) + '226'
    //  ForeignVATNumber = generate_random_number(10)
    // Address = generate_random_string(8);
    Remarks = generate_random_string(20);
    Email = generate_random_string(6) + '@' + generate_random_string(6) + '.' + generate_random_string(3);

    cy.wait(300)

    cy.get('[ng-reflect-name="customerName"]').click().clear().type(Name)
    cy.get('[ng-reflect-name="customerBankAccountNumber"]').click().clear().type(BankNumber)
    cy.get('[ng-reflect-name="taxpayerNumber"]').click().clear().type(CountryVATNumber)

    // cy.get('[ng-reflect-name="postalCode"]').scrollIntoView()
    // cy.get('[ng-reflect-name="postalCode"]').click({force: true}).clear().type(Address)

    cy.get('[ng-reflect-name="comment"]').scrollIntoView()
    cy.get('[ng-reflect-name="comment"]').click().clear().type(Remarks)

    cy.get('[ng-reflect-name="email"]').scrollIntoView()
    cy.get('[ng-reflect-name="email"]').click().clear().type(Email)


    cy.get('[ng-reflect-content="Mentés"]').scrollIntoView()
    cy.get('[ng-reflect-content="Mentés"]').click()
    
    //  Mentés ellenőrzése
    cy.wait(2000)
    cy.get('.title.subtitle').should('have.text', 'Információ')
    cy.get('.message').should('have.text', 'Sikeres mentés!')
  })

  

  it('Partnerek Szerkesztése Ellenőrzése', () => {
    cy.contains(' Partnerek ').click()
    cy.wait(2000)

    cy.get('[id="active-prod-search"]').click().type(Name)

    cy.wait(2000)

    cy.get('[class="ng-star-inserted"]').contains(Name).click()
    cy.get('[class="ng-star-inserted"]').contains(Name).trigger('keydown', 
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
     })//  Ezzel lehet meglesni https://www.toptal.com/developers/keycode


   //  Adatok visszanézése
   cy.get('[formcontrolname="customerName"]').should('have.value', Name)
   cy.get('[ng-reflect-name="customerBankAccountNumber"]').should(($input) => {
     const val = $input.val()
     
     expect(String(val).replace('-', '').replace('-', '')).to.eq(String(BankNumber))
   })
   cy.get('[formcontrolname="taxpayerNumber"]').should(($input) => {
     const val = $input.val()
     
     expect(String(val).replace('-', '').replace('-', '')).to.eq(String(CountryVATNumber))
   })
   cy.get('[formcontrolname="additionalAddressDetail"]').should('have.value', Address)
   cy.get('[formcontrolname="comment"]').should('have.value', Remarks)
   cy.get('[formcontrolname="email"]').should('have.value', Email)
  })


  
  it('Partnerek Törlése', () => {
    cy.contains(' Partnerek ').click()
    cy.wait(2000)

    cy.get('[id="active-prod-search"]').click().type(Name)

    cy.wait(2000)

    cy.get('[class="ng-star-inserted"]').contains(Name).click()
    cy.get('[class="ng-star-inserted"]').contains(Name).trigger('keydown', 
    {
      "key": "F8",
      "keyCode": 119,
      "which": 119,
      "code": "F8",
      "location": 0,
      "altKey": false,
      "ctrlKey": false,
      "metaKey": false,
      "shiftKey": false,
      "repeat": false
     })//  Ezzel lehet meglesni https://www.toptal.com/developers/keycode

    cy.wait(1000)
    cy.get('[id="confirm-widget-dialog-button-yes"]').click()
    cy.wait(2000)

    cy.get('.title.subtitle').should('have.text', 'Információ')
    cy.get('.message').should('have.text', 'Sikeres törlés!')
  })



  it('Partnerek Törlése Ellenőrzése', () => {
    cy.contains(' Partnerek ').click()
    cy.wait(2000)

    cy.get('[id="active-prod-search"]').click().type(Name)

    cy.wait(2000)

    cy.get('[class="ng-star-inserted"]').contains(Name).should('not.exist')
  })
})