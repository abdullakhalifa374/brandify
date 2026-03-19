import { google } from 'googleapis';
import { Readable } from 'stream'; // NEW: Required for processing file uploads

const SPREADSHEETS = {
  main: '1tFv2_EPpNBeejwKTjQ_n7PFKTCCyZOCNcQwUVoRd8Yg', // Clients, Details, Client Forms, Forms
  demo: '1q7GSF986adnX47toF_UZUn8Sjroxfo-dfh2Zpo76kYk',
  marketplace: '1Q4bOSNOwc-sVR--TI0GE3xCqhQSNADEb3KHHKm0kcq0',
  reminders: '1Dal_T4o3fqZ8onWiyNyftNsIFK_S64-HAKwdH2Px2yg' // Reminders
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
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/drive.file' // NEW: Added permission to upload files
      ],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const drive = google.drive({ version: 'v3', auth });

    const body = JSON.parse(event.body || '{}');
    const { action, email, mobile, data } = body;

    // --- UPLOAD LOGO TO DRIVE & UPDATE SHEET (NEW) ---
    if (action === 'uploadLogo' && mobile && data) {
      try {
        // 1. Convert base64 back to file and upload to Google Drive folder
        const buffer = Buffer.from(data.base64, 'base64');
        const driveRes = await drive.files.create({
          requestBody: {
            name: data.fileName,
            parents: ['1xkFw128Xbh0y8-Z4OCkkR4yrvTtC9IKC'] // Your exact logo folder ID
          },
          media: {
            mimeType: data.mimeType,
            body: Readable.from(buffer)
          },
          fields: 'id'
        });
        
        const newFileId = driveRes.data.id;

        // 2. Update the correct column in the Google Sheet (H, I, or J)
        const detailsRes = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEETS.main, range: "'Clients Details'!A:A" });
        const rows = detailsRes.data.values || [];
        const rowIndex = rows.findIndex((row: any[]) => row[0] === mobile);
        
        if (rowIndex !== -1) {
          const sheetRow = rowIndex + 1;
          let colLetter = '';
          if (data.columnName === 'darkLogo') colLetter = 'H';
          else if (data.columnName === 'lightLogo') colLetter = 'I';
          else if (data.columnName === 'coloredLogo') colLetter = 'J';

          if (colLetter) {
            await sheets.spreadsheets.values.update({
              spreadsheetId: SPREADSHEETS.main,
              range: `'Clients Details'!${colLetter}${sheetRow}`,
              valueInputOption: 'USER_ENTERED',
              requestBody: { values: [[newFileId]] }
            });
          }
        }
        return { statusCode: 200, headers, body: JSON.stringify({ success: true, fileId: newFileId }) };
      } catch (err: any) {
        console.error("Logo Upload Error:", err.message);
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to upload logo' }) };
      }
    }

    // --- FETCH DRIVE ASSETS ---
    if (action === 'getDriveAssets' && data?.folderId) {
      try {
        const response = await drive.files.list({
          q: `'${data.folderId}' in parents and trashed=false`,
          fields: 'files(id, name, mimeType, webContentLink, thumbnailLink)',
          orderBy: 'createdTime desc' // Shows newest images first
        });
        return { statusCode: 200, headers, body: JSON.stringify({ data: response.data.files || [] }) };
      } catch (err: any) {
        console.error("Drive Error:", err.message);
        return { statusCode: 200, headers, body: JSON.stringify({ data: [] }) };
      }
    }

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
        sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEETS.marketplace, range: "'Library'!A:T" }), 
        sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEETS.marketplace, range: "'Images'!A:D" })
      ]);
      return { 
        statusCode: 200, 
        headers, 
        body: JSON.stringify({ data: { library: libraryRes.data.values || [], images: imagesRes.data.values || [] } }) 
      };
    }

    // --- UPDATE PROFILE ---
    if (action === 'updateProfile' && mobile && data) {
      const detailsRes = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEETS.main, range: "'Clients Details'!A:A" });
      const rows = detailsRes.data.values || [];
      const rowIndex = rows.findIndex((row: any[]) => row[0] === mobile);
      
      if (rowIndex === -1) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Client not found' }) };
      
      const sheetRow = rowIndex + 1; 
      
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEETS.main,
        range: `'Clients Details'!D${sheetRow}:G${sheetRow}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[data.website || "", data.socialMedia || "", data.supportPhone || "", data.supportEmail || ""]]
        }
      });
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    // --- CLAIM FREE TEMPLATE ---
    if (action === 'claimFreeTemplate' && mobile && data) {
      const newId = `FRM_${Date.now()}`;
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEETS.main,
        range: "'Clients Forms'!A:C",
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: [[newId, mobile, data.templateId]] } 
      });

      const detailsRes = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEETS.main, range: "'Clients Details'!A:Q" });
      const rows = detailsRes.data.values || [];
      const rowIndex = rows.findIndex((row: any[]) => row[0] === mobile);
      
      if (rowIndex !== -1) {
        const sheetRow = rowIndex + 1;
        const currentUsed = parseInt(rows[rowIndex][13] || "0", 10);
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEETS.main,
          range: `'Clients Details'!N${sheetRow}`, 
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [[(currentUsed + 1).toString()]] }
        });
      }
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    // --- THE GRAND APP FETCH ---
    if (action === 'getAppDashboardData' && email) {
      const [clientsRes, detailsRes, clientFormsRes, formsRes, remindersRes] = await Promise.all([
        sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEETS.main, range: 'Clients!A:J' }),
        sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEETS.main, range: "'Clients Details'!A:Q" }),
        sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEETS.main, range: "'Clients Forms'!A:C" }),
        sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEETS.main, range: 'Forms!A:H' }),
        sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEETS.reminders, range: "'reminders'!A:F" })
      ]);

      const clients = clientsRes.data.values || [];
      const details = detailsRes.data.values || [];
      const clientForms = clientFormsRes.data.values || [];
      const forms = formsRes.data.values || [];
      const reminders = remindersRes.data.values || [];

      const clientRow = clients.find(row => row[3] === email);
      if (!clientRow) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Client not found in database' }) };

      const mobile = clientRow[1]; 
      const detailsRow = details.find(row => row[0] === mobile) || [];
      const userFormRows = clientForms.filter(row => row[1] === mobile);
      const userTemplateIds = userFormRows.map(row => row[2]); 

      const myTemplates = forms
        .filter(row => userTemplateIds.includes(row[2])) 
        .map(row => ({
          frontly_id: row[0] || "", title: row[1] || "", id: row[2] || "", category: row[3] || "",
          type: row[4] || "", credit: parseInt(row[5] || "0", 10), formUrl: row[6] || "", preview: row[7] || ""
        }));

      const userReminders = reminders
        .filter(row => row[1] === email) 
        .map(row => ({
          mobile: row[0] || "", email: row[1] || "", type: row[2] || "", date: row[3] || "", status: row[4] || "", plan: row[5] || ""
        }));

      const clientProfile = {
        frontly_id: clientRow[0] || "", mobile, company: clientRow[2] || "", email: clientRow[3] || "",
        credit: clientRow[4] || "0", used: clientRow[5] || "0", remaining: clientRow[6] || "0",
        endDate: clientRow[7] || "", status: clientRow[8] || "", googleDrive: clientRow[9] || "",
        website: detailsRow[3] || "", socialMedia: detailsRow[4] || "", supportPhone: detailsRow[5] || "",
        supportEmail: detailsRow[6] || "", darkLogo: detailsRow[7] || "", lightLogo: detailsRow[8] || "",
        coloredLogo: detailsRow[9] || "", plan: detailsRow[10] || "", planPrice: detailsRow[11] || "",
        freeTemplates: detailsRow[12] || "0", templatesUsed: detailsRow[13] || "0", firstName: detailsRow[14] || "",
        lastName: detailsRow[15] || "", maxCredits: detailsRow[16] || "0"
      };

      return { 
        statusCode: 200, headers, 
        body: JSON.stringify({ data: { profile: clientProfile, templates: myTemplates, reminders: userReminders } }) 
      };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid action provided' }) };

  } catch (error: any) {
    console.error("Google Sheets API Error:", error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
