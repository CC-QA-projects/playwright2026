@regression
Feature: Cart management

  As a Demoblaze shopper
  I want cart contents and totals to stay accurate
  So that I can trust checkout calculations before placing an order

  @smoke
  Scenario: Product is added to cart from its category
    Given I am on the Demoblaze home page
    When I add "Iphone 6 32gb" from the "Phones" category to the cart
    Then I should see "Iphone 6 32gb" in the cart

  Scenario: User can remove a specific product when multiple items exist
    Given I have "Samsung galaxy s6" and "Sony vaio i5" in the cart
    When I remove "Samsung galaxy s6" from the cart
    Then I should not see "Samsung galaxy s6" in the cart
    And I should still see "Sony vaio i5" in the cart

  Scenario: Cart total updates after a product is removed
    Given I have "Samsung galaxy s6" and "Sony vaio i5" in the cart
    When I remove "Sony vaio i5" from the cart
    Then the cart total should equal 360

  Scenario: Cart total equals sum of item prices
    Given I have "Samsung galaxy s6" and "Sony vaio i5" in the cart
    Then the cart total should equal the sum of item prices

  Scenario: Cart total equals double when same item added twice
    Given I am on the Demoblaze home page
    When I add "Samsung galaxy s6" to the cart 2 times
    Then the cart total should be price x2 for "Samsung galaxy s6"
