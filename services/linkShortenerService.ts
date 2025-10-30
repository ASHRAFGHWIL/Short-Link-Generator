import { GoogleGenAI, Type } from '@google/genai';

/**
 * Simulates shortening a URL by returning a promise that resolves with a fake short URL.
 * Includes basic validation and a delay to mimic a real API call.
 *
 * @param longUrl The original, long URL to be shortened.
 * @returns A promise that resolves to the shortened URL string.
 */
export const shortenUrl = (longUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const trimmedUrl = longUrl.trim();

      if (!trimmedUrl) {
        reject(new Error('URL cannot be empty. Please enter a URL.'));
        return;
      }

      // Check for a valid protocol.
      if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
        reject(new Error('Invalid protocol. Your URL must start with "http://" or "https://".'));
        return;
      }

      try {
        const urlObject = new URL(trimmedUrl);

        // Check if the hostname is valid (e.g., not localhost and contains a domain).
        if (['localhost', '127.0.0.1'].includes(urlObject.hostname)) {
          reject(new Error('Shortening local URLs is not supported. Please use a public URL.'));
          return;
        }
        
        // A simple check for a valid top-level domain. Hostnames for public URLs
        // should contain at least one period.
        if (!urlObject.hostname.includes('.')) {
          reject(new Error('Invalid hostname. The URL does not appear to have a valid domain.'));
          return;
        }

      } catch (error) {
        // This error is thrown by `new URL()` if the URL is fundamentally malformed.
        reject(new Error('The URL format is invalid. Please check for typos or errors.'));
        return;
      }
      
      // Generate a random 6-character string for the short link path
      const randomString = Math.random().toString(36).substring(2, 8);
      
      resolve(`https://shrtco.de/${randomString}`);
    }, 1200); // Simulate a 1.2-second network delay
  });
};

/**
 * Simulates customizing a short URL with a user-defined path.
 * Includes enhanced validation for path length, characters, and reserved words.
 *
 * @param currentShortUrl The currently generated short URL.
 * @param customPath The desired custom path from the user.
 * @returns A promise that resolves to the new, customized URL string.
 */
export const customizeShortUrl = (currentShortUrl: string, customPath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const trimmedPath = customPath.trim();

      // 1. Check for empty path
      if (!trimmedPath) {
        reject(new Error('Custom path cannot be empty.'));
        return;
      }

      // 2. Check path length
      if (trimmedPath.length < 4) {
        reject(new Error('Custom path must be at least 4 characters long.'));
        return;
      }
      if (trimmedPath.length > 32) {
        reject(new Error('Custom path cannot be more than 32 characters long.'));
        return;
      }

      // 3. Validate custom path for allowed characters (alphanumeric, dash, underscore)
      if (!/^[a-zA-Z0-9_-]+$/.test(trimmedPath)) {
        reject(new Error('Path can only contain letters, numbers, dashes (-), and underscores (_).'));
        return;
      }
      
      // 4. Check against a list of common reserved words
      const reservedPaths = [
        'test', 'admin', 'user', 'link', 'api', 'blog', 'contact', 'help',
        'status', 'docs', 'pricing', 'about', 'jobs', 'legal', 'support',
        'mail', 'url', 'shorten', 'home', 'dashboard', 'login', 'signup'
      ];
      if (reservedPaths.includes(trimmedPath.toLowerCase())) {
        reject(new Error(`The path "${trimmedPath}" is reserved. Please try another.`));
        return;
      }

      try {
        const urlObject = new URL(currentShortUrl);
        const newUrl = `${urlObject.origin}/${trimmedPath}`;
        resolve(newUrl);
      } catch (error) {
        reject(new Error('Failed to parse the current short URL.'));
      }
    }, 900); // Simulate a shorter 0.9-second network delay for customization
  });
};

/**
 * Generates URL path suggestions using the Gemini API.
 *
 * @param userPrompt The user's description for the link.
 * @param longUrl The original URL to be analyzed.
 * @param mode The suggestion mode, either 'fast' for low-latency or 'smart' for complex analysis.
 * @returns A promise that resolves to an array of suggested path strings.
 */
export const generatePathSuggestions = async (
  userPrompt: string,
  longUrl: string,
  mode: 'fast' | 'smart'
): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const model = mode === 'smart' ? 'gemini-2.5-pro' : 'gemini-2.5-flash-lite';
  const config = mode === 'smart' ? { thinkingConfig: { thinkingBudget: 32768 } } : {};

  const systemInstruction = `You are an expert in creating short, memorable, and SEO-friendly URL paths.
Your task is to generate 4 path suggestions based on a user's prompt and the original long URL.
The paths must be URL-safe, containing only lowercase letters, numbers, and hyphens.
The paths should be between 4 and 20 characters long.
Do not include any slashes ('/').
Return your answer as a JSON array of strings.`;
  
  const fullPrompt = `
    User Prompt: "${userPrompt}"
    Original URL: "${longUrl}"
    
    Generate 4 creative and relevant URL path suggestions based on the provided information.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: fullPrompt,
      config: {
        ...config,
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
            description: 'A URL-safe path suggestion.',
          },
        },
      },
    });

    const jsonString = response.text.trim();
    const suggestions = JSON.parse(jsonString);
    
    if (!Array.isArray(suggestions) || !suggestions.every(s => typeof s === 'string')) {
      throw new Error('AI returned an invalid format.');
    }

    return suggestions;
  } catch (error) {
    console.error('Error generating suggestions:', error);
    throw new Error('Failed to get suggestions from the AI. Please try again.');
  }
};

// --- Analytics Service ---

const CLICK_DATA_KEY = 'shortLinkClicks';

/**
 * Retrieves the entire click data object from localStorage.
 * @returns A record mapping short URLs to their click counts.
 */
const getClickData = (): Record<string, number> => {
  try {
    const data = localStorage.getItem(CLICK_DATA_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error("Failed to parse click data from localStorage", e);
    return {};
  }
};

/**
 * Saves the entire click data object to localStorage.
 * @param data The record mapping short URLs to their click counts.
 */
const setClickData = (data: Record<string, number>): void => {
  try {
    localStorage.setItem(CLICK_DATA_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save click data to localStorage", e);
  }
};

/**
 * Initializes the click count for a new short URL to 0 if it doesn't exist.
 * @param shortUrl The short URL to initialize.
 */
export const initializeClickCount = (shortUrl: string): void => {
  const clicks = getClickData();
  if (clicks[shortUrl] === undefined) {
    clicks[shortUrl] = 0;
    setClickData(clicks);
  }
};

/**
 * Gets the click count for a specific short URL.
 * @param shortUrl The short URL to check.
 * @returns The number of clicks.
 */
export const getClickCount = (shortUrl: string): number => {
  const clicks = getClickData();
  return clicks[shortUrl] ?? 0;
};

/**
 * Increments the click count for a specific short URL.
 * @param shortUrl The short URL that was clicked.
 * @returns The new, updated click count.
 */
export const incrementClickCount = (shortUrl: string): number => {
  const clicks = getClickData();
  const newCount = (clicks[shortUrl] ?? 0) + 1;
  clicks[shortUrl] = newCount;
  setClickData(clicks);
  return newCount;
};