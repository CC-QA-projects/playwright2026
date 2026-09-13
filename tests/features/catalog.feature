@regression
Feature: Catalog browsing

  As a Demoblaze shopper
  I want to browse the storefront with confidence
  So that I can discover products before adding them to cart

  @smoke
  Scenario: Navbar elements are visible
    Given I am on the Demoblaze home page
    Then I should see the main navbar elements

  Scenario Outline: Categories load correct products
    Given I am on the Demoblaze home page
    When I view the "<category>" category
    Then I should see the product "<product>" in the product list
    Examples:
      | category | product           |
      | Phones   | Samsung galaxy s6 |
      | Laptops  | Sony vaio i5      |
      | Monitors | Apple monitor 24  |

  Scenario: Product details are visible
    Given I am on the Demoblaze home page
    When I open the "Samsung galaxy s6" product page
    Then I should see the "Samsung galaxy s6" product details

  Scenario: Carousel next and previous buttons work
    Given I am on the Demoblaze home page
    When I click Next on the carousel
    Then I should see the Second slide image
    When I click Previous on the carousel
    Then I should see the First slide image

  Scenario: Home page pagination reveals the remaining products
    Given I am on the Demoblaze home page
    Then I should see 9 products in the product list
    When I go to the next page of products
    Then I should see 6 products in the product list
    And I should see the product "MacBook Pro" in the product list
    And the next page button should be hidden

  Scenario: Category filter shows only that category's products
    Given I am on the Demoblaze home page
    When I view the "Monitors" category
    Then I should see 2 products in the product list
    And I should see the product "Apple monitor 24" in the product list
    And I should not see the product "Samsung galaxy s6" in the product list

  Scenario: Home link clears an active category filter
    Given I am on the Demoblaze home page
    When I view the "Monitors" category
    Then I should see 2 products in the product list
    When I return to the home page from the navbar
    Then I should see 9 products in the product list
