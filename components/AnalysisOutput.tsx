
import React from 'react';
import { AnalysisResult, ComparisonResult, RiskSeverity } from '../types';
import { RiskCard } from './RiskCard';
import { RiskHeatmap } from './RiskHeatmap';
import { AlertTriangleIcon, FileCheckIcon } from './icons';

interface AnalysisOutputProps {
    analysisResult: AnalysisResult | null;
    comparisonResult: ComparisonResult | null;
    isLoading: boolean;
    error: string | null;
    activeTab: 'analysis' | 'comparison';
    setActiveTab: (tab: 'analysis' | 'comparison') => void;
}

const TabButton: React.FC<{ active: boolean, onClick: () => void, disabled: boolean, children: React.ReactNode }> = ({ active, onClick, disabled, children }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 focus:outline-none ${
            active
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-700 dark:hover:text-slate-300'
        } ${disabled ? 'cursor-not-allowed text-slate-400 dark:text-slate-600' : ''}`}
    >
        {children}
    </button>
);


export const AnalysisOutput: React.FC<AnalysisOutputProps> = ({
    analysisResult,
    comparisonResult,
    isLoading,
    error,
    activeTab,
    setActiveTab,
}) => {
    const renderContent = () => {
        if (isLoading) {
            return <LoadingSkeleton />;
        }
        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertTriangleIcon className="w-12 h-12 text-red-500 mb-4" />
                    <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">Analysis Failed</h3>
                    <p className="text-red-600 dark:text-red-400 mt-2">{error}</p>
                </div>
            );
        }

        if (!analysisResult && !comparisonResult) {
            return (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-100 dark:bg-slate-800/60 rounded-lg">
                    <FileCheckIcon className="w-12 h-12 text-slate-400 dark:text-slate-500 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Ready to Analyze</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        Enter a contract on the left and click "Analyze Contract" to see the AI-powered risk assessment.
                    </p>
                </div>
            );
        }

        const currentResult = activeTab === 'analysis' ? analysisResult : null;
        const currentComparison = activeTab === 'comparison' ? comparisonResult : null;
        
        return (
            <div className="space-y-6">
                {currentResult && (
                    <>
                        <div>
                            <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-100">Executive Summary</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 p-4 rounded-md">{currentResult.summary}</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-100">Risk Report</h3>
                            <RiskHeatmap risks={currentResult.risks} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">Risk Breakdown</h3>
                            <div className="space-y-4">
                                {currentResult.risks.length > 0 ? (
                                    currentResult.risks.map((risk, index) => <RiskCard key={index} risk={risk} />)
                                ) : (
                                    <p className="text-slate-500 dark:text-slate-400">No significant risks were identified.</p>
                                )}
                            </div>
                        </div>
                    </>
                )}
                 {currentComparison && (
                     <>
                        <div>
                            <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-100">Comparison Summary</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 p-4 rounded-md">{currentComparison.summary}</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">Detailed Changes</h3>
                             <div className="space-y-4">
                                {currentComparison.changes.map((change, index) => (
                                    <div key={index} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                                        <div className="flex items-center mb-2">
                                            <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${change.change_type === 'Addition' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : change.change_type === 'Deletion' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'}`}>
                                                {change.change_type}
                                            </span>
                                            <h4 className="ml-3 font-semibold text-slate-700 dark:text-slate-200">{change.description}</h4>
                                        </div>
                                        {change.original_clause && <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded-md my-2 line-through font-mono">-{change.original_clause}</p>}
                                        {change.revised_clause && <p className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded-md my-2 font-mono">+{change.revised_clause}</p>}
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2"><strong>Risk Implication:</strong> {change.risk_implication}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                 )}

            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-slate-800/50 rounded-lg shadow-md p-6 h-full overflow-y-auto">
             <div className="border-b border-slate-200 dark:border-slate-700 mb-6">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    <TabButton
                        active={activeTab === 'analysis'}
                        onClick={() => setActiveTab('analysis')}
                        disabled={!analysisResult}
                    >
                        Risk Analysis
                    </TabButton>
                    <TabButton
                        active={activeTab === 'comparison'}
                        onClick={() => setActiveTab('comparison')}
                        disabled={!comparisonResult}
                    >
                        Version Comparison
                    </TabButton>
                </nav>
            </div>
            {renderContent()}
        </div>
    );
};


const LoadingSkeleton: React.FC = () => {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="space-y-3">
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
            <div className="space-y-3">
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                <div className="grid grid-cols-5 gap-4">
                    <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded col-span-1"></div>
                    <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded col-span-1"></div>
                    <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded col-span-1"></div>
                    <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded col-span-1"></div>
                    <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded col-span-1"></div>
                </div>
            </div>
            <div className="space-y-4">
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
        </div>
    );
};
