
import { toast } from 'sonner';
import { Question } from '@/types/game';

// Define the base URL for the Supabase REST API
const API_BASE_URL = "https://unveweezricvhihoudna.supabase.co/rest/v1";

// Define the API key (anon key) from Supabase
const SUPABASE_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVudmV3ZWV6cmljdmhpaG91ZG5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3NDY0OTAsImV4cCI6MjA2MTMyMjQ5MH0.sqxKlYhJGPfx67v7Vflc2UijACuHvtz2u2KLL-IljMo";

// Define types for API responses
interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Define the structure of the question from the API
interface ApiQuestion {
  id: string;
  question: string;
  correct_answer: string;
  options: string[];
  category: string;
  difficulty: string;
  explanation?: string;
}

/**
 * Generic function to fetch data from the API
 * @param endpoint The API endpoint to call
 * @param options Fetch options
 * @returns Promise with the API response
 */
export async function fetchFromApi<T>(
  endpoint: string, 
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    // Get the configured API URL or use the default
    const apiUrl = (window as any).API_BASE_URL || API_BASE_URL;
    
    const response = await fetch(`${apiUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'apikey': SUPABASE_API_KEY,
        'Authorization': `Bearer ${SUPABASE_API_KEY}`
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData);
      return { 
        error: errorData.message || `Error: ${response.status} ${response.statusText}` 
      };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('API Request failed:', error);
    toast.error('Failed to connect to API. Please check your network connection.');
    return { error: 'Network error, could not connect to API' };
  }
}

/**
 * Transform API questions to our Question format
 * @param apiQuestions Questions from the API
 * @returns Questions in our app format
 */
function transformQuestions(apiQuestions: ApiQuestion[]): Question[] {
  return apiQuestions.map(q => {
    // Generate a numeric ID from the string ID using simple hash
    const idNumber = hashStringToNumber(q.id);
    
    // Normalize difficulty to match our app's format
    let normalizedDifficulty: "easy" | "medium" | "hard" = "easy";
    if (q.difficulty) {
      const difficultyLower = q.difficulty.toLowerCase();
      if (difficultyLower === "easy" || difficultyLower === "medium" || difficultyLower === "hard") {
        normalizedDifficulty = difficultyLower as "easy" | "medium" | "hard";
      }
    }
    
    return {
      id: idNumber,
      question: q.question,
      correctAnswer: q.correct_answer,
      options: q.options || [],
      category: q.category,
      difficulty: normalizedDifficulty
    };
  });
}

/**
 * Get questions from the API
 * @param category Optional category filter
 * @param difficulty Optional difficulty level
 * @returns Promise with the questions data
 */
export async function fetchQuestions(category?: string, difficulty?: string): Promise<ApiResponse<Question[]>> {
  let endpoint = '/questions';
  const queryParams = [];
  
  // Using PostgreSQL eq.value format for filtering in Supabase REST
  if (category) queryParams.push(`category=eq.${encodeURIComponent(category)}`);
  if (difficulty) queryParams.push(`difficulty=eq.${encodeURIComponent(difficulty)}`);
  
  if (queryParams.length > 0) {
    endpoint += `?${queryParams.join('&')}`;
  }
  
  try {
    const response = await fetchFromApi<ApiQuestion[]>(endpoint);
    
    if (response.error) {
      return { error: response.error };
    }
    
    if (!response.data) {
      return { error: 'No data received from API' };
    }
    
    // Transform the API questions to our format
    const questions = transformQuestions(response.data);
    return { data: questions };
  } catch (error) {
    console.error('Error fetching questions:', error);
    return { error: 'Failed to fetch questions' };
  }
}

// Simple hash function to convert UUID string to number
function hashStringToNumber(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Send game results to the API
 * @param gameData The game data to send
 * @returns Promise with the API response
 */
export async function saveGameResults(gameData: any) {
  return fetchFromApi('/games', {
    method: 'POST',
    body: JSON.stringify(gameData),
  });
}

/**
 * Configure the API base URL
 * @param newUrl The new base URL for the API
 */
export function configureApiUrl(newUrl: string) {
  // Store the API URL in window object for persistence during the session
  (window as any).API_BASE_URL = newUrl;
  console.log(`API URL configured to: ${newUrl}`);
  toast.success('API connection configured successfully!');
  
  // Store in localStorage for persistence between sessions
  try {
    localStorage.setItem('API_BASE_URL', newUrl);
  } catch (e) {
    console.warn('Could not save API URL to localStorage:', e);
  }
}

// Initialize API URL from localStorage if available
try {
  const savedApiUrl = localStorage.getItem('API_BASE_URL');
  if (savedApiUrl) {
    (window as any).API_BASE_URL = savedApiUrl;
    console.log(`Initialized API URL from localStorage: ${savedApiUrl}`);
  }
} catch (e) {
  console.warn('Could not read API URL from localStorage:', e);
}
