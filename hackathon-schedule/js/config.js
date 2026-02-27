// js/config.js
// --- CONFIGURATION ---
// Replace these with your actual Google Sheet ID and API Key.
// Ensure your Google Sheet is public (Anyone with the link can view).

// The ID is the long string in the sheet URL: 
// https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit
export const SHEET_ID = '1dS0CVnKdzaCgZmGTgnuKRNSCNPZAY0m2SMnGXjc8hms';

// You can generate an API Key from the Google Cloud Console.
// Make sure to restrict it to the Google Sheets API.
export const API_KEY = 'AIzaSyCCBa31VpshQdowh15w0lNNVh9x34Ud92o';

// The range to fetch from the sheet `=(e.g., 'Sheet1!A:J' or simply 'Sheet1' to get everything).
// Update this if your sheet name is different or you only want a specific range.
export const SHEET_RANGE = 'Sheet1';
