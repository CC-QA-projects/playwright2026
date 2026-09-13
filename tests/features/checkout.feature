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

  Scenario: Order is rejected when name and credit card are missing
    Given I have "Samsung galaxy s6" in the cart
    When I open the place order modal
    And I attempt to place an order with blank name and card
    Then I should see an order error alert saying "Please fill out Name and Creditcard."
    And the place order modal should still be open

  Scenario: Cart is emptied after a successful purchase
    Given I have "Samsung galaxy s6" in the cart
    When I open the place order modal
    And I place an order for:
      | name    | Calvin Buyer     |
      | country | United States    |
      | city    | Austin           |
      | card    | 4111111111111111 |
      | month   | 04               |
      | year    | 2026             |
    Then I should see the purchase confirmation
    When I acknowledge the purchase confirmation
    And I open the cart
    Then I should not see "Samsung galaxy s6" in the cart
    And the cart should be empty
    And the cart total should equal 0

  Scenario: Purchase confirmation echoes the buyer details
    Given I have "Apple monitor 24" in the cart
    When I open the place order modal
    And I place an order for:
      | name    | Calvin Buyer     |
      | country | United States    |
      | city    | Austin           |
      | card    | 4111111111111111 |
      | month   | 04               |
      | year    | 2026             |
    Then I should see the purchase confirmation
    And the purchase confirmation should include "Name: Calvin Buyer"
    And the purchase confirmation should include "Card Number: 4111111111111111"
    And the purchase confirmation should include "Amount: 400 USD"
