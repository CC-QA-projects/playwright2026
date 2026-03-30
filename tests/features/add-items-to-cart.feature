Feature: Add items to cart

  As a Demoblaze shopper
  I want to add, remove, and checkout items in the cart
  So that I can verify cart and checkout behavior

  Scenario: Product is added to cart
    Given I am on the Demoblaze home page
    When I add "Iphone 6 32gb" from the Phones category to the cart
    Then I should see "Iphone 6 32gb" in the cart

  Scenario: User can remove product from cart
    Given I have "Iphone 6 32gb" in the cart
    When I remove "Iphone 6 32gb" from the cart
    Then I should not see "Iphone 6 32gb" in the cart

  Scenario: Quick checkout shows correct total
    Given I have "Samsung galaxy s6" in the cart
    When I place an order
    Then the order total should be 360

  Scenario: Cart total equals sum of item prices
    Given I have "Samsung galaxy s6" and "Sony vaio i5" in the cart
    Then the cart total should equal the sum of item prices


  Scenario: Cart total equals double when same item added twice
    Given I am on the Demoblaze home page
    When I add "Samsung galaxy s6" to the cart 2 times
    Then the cart total should be price x2 for "Samsung galaxy s6"
