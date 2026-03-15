import { google } from 'googleapis';

const SPREADSHEETS = {
  main: '1tFv2_EPpNBeejwKTjQ_n7PFKTCCyZOCNcQwUVoRd8Yg',
  demo: '1q7GSF986adnX47toF_UZUn8Sjroxfo-dfh2Zpo76kYk',
  marketplace: '1Q4bOSNOwc-sVR--TI0GE3xCqhQSNADEb3KHHKm0kcq0'
};

export const handler = async (event: any) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const body = JSON.parse(event.body || '{}');
    const { action, email, data } = body;

    if (action === 'getDemoTemplates') {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEETS.demo,
        range: "'Demo Templates'!A:G", 
      });
      
      const rows = response.data.values || [];
      return { statusCode: 200, headers, body: JSON.stringify({ data: rows }) };
    }

    if (action === 'getMarketplaceForms') {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEETS.marketplace,
        range: 'Sheet1!A:H', 
      });
      const rows = response.data.values || [];
      return { statusCode: 200, headers, body: JSON.stringify({ data: rows }) };
    }

    if (action === 'getClientData' && email) {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEETS.main,
        range: 'Clients!A:J', 
      });
      
      const rows = response.data.values || [];
      const client = rows.find(row => row[3] === email);
      
      if (!client) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Client not found' }) };
      return { statusCode: 200, headers, body: JSON.stringify({ data: client }) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid action provided' }) };

  } catch (error: any) {
    console.error("Google Sheets API Error:", error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
