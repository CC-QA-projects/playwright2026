import { test, expect } from '@playwright/test';

test.describe('POST API Tests', () => {
  const API_BASE_URL = 'https://api.example.com'; // Replace with your API endpoint

  test('POST - Create a new resource', async ({ request }) => {
    const name = 'John Doe';
    const response = await request.post(`${API_BASE_URL}/resource`, {
      data: {
        name: name,
        email: 'john@example.com',
        age: 30
      }
    });

    expect(response.status()).toBe(201); // Created
    const responseBody = await response.json();
    const id = responseBody.id;
    expect(responseBody).toHaveProperty('id');
    expect(responseBody.name).toBe(name);
    console.log(`Created resource with ID: ${id}`);
  });

  test('GET - Retrieve the created resource', async ({ request }) => {
    const id = 1; // Replace with actual ID from POST response
    const response = await request.get(`${API_BASE_URL}/resource/${id}`);

    expect(response.status()).toBe(200); // OK
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('id');
    expect(responseBody.id).toBe(id);
  });

  test('POST - Validate request headers', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/resource`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      },
      data: {
        name: 'Jane Doe',
        email: 'jane@example.com'
      }
    });

    expect(response.status()).toBe(201);
  });

  test('POST - Handle error response', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/resource`, {
      data: {
        name: '' // Empty name to trigger error
      }
    });

    expect(response.status()).toBe(400); // Bad Request
    const errorBody = await response.json();
    expect(errorBody).toHaveProperty('error');
  });

});
