
import React from 'react';

interface UrlInputFormProps {
  longUrl: string;
  setLongUrl: (url: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const UrlInputForm: React.FC<UrlInputFormProps> = ({
  longUrl,
  setLongUrl,
  onSubmit,
  isLoading,
}) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="longUrl" className="block text-sm font-medium text-slate-300 mb-2">
        Enter your long URL
      </label>
      <input
        id="longUrl"
        type="url"
        value={longUrl}
        onChange={(e) => setLongUrl(e.target.value)}
        placeholder="https://example.com/very/long/url/to/shorten"
        className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all"
        disabled={isLoading}
      />
      <button
        type="submit"
        className="w-full p-3 mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-500/50 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition-colors duration-200 flex items-center justify-center shadow-lg shadow-indigo-900/50"
        disabled={isLoading}
      >
        {isLoading ? 'Creating...' : 'Shorten Link'}
      </button>
    </form>
  );
};
