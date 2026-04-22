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
    When I open the Samsung galaxy s6 product page
    Then I should see the Samsung galaxy s6 details

  Scenario: Carousel next and previous buttons work
    Given I am on the Demoblaze home page
    When I click Next on the carousel
    Then I should see the Second slide image
    When I click Previous on the carousel
    Then I should see the First slide image
