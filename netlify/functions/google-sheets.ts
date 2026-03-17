import { google } from 'googleapis';

const SPREADSHEETS = {
  main: '1tFv2_EPpNBeejwKTjQ_n7PFKTCCyZOCNcQwUVoRd8Yg', // Your main database for all 4 sheets
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

    // --- DEMO FETCH ---
    if (action === 'getDemoTemplates') {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEETS.demo,
        range: "'Demo Templates'!A:G", 
      });
      return { statusCode: 200, headers, body: JSON.stringify({ data: response.data.values || [] }) };
    }

    // --- MARKETPLACE FETCH ---
    if (action === 'getMarketplaceData') {
      const [libraryRes, imagesRes] = await Promise.all([
        sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEETS.marketplace, range: "'Library'!A:H" }),
        sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEETS.marketplace, range: "'Images'!A:D" })
      ]);
      return { statusCode: 200, headers, body: JSON.stringify({ data: { library: libraryRes.data.values || [], images: imagesRes.data.values || [] } }) };
    }

    // --- THE GRAND APP FETCH (NEW) ---
    if (action === 'getAppDashboardData' && email) {
      // 1. Fetch all 4 sheets at the same time for speed
      const [clientsRes, detailsRes, clientFormsRes, formsRes] = await Promise.all([
        sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEETS.main, range: 'Clients!A:J' }),
        sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEETS.main, range: "'Clients Details'!A:Q" }),
        sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEETS.main, range: "'Clients Forms'!A:C" }),
        sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEETS.main, range: 'Forms!A:H' })
      ]);

      const clients = clientsRes.data.values || [];
      const details = detailsRes.data.values || [];
      const clientForms = clientFormsRes.data.values || [];
      const forms = formsRes.data.values || [];

      // 2. Find the primary client row by Email
      const clientRow = clients.find(row => row[3] === email);
      if (!clientRow) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Client not found in database' }) };

      const mobile = clientRow[1]; // Mobile is the connector

      // 3. Find extra details using Mobile
      const detailsRow = details.find(row => row[0] === mobile) || [];

      // 4. Find which Form IDs this user owns
      const userFormRows = clientForms.filter(row => row[1] === mobile);
      const userTemplateIds = userFormRows.map(row => row[2]); 

      // 5. Match those IDs to the master Forms list to get the actual templates
      const myTemplates = forms
        .filter(row => userTemplateIds.includes(row[2])) 
        .map(row => ({
          frontly_id: row[0] || "",
          title: row[1] || "",
          id: row[2] || "",
          category: row[3] || "",
          type: row[4] || "",
          credit: parseInt(row[5] || "0", 10),
          formUrl: row[6] || "",
          preview: row[7] || ""
        }));

      // 6. Combine all client data into one clean profile object
      const clientProfile = {
        frontly_id: clientRow[0] || "",
        mobile: mobile,
        company: clientRow[2] || "",
        email: clientRow[3] || "",
        credit: clientRow[4] || "0",
        used: clientRow[5] || "0",
        remaining: clientRow[6] || "0",
        endDate: clientRow[7] || "",
        status: clientRow[8] || "",
        googleDrive: clientRow[9] || "",
        // Extended Details
        website: detailsRow[3] || "",
        socialMedia: detailsRow[4] || "",
        supportPhone: detailsRow[5] || "",
        supportEmail: detailsRow[6] || "",
        darkLogo: detailsRow[7] || "",
        lightLogo: detailsRow[8] || "",
        coloredLogo: detailsRow[9] || "",
        plan: detailsRow[10] || "",
        planPrice: detailsRow[11] || "",
        freeTemplates: detailsRow[12] || "0",
        templatesUsed: detailsRow[13] || "0",
        firstName: detailsRow[14] || "",
        lastName: detailsRow[15] || "",
        maxCredits: detailsRow[16] || "0"
      };

      // Return it all to the frontend perfectly packaged!
      return { 
        statusCode: 200, 
        headers, 
        body: JSON.stringify({ data: { profile: clientProfile, templates: myTemplates } }) 
      };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid action provided' }) };

  } catch (error: any) {
    console.error("Google Sheets API Error:", error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
