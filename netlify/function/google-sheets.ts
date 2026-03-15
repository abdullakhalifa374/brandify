import { google } from 'googleapis';

// Map your sheet IDs based on your provided URLs
const SPREADSHEETS = {
  main: '1tFv2_EPpNBeejwKTjQ_n7PFKTCCyZOCNcQwUVoRd8Yg', // Clients, Client Forms, Forms
  demo: '1q7GSF986adnX47toF_UZUn8Sjroxfo-dfh2Zpo76kYk', // Demo Templates
  marketplace: '1Q4bOSNOwc-sVR--TI0GE3xCqhQSNADEb3KHHKm0kcq0' // Marketplace
};

export const handler = async (event: any) => {
  // Handle CORS for local development
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Authenticate using Environment Variables (Hidden from the public)
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        // The regex ensures newlines in the private key are parsed correctly
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Parse the request from your React app
    const body = JSON.parse(event.body || '{}');
    const { action, email, data } = body;

    // --- ROUTER: Handle different requests from the frontend ---

    if (action === 'getDemoTemplates') {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEETS.demo,
        range: 'Sheet1!A:G', // Adjust 'Sheet1' if your tab is named differently
      });
      return { statusCode: 200, headers, body: JSON.stringify({ data: response.data.values }) };
    }

    if (action === 'getMarketplaceForms') {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEETS.marketplace,
        range: 'Sheet1!A:H', // Adjust tab name as needed
      });
      return { statusCode: 200, headers, body: JSON.stringify({ data: response.data.values }) };
    }

    if (action === 'getClientData' && email) {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEETS.main,
        range: 'Clients!A:J',
      });
      
      const rows = response.data.values || [];
      // Find the row where the Email column (index 3) matches the logged-in user
      const client = rows.find(row => row[3] === email);
      
      if (!client) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Client not found' }) };
      return { statusCode: 200, headers, body: JSON.stringify({ data: client }) };
    }

    // Default response if no valid action is sent
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid action provided' }) };

  } catch (error: any) {
    console.error("Google Sheets API Error:", error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
