@regression
Feature: Core site modals

  As a Demoblaze shopper
  I want the primary informational and support modals to work
  So that I can contact the store and view key site details

  @smoke
  Scenario: User can send a contact message
    Given I am on the Demoblaze home page
    When I send a contact message through the Contact modal
    Then I should see a contact success alert

  Scenario: About us modal displays site information
    Given I am on the Demoblaze home page
    When I open the About us modal
    Then I should see the About us modal content
