Feature: Demoblaze UI tests
  As a user of Demoblaze
  I want to interact with the site
  So that I can verify key flows work

@THISONE
  Scenario: Login to demoblaze and assert successful login
    Given I am on the Demoblaze home page
    When I open the login modal
    And I log in with valid Demoblaze credentials
    Then I should see my welcome username
@THISONE
  Scenario: Navbar elements are visible
    Given I am on the Demoblaze home page
    Then I should see the main navbar elements
@THISONE
  Scenario Outline: Categories load correct products
    Given I am on the Demoblaze home page
    When I view the "<category>" category
    Then I should see the product "<product>" in the product list
@THISONE
    Examples:
      | category | product           |
      | Phones   | Samsung galaxy s6 |
      | Laptops  | Sony vaio i5      |
      | Monitors | Apple monitor 24  |

@THISONE
  Scenario: User can sign up
    Given I am on the Demoblaze home page
    When I open the Sign up modal
    And I sign up with valid credentials
    Then a sign up alert should appear
@THISONE
  Scenario: Product details are visible
    Given I am on the Demoblaze home page
    When I open the Samsung galaxy s6 product page
    Then I should see the Samsung galaxy s6 details
@THISONE

  Scenario: Carousel next and previous buttons work
    Given I am on the Demoblaze home page
    When I click Next on the carousel
    Then I should see the Second slide image
    When I click Previous on the carousel
    Then I should see the First slide image

  Scenario: Login toggles nav options
    Given I am on the Demoblaze home page
    When I open the login modal
    And I log in with valid Demoblaze credentials
    Then I should see the Log out link and not the Log in link

  Scenario: User logs out and sees Log in
    Given I am logged in to Demoblaze
    When I log out of Demoblaze
    Then I should see the Log in link and not the Log out link
