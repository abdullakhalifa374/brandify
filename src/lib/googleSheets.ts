// Utility to make calls to our secure Netlify backend

export const fetchFromSheets = async (payload: { action: string; email?: string; data?: any }) => {
  try {
    // When deployed, this hits the netlify function. Locally, Netlify CLI handles it.
    const response = await fetch('/.netlify/functions/google-sheets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch from Google Sheets');
    }

    return result.data;
  } catch (error) {
    console.error("Error communicating with Sheets backend:", error);
    throw error;
  }
};

// --- Helper Functions to use in your React Components ---

export const getDemoTemplates = async () => {
  return await fetchFromSheets({ action: 'getDemoTemplates' });
};

export const getMarketplaceData = async () => {
  return await fetchFromSheets({ action: 'getMarketplaceData' });
};

export const getClientData = async (userEmail: string) => {
  return await fetchFromSheets({ action: 'getClientData', email: userEmail });
};

export const getAppDashboardData = async (userEmail: string) => {
  return await fetchFromSheets({ action: 'getAppDashboardData', email: userEmail });
};

export const updateClientProfile = async (mobile: string, profileData: any) => {
  return await fetchFromSheets({ action: 'updateProfile', mobile, data: profileData });
};

export const claimFreeTemplate = async (mobile: string, templateId: string) => {
  return await fetchFromSheets({ action: 'claimFreeTemplate', mobile, data: { templateId } });
};

// --- DRIVE API HELPER ---
export const getDriveAssets = async (folderId: string) => {
  return await fetchFromSheets({ action: 'getDriveAssets', data: { folderId } });
};

// --- REWARDS API HELPERS ---
export const getRewardsTracker = async (mobile: string) => {
  return await fetchFromSheets({ action: 'getRewardsTracker', mobile });
};

export const submitRewardVerification = async (mobile: string, taskId: string, base64: string, mimeType: string, fileName: string) => {
  return await fetchFromSheets({ action: 'submitRewardVerification', mobile, data: { taskId, base64, mimeType, fileName } });
};
