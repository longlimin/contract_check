
import React from 'react';
import { Risk, RiskSeverity } from '../types';

interface RiskHeatmapProps {
    risks: Risk[];
}

const severityColors: { [key in RiskSeverity]: string } = {
    High: 'bg-red-500',
    Medium: 'bg-yellow-500',
    Low: 'bg-blue-500',
};

export const RiskHeatmap: React.FC<RiskHeatmapProps> = ({ risks }) => {
    const riskCounts: { [key: string]: { High: number; Medium: number; Low: number; total: number } } = {};

    risks.forEach(risk => {
        if (!riskCounts[risk.risk_type]) {
            riskCounts[risk.risk_type] = { High: 0, Medium: 0, Low: 0, total: 0 };
        }
        riskCounts[risk.risk_type][risk.severity]++;
        riskCounts[risk.risk_type].total++;
    });

    const sortedRiskTypes = Object.keys(riskCounts).sort((a, b) => riskCounts[b].total - riskCounts[a].total);

    if (risks.length === 0) {
        return <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-md text-center text-sm text-slate-500 dark:text-slate-400">No risks to display in the heatmap.</div>;
    }

    return (
        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedRiskTypes.map(type => (
                    <div key={type} className="flex flex-col">
                        <div className="flex justify-between items-baseline mb-1">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{type}</span>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{riskCounts[type].total}</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 flex overflow-hidden">
                            {['High', 'Medium', 'Low'].map(severity => {
                                const count = riskCounts[type][severity as RiskSeverity];
                                const percentage = (count / riskCounts[type].total) * 100;
                                if (count === 0) return null;
                                return (
                                    <div
                                        key={severity}
                                        className={`${severityColors[severity as RiskSeverity]} h-full`}
                                        style={{ width: `${percentage}%` }}
                                        title={`${count} ${severity} risk(s)`}
                                    />
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
