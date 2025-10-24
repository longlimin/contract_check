
export type RiskSeverity = 'High' | 'Medium' | 'Low';

export interface Risk {
  clause: string;
  risk_type: string;
  severity: RiskSeverity;
  description: string;
  suggestion: string;
  policy_reference?: string; // Add this field for compliance violations
}

export interface AnalysisResult {
  summary: string;
  risks: Risk[];
}

export type ChangeType = 'Addition' | 'Deletion' | 'Modification';

export interface ComparisonChange {
    change_type: ChangeType;
    original_clause: string;
    revised_clause: string;
    description: string;
    risk_implication: string;
}

export interface ComparisonResult {
    summary: string;
    changes: ComparisonChange[];
}

export type AnalysisMode = 'single' | 'compare';