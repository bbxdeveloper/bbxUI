describe('My First Test', () => {
  it('Does not do much!', () => {
    cy.visit("localhost:4200")
    console.log(cy.root())
  })
})