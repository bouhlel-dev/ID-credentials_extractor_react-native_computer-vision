import { createClient } from '@supabase/supabase-js';

// Define the ID scan data structure
export interface IDScanData {
  id?: number;
  name: string;
  dateOfBirth: string;
  idNumber: string;
  address: string;
  issueDate?: string;
  expiryDate?: string;
  scanDate: string;
  additionalInfo?: string;
}

const supabaseUrl = 'https://xqonwlkxhalgvuyssgsv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhxb253bGt4aGFsZ3Z1eXNzZ3N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNjgzMDQsImV4cCI6MjA2Mzg0NDMwNH0.sQyrg-eY5tyoWwUBlW_trzvqaPKcGNubfec3Y3_JlMQ';

const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize the database
export const initDatabase = async (): Promise<void> => {
  // No need to create tables with Supabase as they are managed through the dashboard
  return Promise.resolve();
};

// Save a new ID scan to the database
export const saveIDScan = async (scanData: IDScanData): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('id_scans')
      .insert(scanData)
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error('Failed to save scan:', error);
    throw error;
  }
};

// Get all ID scans from the database
export const getAllIDScans = async (): Promise<IDScanData[]> => {
  try {
    const { data, error } = await supabase
      .from('id_scans')
      .select('*')
      .order('scanDate', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to fetch scans:', error);
    throw error;
  }
};

// Delete an ID scan from the database
export const deleteIDScan = async (id: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('id_scans')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to delete scan:', error);
    throw error;
  }
};

// Get a single ID scan by ID
export const getIDScanById = async (id: number): Promise<IDScanData | null> => {
  try {
    const { data, error } = await supabase
      .from('id_scans')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to fetch scan:', error);
    throw error;
  }
};