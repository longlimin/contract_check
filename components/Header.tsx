
import React from 'react';
import { FileCheckIcon } from './icons';

export const Header: React.FC = () => {
    return (
        <header className="bg-white dark:bg-slate-900/70 backdrop-blur-sm shadow-sm sticky top-0 z-10">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-3">
                        <FileCheckIcon className="h-8 w-8 text-indigo-500" />
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
                            IntelliContract Analyzer
                        </h1>
                    </div>
                </div>
            </div>
        </header>
    );
};
