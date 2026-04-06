import { google } from 'googleapis';
import { Readable } from 'stream'; 

const SPREADSHEETS = {
  main: '1tFv2_EPpNBeejwKTjQ_n7PFKTCCyZOCNcQwUVoRd8Yg', 
  demo: '1q7GSF986adnX47toF_UZUn8Sjroxfo-dfh2Zpo76kYk',
  marketplace: '1Q4bOSNOwc-sVR--TI0GE3xCqhQSNADEb3KHHKm0kcq0',
  reminders: '1Dal_T4o3fqZ8onWiyNyftNsIFK_S64-HAKwdH2Px2yg',
  rewardsTracker: '1t8G0oh9yTqReBEY_AGKGjraUGwgWumIA1SeU1E61HNE' 
};

// Map Task IDs to their specific column in the Rewards Sheet
const TASK_COLS: Record<string, string> = {
  'g-review-brandify': 'B',
  'g-review-khetta': 'C',
  'ig-follow-brandify': 'D',
  'ig-follow-khetta': 'E',
  'tk-follow-brandify': 'F',
  'tk-follow-khetta': 'G'
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
        'https://www.googleapis.com/auth/drive' 
      ],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const drive = google.drive({ version: 'v3', auth });

    const body = JSON.parse(event.body || '{}');
    const { action, email, mobile, data } = body;

