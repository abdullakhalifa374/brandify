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
