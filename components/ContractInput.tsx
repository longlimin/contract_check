import React, { useRef } from 'react';
import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';
import { AnalysisMode } from '../types';
import { ZapIcon, UploadIcon } from './icons';

// Set the worker source for pdf.js from the CDN
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.5.136/build/pdf.worker.min.mjs`;

interface ContractInputProps {
    analysisMode: AnalysisMode;
    setAnalysisMode: (mode: AnalysisMode) => void;
    originalContract: string;
    setOriginalContract: (text: string) => void;
    revisedContract: string;
    setRevisedContract: (text: string) => void;
    companyRules: string;
    setCompanyRules: (text: string) => void;
    onAnalyze: () => void;
    isLoading: boolean;
}

const ModeButton: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900 ${
            active
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
        }`}
    >
        {children}
    </button>
);

const UploadButton: React.FC<{ onClick: () => void; disabled: boolean }> = ({ onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="flex items-center space-x-2 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
        <UploadIcon className="w-4 h-4" />
        <span>Upload File</span>
    </button>
);

export const ContractInput: React.FC<ContractInputProps> = ({
    analysisMode,
    setAnalysisMode,
    originalContract,
    setOriginalContract,
    revisedContract,
    setRevisedContract,
    companyRules,
    setCompanyRules,
    onAnalyze,
    isLoading,
}) => {
    const originalContractInputRef = useRef<HTMLInputElement>(null);
    const revisedContractInputRef = useRef<HTMLInputElement>(null);
    const companyRulesInputRef = useRef<HTMLInputElement>(null);

    const handleFileParse = async (file: File, setter: (text: string) => void) => {
        if (!file) return;
        const extension = file.name.split('.').pop()?.toLowerCase();

        try {
            let text = '';
            switch (extension) {
                case 'txt':
                    text = await file.text();
                    break;
                case 'pdf':
                    const arrayBufferPdf = await file.arrayBuffer();
                    const pdf = await pdfjs.getDocument(arrayBufferPdf).promise;
                    const pageTexts = [];
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const content = await page.getTextContent();
                        pageTexts.push(content.items.map((item: any) => item.str).join(' '));
                    }
                    text = pageTexts.join('\n\n');
                    break;
                case 'doc':
                case 'docx':
                    const arrayBufferDoc = await file.arrayBuffer();
                    const result = await mammoth.extractRawText({ arrayBuffer: arrayBufferDoc });
                    text = result.value;
                    break;
                default:
                    alert('Unsupported file type. Please upload a .txt, .pdf, .doc, or .docx file.');
                    return;
            }
            setter(text);
        } catch (error) {
            console.error("Error parsing file:", error);
            alert("Failed to read or parse the file. It might be corrupted.");
        }
    };

    const createFileInputHandler = (setter: (text: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileParse(e.target.files[0], setter);
        }
        e.target.value = ''; // Reset for re-uploading the same file
    };

    return (
        <div className="bg-white dark:bg-slate-800/50 rounded-lg shadow-md p-6 flex flex-col space-y-6 h-full">
            <input type="file" ref={originalContractInputRef} onChange={createFileInputHandler(setOriginalContract)} className="hidden" accept=".txt,.pdf,.doc,.docx" />
            <input type="file" ref={revisedContractInputRef} onChange={createFileInputHandler(setRevisedContract)} className="hidden" accept=".txt,.pdf,.doc,.docx" />
            <input type="file" ref={companyRulesInputRef} onChange={createFileInputHandler(setCompanyRules)} className="hidden" accept=".txt,.pdf,.doc,.docx" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 sm:mb-0">Contract Input</h2>
                <div className="flex space-x-2 p-1 bg-slate-200 dark:bg-slate-900 rounded-lg">
                    <ModeButton active={analysisMode === 'single'} onClick={() => setAnalysisMode('single')}>
                        Single Analysis
                    </ModeButton>
                    <ModeButton active={analysisMode === 'compare'} onClick={() => setAnalysisMode('compare')}>
                        Compare Versions
                    </ModeButton>
                </div>
            </div>

            <div className="flex-grow flex flex-col space-y-4 min-h-0">
                {analysisMode === 'single' ? (
                    <>
                        <div className="flex flex-col space-y-2 flex-grow min-h-0">
                            <div className="flex justify-between items-center mb-1">
                                <label htmlFor="original-contract" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Contract Text
                                </label>
                                <UploadButton onClick={() => originalContractInputRef.current?.click()} disabled={isLoading} />
                            </div>
                            <textarea
                                id="original-contract"
                                value={originalContract}
                                onChange={(e) => setOriginalContract(e.target.value)}
                                placeholder="Paste the contract text here or upload a file..."
                                className="w-full h-full p-3 text-sm font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div className="flex flex-col space-y-2">
                             <div className="flex justify-between items-center mb-1">
                                <label htmlFor="company-rules" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Company Rules & Policies (Optional)
                                </label>
                                 <UploadButton onClick={() => companyRulesInputRef.current?.click()} disabled={isLoading} />
                            </div>
                            <textarea
                                id="company-rules"
                                value={companyRules}
                                onChange={(e) => setCompanyRules(e.target.value)}
                                placeholder="Paste internal policies or upload a file to check for compliance conflicts..."
                                className="w-full p-3 text-sm font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                rows={8}
                            />
                        </div>
                    </>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                        <div className="flex flex-col space-y-2 min-h-0">
                             <div className="flex justify-between items-center mb-1">
                                <label htmlFor="original-contract-compare" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Original Contract
                                </label>
                                <UploadButton onClick={() => originalContractInputRef.current?.click()} disabled={isLoading} />
                             </div>
                            <textarea
                                id="original-contract-compare"
                                value={originalContract}
                                onChange={(e) => setOriginalContract(e.target.value)}
                                placeholder="Paste the original contract text or upload a file..."
                                className="w-full h-full p-3 text-sm font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div className="flex flex-col space-y-2 min-h-0">
                            <div className="flex justify-between items-center mb-1">
                                <label htmlFor="revised-contract" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Revised Contract
                                </label>
                                <UploadButton onClick={() => revisedContractInputRef.current?.click()} disabled={isLoading} />
                            </div>
                            <textarea
                                id="revised-contract"
                                value={revisedContract}
                                onChange={(e) => setRevisedContract(e.target.value)}
                                placeholder="Paste the revised contract text or upload a file..."
                                className="w-full h-full p-3 text-sm font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-auto pt-4">
                <button
                    onClick={onAnalyze}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors duration-200"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <ZapIcon className="w-5 h-5 mr-2" />
                            Analyze Contract
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};