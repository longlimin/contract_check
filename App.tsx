
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ContractInput } from './components/ContractInput';
import { AnalysisOutput } from './components/AnalysisOutput';
import { analyzeContract, compareContracts } from './services/geminiService';
import { AnalysisResult, ComparisonResult, AnalysisMode } from './types';
import { EXAMPLE_CONTRACT, EXAMPLE_REVISED_CONTRACT } from './constants';

const EXAMPLE_COMPANY_RULES = `
1.  Governing Law: All contracts must be governed by the laws of the State of Delaware.
2.  Payment Terms: Standard payment terms are Net 30. Any deviation requires explicit approval from the Finance department.
3.  Limitation of Liability: The company's liability shall not exceed the total fees paid by the client in the preceding three (3) months.
4.  Confidentiality: Confidentiality obligations must survive the termination of the agreement for a minimum of five (5) years.
`;

const App: React.FC = () => {
    const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('single');
    const [originalContract, setOriginalContract] = useState<string>(EXAMPLE_CONTRACT);
    const [revisedContract, setRevisedContract] = useState<string>(EXAMPLE_REVISED_CONTRACT);
    const [companyRules, setCompanyRules] = useState<string>(EXAMPLE_COMPANY_RULES);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'analysis' | 'comparison'>('analysis');

    const handleAnalyze = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        setComparisonResult(null);

        try {
            if (analysisMode === 'single') {
                if (!originalContract.trim()) {
                    setError("Contract text cannot be empty.");
                    setIsLoading(false);
                    return;
                }
                const result = await analyzeContract(originalContract, companyRules);
                setAnalysisResult(result);
                setActiveTab('analysis');
            } else {
                if (!originalContract.trim() || !revisedContract.trim()) {
                    setError("Both original and revised contract texts are required.");
                    setIsLoading(false);
                    return;
                }
                const result = await compareContracts(originalContract, revisedContract);
                setComparisonResult(result);
                setActiveTab('comparison');
            }
        } catch (e: any) {
            setError(e.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [analysisMode, originalContract, revisedContract, companyRules]);

    return (
        <div className="min-h-screen font-sans text-slate-800 dark:text-slate-200">
            <Header />
            <main className="p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-screen-2xl mx-auto">
                    <ContractInput
                        analysisMode={analysisMode}
                        setAnalysisMode={setAnalysisMode}
                        originalContract={originalContract}
                        setOriginalContract={setOriginalContract}
                        revisedContract={revisedContract}
                        setRevisedContract={setRevisedContract}
                        companyRules={companyRules}
                        setCompanyRules={setCompanyRules}
                        onAnalyze={handleAnalyze}
                        isLoading={isLoading}
                    />
                    <AnalysisOutput
                        analysisResult={analysisResult}
                        comparisonResult={comparisonResult}
                        isLoading={isLoading}
                        error={error}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />
                </div>
            </main>
        </div>
    );
};

export default App;