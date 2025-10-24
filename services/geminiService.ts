
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ComparisonResult } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const riskSchema = {
    type: Type.OBJECT,
    properties: {
        clause: {
            type: Type.STRING,
            description: "The exact clause or text from the contract that poses a risk.",
        },
        risk_type: {
            type: Type.STRING,
            description: "Categorization of the risk (e.g., 'Liability', 'Intellectual Property', 'Payment Terms', 'Confidentiality', 'Termination', 'Internal Policy Conflict').",
        },
        severity: {
            type: Type.STRING,
            enum: ['High', 'Medium', 'Low'],
            description: "The severity level of the identified risk.",
        },
        description: {
            type: Type.STRING,
            description: "A clear and concise explanation of why this clause is a risk.",
        },
        suggestion: {
            type: Type.STRING,
            description: "A recommended action or change to mitigate the risk.",
        },
        policy_reference: {
            type: Type.STRING,
            description: "If the risk_type is 'Internal Policy Conflict', this field should contain the specific rule or policy from the company's document that is being violated. Otherwise, it should be empty."
        }
    },
    required: ['clause', 'risk_type', 'severity', 'description', 'suggestion'],
};

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: "A high-level executive summary of the contract's overall risk profile, including any compliance issues with internal policies.",
        },
        risks: {
            type: Type.ARRAY,
            items: riskSchema,
            description: "A list of all identified risks in the contract."
        }
    },
    required: ['summary', 'risks'],
};


export const analyzeContract = async (contractText: string, companyRules?: string): Promise<AnalysisResult> => {
    
    let rulesPromptSection = '';
    if (companyRules && companyRules.trim()) {
        rulesPromptSection = `
        Additionally, you MUST audit the contract against the following "Company Rules and Policies" document. 
        Identify and flag any clauses in the contract that conflict with, deviate from, or violate these internal rules. 
        For each such conflict, create a risk with the risk_type 'Internal Policy Conflict'. In the description, clearly explain the conflict. 
        In the 'policy_reference' field, quote the specific rule that is being violated.

        Company Rules and Policies:
        ---
        ${companyRules}
        ---
        `;
    }

    const prompt = `
        You are an expert legal AI specializing in contract analysis for a multinational corporation.
        Your task is to conduct a thorough risk assessment of the following contract text.
        Identify potential risks, classify them, determine their severity, and provide actionable suggestions for mitigation.
        Focus on identifying issues related to liability, intellectual property, payment terms, confidentiality, data privacy, termination clauses, and compliance with laws like GDPR and CCPA.
        ${rulesPromptSection}
        Return your analysis in the specified JSON format.

        Contract Text:
        ---
        ${contractText}
        ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
                temperature: 0.2,
            },
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return result as AnalysisResult;

    } catch (error) {
        console.error("Error analyzing contract with Gemini:", error);
        throw new Error("Failed to analyze contract. The AI model may be temporarily unavailable.");
    }
};

const comparisonChangeSchema = {
    type: Type.OBJECT,
    properties: {
        change_type: {
            type: Type.STRING,
            enum: ['Addition', 'Deletion', 'Modification'],
            description: 'The type of change detected.'
        },
        original_clause: {
            type: Type.STRING,
            description: 'The clause from the original version. Empty for additions.'
        },
        revised_clause: {
            type: Type.STRING,
            description: 'The clause from the revised version. Empty for deletions.'
        },
        description: {
            type: Type.STRING,
            description: 'A summary of what was changed.'
        },
        risk_implication: {
            type: Type.STRING,
            description: 'An analysis of the risk implications of this change. Mention if it introduces new risks or mitigates existing ones.'
        }
    },
    required: ['change_type', 'original_clause', 'revised_clause', 'description', 'risk_implication']
};

const comparisonSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: 'A high-level summary of the most critical changes between the two contract versions and their overall impact on the risk profile.'
        },
        changes: {
            type: Type.ARRAY,
            items: comparisonChangeSchema
        }
    },
    required: ['summary', 'changes']
};


export const compareContracts = async (originalText: string, revisedText: string): Promise<ComparisonResult> => {
    const prompt = `
        You are an expert legal AI specializing in contract version comparison.
        Your task is to analyze the differences between the "Original Contract" and the "Revised Contract" provided below.
        Identify all additions, deletions, and modifications. For each change, describe its potential legal and business risk implications.
        Return your analysis in the specified JSON format.

        Original Contract:
        ---
        ${originalText}
        ---

        Revised Contract:
        ---
        ${revisedText}
        ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: comparisonSchema,
                temperature: 0.2,
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as ComparisonResult;
    } catch (error) {
        console.error("Error comparing contracts with Gemini:", error);
        throw new Error("Failed to compare contracts. The AI model may be temporarily unavailable.");
    }
};