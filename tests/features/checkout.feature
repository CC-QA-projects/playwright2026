@regression
Feature: Checkout flow

  As a Demoblaze shopper
  I want to complete a purchase with clear confirmation details
  So that I know checkout succeeds from cart to final receipt

  @smoke
  Scenario: Guest can complete a purchase from the cart
    Given I am on the Demoblaze home page
    When I add "Samsung galaxy s6" from the "Phones" category to the cart
    And I open the place order modal
    Then the order modal total should be 360
    When I place an order for:
      | name    | Calvin Buyer     |
      | country | United States    |
      | city    | Austin           |
      | card    | 4111111111111111 |
      | month   | 04               |
      | year    | 2026             |
    Then I should see the purchase confirmation
    And the purchase confirmation should include "Amount: 360 USD"
