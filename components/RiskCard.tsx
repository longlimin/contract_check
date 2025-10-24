
import React from 'react';
import { Risk, RiskSeverity } from '../types';
import { AlertTriangleIcon, CheckCircleIcon, BuildingIcon } from './icons';

interface RiskCardProps {
    risk: Risk;
}

const severityConfig: { [key in RiskSeverity]: { iconClass: string; bgClass: string; textClass: string, borderClass: string } } = {
    High: {
        iconClass: 'text-red-500',
        bgClass: 'bg-red-50 dark:bg-red-900/20',
        textClass: 'text-red-800 dark:text-red-300',
        borderClass: 'border-red-500'
    },
    Medium: {
        iconClass: 'text-yellow-500',
        bgClass: 'bg-yellow-50 dark:bg-yellow-900/20',
        textClass: 'text-yellow-800 dark:text-yellow-300',
        borderClass: 'border-yellow-500'
    },
    Low: {
        iconClass: 'text-blue-500',
        bgClass: 'bg-blue-50 dark:bg-blue-900/20',
        textClass: 'text-blue-800 dark:text-blue-300',
        borderClass: 'border-blue-500'
    },
};

export const RiskCard: React.FC<RiskCardProps> = ({ risk }) => {
    const config = severityConfig[risk.severity] || severityConfig.Low;

    return (
        <div className={`p-4 rounded-lg border-l-4 ${config.bgClass} ${config.borderClass} shadow-sm`}>
            <div className="flex items-start">
                <AlertTriangleIcon className={`w-5 h-5 mr-3 mt-1 flex-shrink-0 ${config.iconClass}`} />
                <div className="flex-grow">
                    <div className="flex items-center justify-between">
                        <h4 className={`font-semibold ${config.textClass}`}>{risk.risk_type}</h4>
                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${config.bgClass.replace('bg-', 'bg-opacity-50 ')} ${config.textClass}`}>
                            {risk.severity} Risk
                        </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-mono bg-slate-200 dark:bg-slate-700/50 p-2 rounded-md">"{risk.clause}"</p>
                    
                    <div className="mt-3">
                        <p className="text-sm text-slate-700 dark:text-slate-300">{risk.description}</p>
                    </div>

                    {risk.risk_type === 'Internal Policy Conflict' && risk.policy_reference && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/50 flex items-start">
                            <BuildingIcon className="w-5 h-5 mr-3 mt-1 flex-shrink-0 text-slate-500 dark:text-slate-400" />
                            <div className="flex-grow">
                                <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Policy Conflict</h5>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Violates: <span className="italic">"{risk.policy_reference}"</span></p>
                            </div>
                        </div>
                    )}

                     <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/50 flex items-start">
                         <CheckCircleIcon className="w-5 h-5 mr-3 mt-1 flex-shrink-0 text-green-500" />
                        <div className="flex-grow">
                             <h5 className="text-sm font-semibold text-green-800 dark:text-green-300">Suggestion</h5>
                             <p className="text-sm text-slate-600 dark:text-slate-400">{risk.suggestion}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};