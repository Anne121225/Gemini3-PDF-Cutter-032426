/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Language = "EN" | "ZH";

export interface Document {
  id: string;
  name: string;
  pageCount: number;
  status: "staged" | "trimmed" | "processing" | "complete";
  trimRange?: string;
  trimMethod?: number;
  content?: string;
}

export interface AgentConfig {
  id: string;
  name: string;
  provider: string;
  model: string;
  temperature: number;
  maxTokens: number;
  systemInstruction: string;
  userPrompt: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "success";
  message: string;
  module: string;
}

export interface WowMetrics {
  health: number; // 0-100
  risk: number; // 0-100
  completeness: number; // 0-100
  consistency: number; // 0-100
  readiness: number; // 0-100
}

export const DEFAULT_AGENTS: AgentConfig[] = [
  {
    id: "admin-review",
    name: "Administrative Reviewer",
    provider: "Google",
    model: "gemini-3-flash-preview",
    temperature: 0.2,
    maxTokens: 1000,
    systemInstruction: "You are an FDA Administrative Reviewer. Check for completeness of the 510(k) submission.",
    userPrompt: "Analyze the following document for mandatory administrative elements: {{content}}"
  },
  {
    id: "technical-review",
    name: "Technical/Engineering Reviewer",
    provider: "Google",
    model: "gemini-3.1-pro-preview",
    temperature: 0.1,
    maxTokens: 2000,
    systemInstruction: "You are a Senior Engineering Reviewer. Evaluate the technical specifications and testing data.",
    userPrompt: "Extract all performance testing data and compare against consensus standards: {{content}}"
  }
];

export const REGULATORY_SKILL = `
Assume the persona of a Senior Regulatory Compliance Auditor. 
Systematically scan the cut document specifically for safety claims, efficacy parameters, and testing standard deviations. 
Identify all mentions of recognized consensus standards (ISO/IEC).
Extract acceptance criteria and explicitly flag any instance where documented test results fail to meet the stated criteria. 
Output a strictly formatted matrix mapping exact document quotes to analytical findings.
`;
