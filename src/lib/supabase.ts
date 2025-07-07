import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Meeting, CreateMeetingData, UpdateMeetingData } from '@/types/meeting';

// Database types matching the PRD requirements
export interface Database {
  public: {
    Tables: {
      meetings: {
        Row: Meeting;
        Insert: CreateMeetingData;
        Update: UpdateMeetingData;
      };
    };
  };
}

// Environment validation
const validateEnvironment = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }
  
  if (!supabaseKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
  }
  
  return { supabaseUrl, supabaseKey };
};

// Initialize Supabase client
let supabaseClient: SupabaseClient<Database> | null = null;

export const getSupabaseClient = (): SupabaseClient<Database> => {
  if (!supabaseClient) {
    const { supabaseUrl, supabaseKey } = validateEnvironment();
    supabaseClient = createClient<Database>(supabaseUrl, supabaseKey);
  }
  return supabaseClient;
};

// Export the client for convenience
export const supabase = getSupabaseClient();

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// Helper function to handle API responses
const handleApiResponse = <T>(data: T | null, error: any): ApiResponse<T> => {
  if (error) {
    console.error('Supabase API Error:', error);
    
    // Handle different types of errors
    let errorMessage = 'An unknown error occurred';
    
    if (error.message) {
      errorMessage = error.message;
    } else if (error.code) {
      errorMessage = `Database error (${error.code})`;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error.details) {
      errorMessage = error.details;
    }
    
    // Check for common database issues
    if (errorMessage.includes('relation "meetings" does not exist')) {
      errorMessage = 'Database table not found. Please run the database setup script.';
    } else if (errorMessage.includes('permission denied')) {
      errorMessage = 'Database permission denied. Please check your Row Level Security policies.';
    }
    
    return {
      data: null,
      error: errorMessage,
      success: false,
    };
  }
  
  return {
    data,
    error: null,
    success: true,
  };
};

// Database operations for Meetings
export const meetingsAPI = {
  // Get all meetings
  async getAll(): Promise<ApiResponse<Meeting[]>> {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .order('time', { ascending: false });
      
      return handleApiResponse(data, error);
    } catch (error) {
      return handleApiResponse(null, error);
    }
  },

  // Get a single meeting by ID
  async getById(id: string): Promise<ApiResponse<Meeting>> {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('id', id)
        .single();
      
      return handleApiResponse(data, error);
    } catch (error) {
      return handleApiResponse(null, error);
    }
  },

  // Create a new meeting
  async create(meeting: CreateMeetingData): Promise<ApiResponse<Meeting>> {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .insert([meeting])
        .select()
        .single();
      
      return handleApiResponse(data, error);
    } catch (error) {
      return handleApiResponse(null, error);
    }
  },

  // Update an existing meeting
  async update(id: string, updates: UpdateMeetingData): Promise<ApiResponse<Meeting>> {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      return handleApiResponse(data, error);
    } catch (error) {
      return handleApiResponse(null, error);
    }
  },

  // Delete a meeting
  async delete(id: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', id);
      
      return handleApiResponse(null, error);
    } catch (error) {
      return handleApiResponse(null, error);
    }
  }
};

// Export the API
export const api = {
  meetings: meetingsAPI,
};

// Health check function
export const healthCheck = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('meetings')
      .select('id')
      .limit(1);
    
    return !error;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
};