// --- SYNCHRONOUS ACCOUNT CREATION ---
    if (action === 'createClientAccount' && email && mobile && data) {
      try {
        const frontlyId = `USR_${Date.now()}`; 
        
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 14); // 14 Day trial limit
        const formattedEndDate = endDate.toISOString().split('T')[0]; 

        // 1. Create Main Client Row
        await sheets.spreadsheets.values.append({
          spreadsheetId: SPREADSHEETS.main,
          range: 'Clients!A:J',
          valueInputOption: 'USER_ENTERED',
          insertDataOption: 'INSERT_ROWS',
          requestBody: { 
            values: [[
              frontlyId, mobile, data.company, email, 
              data.credits, '0', data.credits, // Dynamic Credits
              formattedEndDate, 'Active', ''
            ]] 
          }
        });

        // 2. Create Client Details Row
        const detailsRow = Array(17).fill('');
        detailsRow[0] = mobile;
        detailsRow[10] = data.planName;    // K: Plan
        detailsRow[11] = '0';              // L: Price (0 for trial)
        detailsRow[12] = data.freeTemplates; // M: Free Templates
        detailsRow[13] = '0';              // N: Templates Used
        detailsRow[14] = data.firstName;   // O: First Name
        detailsRow[15] = data.lastName;    // P: Last Name
        detailsRow[16] = data.credits;     // Q: Max Credits

        await sheets.spreadsheets.values.append({
          spreadsheetId: SPREADSHEETS.main,
          range: "'Clients Details'!A:Q",
          valueInputOption: 'USER_ENTERED',
          insertDataOption: 'INSERT_ROWS',
          requestBody: { values: [detailsRow] }
        });

        // 3. Initialize Rewards Tracker Row
        await sheets.spreadsheets.values.append({
          spreadsheetId: SPREADSHEETS.rewardsTracker,
          range: "'Rewards'!A:G",
          valueInputOption: 'USER_ENTERED',
          insertDataOption: 'INSERT_ROWS',
          requestBody: { values: [[mobile, 'no', 'no', 'no', 'no', 'no', 'no']] }
        });

        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
      } catch (err: any) {
        console.error("Account Creation Error:", err.message);
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to initialize account data' }) };
      }
    }


    
    // --- NEW: SUBMIT TO WEBHOOK & SET "VERIFYING" ---
    if (action === 'submitRewardVerification' && mobile && data) {
      try {
        const { taskId, base64, mimeType, fileName } = data;
        const col = TASK_COLS[taskId];

        if (!col) throw new Error("Invalid task ID");

        // 1. Fire and forget to your Activepieces Webhook
        await fetch('https://cloud.activepieces.com/api/v1/webhooks/EwUDW9h0Aj3fW5sopHcg9', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            mobile, 
            taskId, 
            fileName, 
            mimeType, 
            image: base64 
          })
        }).catch(err => console.error("Webhook delivery failed:", err));

        // 2. Update Google Sheet to "verifying"
        const rewardsRes = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEETS.rewardsTracker, range: "'Rewards'!A:G" });
        const rows = rewardsRes.data.values || [];
        let rowIndex = rows.findIndex((row: any[]) => row[0] === mobile);

        if (rowIndex === -1) {
          // Create new user row with 'verifying' in the correct slot
          const newRow = [mobile, 'no', 'no', 'no', 'no', 'no', 'no'];
          const colIndex = col.charCodeAt(0) - 65; // Convert 'B' to index 1, 'C' to 2, etc.
          newRow[colIndex] = 'verifying';

          await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEETS.rewardsTracker,
            range: "'Rewards'!A:G",
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            requestBody: { values: [newRow] }
          });
        } else {
          // Update existing user
          const sheetRow = rowIndex + 1;
          await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEETS.rewardsTracker,
            range: `'Rewards'!${col}${sheetRow}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [['verifying']] }
          });
        }

        return { statusCode: 200, headers, body: JSON.stringify({ success: true, status: 'verifying' }) };
      } catch (err: any) {
        console.error("Verification Submission Error:", err.message);
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to submit verification' }) };
      }
    }

    // --- UPLOAD LOGO ---
    if (action === 'uploadLogo' && mobile && data) {
      try {
        const buffer = Buffer.from(data.base64, 'base64');
        const driveRes = await drive.files.create({
          requestBody: { name: data.fileName, parents: ['1xkFw128Xbh0y8-Z4OCkkR4yrvTtC9IKC'] },
          media: { mimeType: data.mimeType, body: Readable.from(buffer) },
          fields: 'id'
        });
        
        const newFileId = driveRes.data.id;
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
              spreadsheetId: SPREADSHEETS.main, range: `'Clients Details'!${colLetter}${sheetRow}`, valueInputOption: 'USER_ENTERED',
              requestBody: { values: [[newFileId]] }
            });
          }
        }
        return { statusCode: 200, headers, body: JSON.stringify({ success: true, fileId: newFileId }) };
      } catch (err: any) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to upload logo' }) };
      }
    }

    // --- FETCH DRIVE ASSETS ---
    if (action === 'getDriveAssets' && data?.folderId) {
      try {
        const response = await drive.files.list({
          q: `'${data.folderId}' in parents and trashed=false`,
          fields: 'files(id, name, mimeType, webContentLink, thumbnailLink)', orderBy: 'createdTime desc'
        });
        return { statusCode: 200, headers, body: JSON.stringify({ data: response.data.files || [] }) };
      } catch (err: any) {
        return { statusCode: 200, headers, body: JSON.stringify({ data: [] }) };
      }
    }

    // --- REWARDS TRACKER FETCH ---
    if (action === 'getRewardsTracker' && mobile) {
      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEETS.rewardsTracker, range: "'Rewards'!A:G" 
        });
        const rows = response.data.values || [];
        const userRow = rows.find((row: any[]) => row[0] === mobile);

        let taskStatus = {
          'g-review-brandify': 'no', 'g-review-khetta': 'no', 'ig-follow-brandify': 'no',
          'ig-follow-khetta': 'no', 'tk-follow-brandify': 'no', 'tk-follow-khetta': 'no'
        };

        if (userRow) {
          taskStatus = {
            'g-review-brandify': userRow[1]?.toLowerCase() || 'no',
            'g-review-khetta': userRow[2]?.toLowerCase() || 'no',
            'ig-follow-brandify': userRow[3]?.toLowerCase() || 'no',
            'ig-follow-khetta': userRow[4]?.toLowerCase() || 'no',
            'tk-follow-brandify': userRow[5]?.toLowerCase() || 'no',
            'tk-follow-khetta': userRow[6]?.toLowerCase() || 'no'
          };
        }
        return { statusCode: 200, headers, body: JSON.stringify({ data: taskStatus }) };
      } catch (err: any) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to fetch rewards' }) };
      }
    }

    // --- DEMO FETCH ---
    if (action === 'getDemoTemplates') {
      const response = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEETS.demo, range: "'Demo Templates'!A:G" });
      return { statusCode: 200, headers, body: JSON.stringify({ data: response.data.values || [] }) };
    }

    // --- MARKETPLACE FETCH ---
    if (action === 'getMarketplaceData') {
      const [libraryRes, imagesRes] = await Promise.all([
        sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEETS.marketplace, range: "'Library'!A:T" }), 
        sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEETS.marketplace, range: "'Images'!A:D" })
      ]);
      return { statusCode: 200, headers, body: JSON.stringify({ data: { library: libraryRes.data.values || [], images: imagesRes.data.values || [] } }) };
    }

    // --- UPDATE PROFILE ---
    if (action === 'updateProfile' && mobile && data) {
      const detailsRes = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEETS.main, range: "'Clients Details'!A:A" });
      const rows = detailsRes.data.values || [];
      const rowIndex = rows.findIndex((row: any[]) => row[0] === mobile);
      if (rowIndex === -1) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Client not found' }) };
      const sheetRow = rowIndex + 1; 
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEETS.main, range: `'Clients Details'!D${sheetRow}:G${sheetRow}`, valueInputOption: 'USER_ENTERED',
        requestBody: { values: [[data.website || "", data.socialMedia || "", data.supportPhone || "", data.supportEmail || ""]] }
      });
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    // --- CLAIM FREE TEMPLATE ---
    if (action === 'claimFreeTemplate' && mobile && data) {
      const newId = `FRM_${Date.now()}`;
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEETS.main, range: "'Clients Forms'!A:C", valueInputOption: 'USER_ENTERED', insertDataOption: 'INSERT_ROWS',
        requestBody: { values: [[newId, mobile, data.templateId]] } 
      });
      const detailsRes = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEETS.main, range: "'Clients Details'!A:Q" });
      const rows = detailsRes.data.values || [];
      const rowIndex = rows.findIndex((row: any[]) => row[0] === mobile);
      if (rowIndex !== -1) {
        const sheetRow = rowIndex + 1;
        const currentUsed = parseInt(rows[rowIndex][13] || "0", 10);
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEETS.main, range: `'Clients Details'!N${sheetRow}`, valueInputOption: 'USER_ENTERED',
          requestBody: { values: [[(currentUsed + 1).toString()]] }
        });
      }
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    // --- GET APP DASHBOARD DATA ---
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

      return { statusCode: 200, headers, body: JSON.stringify({ data: { profile: clientProfile, templates: myTemplates, reminders: userReminders } }) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid action provided' }) };
  } catch (error: any) {
    console.error("Google Sheets API Error:", error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
