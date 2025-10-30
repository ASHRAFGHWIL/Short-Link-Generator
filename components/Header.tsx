
import React from 'react';

const LinkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 inline-block mr-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
);


export const Header: React.FC = () => {
  return (
    <header className="text-center mb-8">
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 py-2 flex items-center justify-center">
        <LinkIcon />
        Short Link Generator
      </h1>
      <p className="text-slate-400 mt-2 text-lg">Create concise, shareable links in seconds.</p>
    </header>
  );
};
