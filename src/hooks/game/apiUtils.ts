
import { toast } from 'sonner';

// Define the base URL for your Swagger API
const API_BASE_URL = "https://your-swagger-api-url.com/api";

// Define types for API responses
interface ApiResponse<T> {
  data?: T;
  error?: string;
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
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Add any auth headers if required
        // 'Authorization': `Bearer ${YOUR_AUTH_TOKEN}`,
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
 * Get questions from the API
 * @param category Optional category filter
 * @param difficulty Optional difficulty level
 * @returns Promise with the questions data
 */
export async function fetchQuestions(category?: string, difficulty?: string) {
  let endpoint = '/questions';
  const queryParams = [];
  
  if (category) queryParams.push(`category=${encodeURIComponent(category)}`);
  if (difficulty) queryParams.push(`difficulty=${encodeURIComponent(difficulty)}`);
  
  if (queryParams.length > 0) {
    endpoint += `?${queryParams.join('&')}`;
  }
  
  return fetchFromApi(endpoint);
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
  // In a real implementation, you might want to store this in localStorage 
  // or another persistent storage
  (window as any).API_BASE_URL = newUrl;
  console.log(`API URL configured to: ${newUrl}`);
  toast.success('API connection configured successfully!');
}
