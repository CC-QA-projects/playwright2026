@regression
Feature: Authentication flows

  As a Demoblaze shopper
  I want account creation and login validation to be reliable
  So that I can safely use authenticated shopping journeys

  @smoke
  Scenario: User signs up and logs in with the generated account
    Given I am on the Demoblaze home page
    When I sign up with a generated Demoblaze account
    Then I should see a signup success alert
    When I log in with the generated Demoblaze credentials
    Then I should see my generated welcome username
    When I log out of Demoblaze
    Then I should see the Log in link and not the Log out link

  Scenario: Duplicate signup is rejected
    Given I am on the Demoblaze home page
    When I sign up with a generated Demoblaze account
    Then I should see a signup success alert
    When I try to sign up again with the same generated Demoblaze account
    Then I should see a duplicate signup alert

  Scenario: Login with an invalid password is rejected
    Given I am on the Demoblaze home page
    When I sign up with a generated Demoblaze account
    Then I should see a signup success alert
    When I attempt to log in with the generated username and an invalid password
    Then I should see a login error alert saying "Wrong password."
    And I should not see a welcome username
