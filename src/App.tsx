/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Layout, 
  FileUp, 
  Scissors, 
  Activity, 
  Terminal, 
  BarChart3, 
  Globe, 
  Moon, 
  Sun, 
  Trash2, 
  ChevronRight, 
  AlertCircle,
  CheckCircle2,
  Zap,
  ShieldAlert,
  Search,
  Download,
  Settings,
  Cpu,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from "recharts";
import Markdown from "react-markdown";
import { GoogleGenAI } from "@google/genai";

import { 
  cn, 
  Language, 
  Document, 
  AgentConfig, 
  LogEntry, 
  WowMetrics, 
  DEFAULT_AGENTS, 
  REGULATORY_SKILL 
} from "./types";

// --- Components ---

const MissionControlHeader = ({ 
  lang, 
  setLang, 
  theme, 
  setTheme, 
  metrics 
}: { 
  lang: Language; 
  setLang: (l: Language) => void; 
  theme: "light" | "dark"; 
  setTheme: (t: "light" | "dark") => void;
  metrics: WowMetrics;
}) => {
  return (
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 bg-red-500 rounded-sm flex items-center justify-center text-white font-bold">R</div>
        <div>
          <h1 className="text-sm font-semibold tracking-tight uppercase">Regulatory Command Center</h1>
          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Nordic WOW Edition v2.8</p>
        </div>
      </div>

      <div className="flex items-center gap-8">
        {/* Status Strip */}
        <div className="flex items-center gap-6 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
          <div className="flex items-center gap-2">
            <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", metrics.health > 80 ? "bg-green-500" : "bg-amber-500")} />
            <span>Health: {metrics.health}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-3 h-3" />
            <span>Latency: 142ms</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="w-3 h-3" />
            <span>Memory: 1.2GB</span>
          </div>
        </div>

        <div className="flex items-center gap-2 border-l border-zinc-200 dark:border-zinc-800 pl-6">
          <button 
            onClick={() => setLang(lang === "EN" ? "ZH" : "EN")}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md transition-colors text-xs font-medium"
          >
            {lang}
          </button>
          <button 
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md transition-colors"
          >
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md transition-colors text-red-500">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

const WowInteractiveIndicator = ({ metrics }: { metrics: WowMetrics }) => {
  const score = metrics.readiness;
  const color = score > 80 ? "#10b981" : score > 50 ? "#f59e0b" : "#f43f5e";

  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="96"
          cy="96"
          r="80"
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          className="text-zinc-100 dark:text-zinc-800"
        />
        <motion.circle
          cx="96"
          cy="96"
          r="80"
          stroke={color}
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={502.4}
          initial={{ strokeDashoffset: 502.4 }}
          animate={{ strokeDashoffset: 502.4 - (502.4 * score) / 100 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-light tracking-tighter">{score}%</span>
        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Readiness</span>
      </div>
    </div>
  );
};

const LiveLog = ({ logs }: { logs: LogEntry[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-zinc-950 rounded-lg p-4 font-mono text-[11px] h-64 overflow-hidden flex flex-col border border-zinc-800 shadow-2xl">
      <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2 text-zinc-500">
          <Terminal className="w-3 h-3" />
          <span className="uppercase tracking-widest">Live Execution Stream</span>
        </div>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500/50" />
          <div className="w-2 h-2 rounded-full bg-amber-500/50" />
          <div className="w-2 h-2 rounded-full bg-green-500/50" />
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
            <span className="text-zinc-600 shrink-0">[{log.timestamp}]</span>
            <span className={cn(
              "shrink-0 uppercase font-bold",
              log.level === "info" && "text-blue-400",
              log.level === "warn" && "text-amber-400",
              log.level === "error" && "text-red-400",
              log.level === "success" && "text-green-400"
            )}>
              {log.level}
            </span>
            <span className="text-zinc-500 shrink-0">[{log.module}]</span>
            <span className="text-zinc-300">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const WowInteractiveDashboard = ({ metrics }: { metrics: WowMetrics }) => {
  const radarData = [
    { subject: 'Health', A: metrics.health, fullMark: 100 },
    { subject: 'Risk', A: metrics.risk, fullMark: 100 },
    { subject: 'Completeness', A: metrics.completeness, fullMark: 100 },
    { subject: 'Consistency', A: metrics.consistency, fullMark: 100 },
    { subject: 'Readiness', A: metrics.readiness, fullMark: 100 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          Regulatory Risk Radar
        </h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="#3f3f46" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Submission"
                dataKey="A"
                stroke="#f43f5e"
                fill="#f43f5e"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Metric Distribution
        </h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={radarData} layout="vertical">
              <XAxis type="number" hide domain={[0, 100]} />
              <YAxis dataKey="subject" type="category" tick={{ fill: '#71717a', fontSize: 10 }} width={80} />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '8px', fontSize: '10px' }}
              />
              <Bar dataKey="A" radius={[0, 4, 4, 0]} barSize={20}>
                {radarData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.A > 80 ? '#10b981' : entry.A > 50 ? '#f59e0b' : '#f43f5e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [lang, setLang] = useState<Language>("EN");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [metrics, setMetrics] = useState<WowMetrics>({
    health: 92,
    risk: 14,
    completeness: 88,
    consistency: 95,
    readiness: 78
  });
  const [activeTab, setActiveTab] = useState<"ingestion" | "analysis" | "summary" | "wow">("ingestion");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [trimMethod, setTrimMethod] = useState(1);
  const [trimRange, setTrimRange] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);

  const addLog = (message: string, level: LogEntry["level"] = "info", module: string = "SYSTEM") => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
      module
    };
    setLogs(prev => [...prev.slice(-49), newLog]);
  };

  useEffect(() => {
    addLog("Regulatory Command Center Initialized", "success", "CORE");
    addLog("Nordic Architecture v2.8 Loaded", "info", "UI");
    addLog("Gemini 3 Flash Preview Ready", "info", "AI");
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newDocs: Document[] = Array.from(files).map(f => ({
      id: Math.random().toString(36).substr(2, 9),
      name: f.name,
      pageCount: Math.floor(Math.random() * 500) + 50,
      status: "staged"
    }));

    setDocuments(prev => [...prev, ...newDocs]);
    addLog(`Ingested ${newDocs.length} documents`, "info", "INGESTION");
  };

  const handleTrim = () => {
    if (!selectedDoc) return;
    setIsProcessing(true);
    addLog(`Executing trim on ${selectedDoc.name} using Method ${trimMethod}`, "info", "TRIM_ENGINE");
    
    setTimeout(() => {
      setDocuments(prev => prev.map(d => 
        d.id === selectedDoc.id ? { ...d, status: "trimmed", trimRange, trimMethod } : d
      ));
      setIsProcessing(false);
      addLog(`Trim successful: ${selectedDoc.name} optimized`, "success", "TRIM_ENGINE");
      setMetrics(prev => ({ ...prev, readiness: Math.min(100, prev.readiness + 5) }));
    }, 2000);
  };

  const runDirectPrompt = async () => {
    if (!selectedDoc) return;
    setIsProcessing(true);
    addLog(`Direct Prompting: Analyzing ${selectedDoc.name}`, "info", "GEMINI_AI");
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze the following regulatory document section for safety claims and compliance with ISO 13485: [SIMULATED CONTENT FOR ${selectedDoc.name}]`,
        config: { systemInstruction: REGULATORY_SKILL }
      });
      
      setAiResponse(response.text || "No response generated.");
      addLog(`AI Analysis complete for ${selectedDoc.name}`, "success", "GEMINI_AI");
    } catch (err) {
      addLog(`AI Error: ${err instanceof Error ? err.message : "Unknown error"}`, "error", "GEMINI_AI");
    } finally {
      setIsProcessing(false);
    }
  };

  const followUpQuestions = [
    "How does the system handle multi-part PDF appendices that exceed 1,000 pages?",
    "Can the trimming engine be configured to automatically remove blank pages or cover sheets?",
    "What specific ISO/IEC standards are embedded in the default regulatory skill?",
    "How does the Gemini 3 Flash Preview model handle visual diagrams versus tabular data?",
    "Is there a way to export the Live Log for official audit trails?",
    "Can the Consistency Guardian module detect contradictions between labeling and engineering drawings?",
    "How are the 5 trimming methodologies technically differentiated in terms of memory usage?",
    "Does the system support Traditional Chinese OCR for scanned handwritten notes?",
    "Can the Macro Summary engine be tuned to target specific FDA reviewer personas?",
    "How does the Evidence Mapping system handle claims that span multiple non-contiguous pages?",
    "What is the maximum token context window supported for the direct document prompting?",
    "Can users define custom WOW AI modules via the configuration interface?",
    "How does the system manage session-specific API keys without persistent storage?",
    "Is there a visual indicator for documents that have failed the pre-flight structural scan?",
    "Can the Regulatory Risk Radar be calibrated for Class III high-risk devices?",
    "How does the editable handoff process prevent data loss between agent nodes?",
    "What happens if the Gemini API times out during a 4,000-word summary generation?",
    "Can the system cross-reference adverse events from the MAUDE database in real-time?",
    "How does the Nordic Architecture address cognitive fatigue in 8-hour review sessions?",
    "Is the total purge mechanism compliant with HIPAA/GDPR data destruction standards?"
  ];

  return (
    <div className={cn("min-h-screen font-sans selection:bg-red-500/30", theme === "dark" ? "dark bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900")}>
      <MissionControlHeader 
        lang={lang} 
        setLang={setLang} 
        theme={theme} 
        setTheme={setTheme} 
        metrics={metrics}
      />

      <main className="flex h-[calc(100vh-64px)] overflow-hidden">
        {/* Left Pane: Source Material Management */}
        <section className="w-1/3 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-zinc-50/50 dark:bg-zinc-950/50">
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
              <FileUp className="w-4 h-4" />
              Source Ingestion
            </h2>
            
            <label className="group relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl hover:border-red-500 transition-all cursor-pointer bg-white dark:bg-zinc-900/50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileUp className="w-8 h-8 text-zinc-400 group-hover:text-red-500 transition-colors mb-2" />
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Drag & Drop Submission Artifacts</p>
              </div>
              <input type="file" className="hidden" multiple onChange={handleFileUpload} />
            </label>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Document Registry</h3>
            {documents.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 italic text-sm">No documents staged</div>
            ) : (
              documents.map(doc => (
                <motion.div 
                  layoutId={doc.id}
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={cn(
                    "p-4 rounded-xl border transition-all cursor-pointer group",
                    selectedDoc?.id === doc.id 
                      ? "bg-white dark:bg-zinc-900 border-red-500 shadow-lg" 
                      : "bg-white/50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded flex items-center justify-center",
                        doc.status === "trimmed" ? "bg-green-500/10 text-green-500" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                      )}>
                        <Layout className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium truncate max-w-[150px]">{doc.name}</p>
                        <p className="text-[10px] text-zinc-500 font-mono uppercase">{doc.pageCount} Pages</p>
                      </div>
                    </div>
                    {doc.status === "trimmed" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className={cn(
                      "text-[9px] px-2 py-0.5 rounded-full font-mono uppercase tracking-wider",
                      doc.status === "staged" ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-500" : "bg-green-500/20 text-green-500"
                    )}>
                      {doc.status}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Right Pane: Intelligence Deck */}
        <section className="flex-1 flex flex-col bg-white dark:bg-zinc-950">
          {/* Tabs */}
          <nav className="flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
            {[
              { id: "ingestion", label: "Trimming Engine", icon: Scissors },
              { id: "analysis", label: "Direct Prompting", icon: Zap },
              { id: "summary", label: "Macro Summary", icon: Layout },
              { id: "wow", label: "WOW Dashboards", icon: BarChart3 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 text-xs font-medium transition-all relative",
                  activeTab === tab.id ? "text-red-500" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />
                )}
              </button>
            ))}
          </nav>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <AnimatePresence mode="wait">
              {activeTab === "ingestion" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-4xl space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h3 className="text-lg font-light tracking-tight">Advanced Trimming Controls</h3>
                      <p className="text-sm text-zinc-500 leading-relaxed">
                        Select exact page ranges to isolate critical regulatory evidence. Choose the processing methodology optimized for your document's structural integrity.
                      </p>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Page Range Syntax</label>
                          <input 
                            type="text" 
                            placeholder="e.g. 5-20, 50, 100-110"
                            value={trimRange}
                            onChange={(e) => setTrimRange(e.target.value)}
                            className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Processing Methodology</label>
                          <select 
                            value={trimMethod}
                            onChange={(e) => setTrimMethod(Number(e.target.value))}
                            className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 transition-all appearance-none"
                          >
                            <option value={1}>Option 1: High-Speed C-Based Fidelity</option>
                            <option value={2}>Option 2: Pure-Language Narrative Stability</option>
                            <option value={3}>Option 3: Geometric Table Preservation</option>
                            <option value={4}>Option 4: Legacy System Resilience</option>
                            <option value={5}>Option 5: Lightweight Object Manipulation</option>
                          </select>
                        </div>

                        <button 
                          onClick={handleTrim}
                          disabled={!selectedDoc || isProcessing}
                          className="w-full bg-red-500 hover:bg-red-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 text-white py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
                        >
                          {isProcessing ? <Activity className="w-5 h-5 animate-spin" /> : <Scissors className="w-5 h-5" />}
                          Execute Document Cut
                        </button>
                      </div>
                    </div>

                    <div className="bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl p-8 flex flex-col items-center justify-center border border-zinc-200 dark:border-zinc-800">
                      <WowInteractiveIndicator metrics={metrics} />
                      <div className="mt-8 text-center space-y-2">
                        <p className="text-sm font-medium">Trimming Readiness</p>
                        <p className="text-xs text-zinc-500">Optimizing artifacts for AI orchestration</p>
                      </div>
                    </div>
                  </div>

                  <LiveLog logs={logs} />
                </motion.div>
              )}

              {activeTab === "analysis" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-5xl space-y-8 pb-24"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-light tracking-tight">Direct Document Prompting & AI Modules</h3>
                      <p className="text-sm text-zinc-500">Multimodal interaction and specialized regulatory intelligence.</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
                        <Download className="w-3 h-3" /> Export Cut PDF
                      </button>
                    </div>
                  </div>

                  {/* AI Feature Modules Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                          <Globe className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400 uppercase">Module 01</span>
                      </div>
                      <h4 className="text-sm font-semibold">Regulatory Cross-Reference</h4>
                      <p className="text-[11px] text-zinc-500 leading-relaxed">Maps device features to ISO/IEC consensus standards automatically.</p>
                      <button className="w-full py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all">Execute Mapping</button>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                          <Search className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400 uppercase">Module 02</span>
                      </div>
                      <h4 className="text-sm font-semibold">Predicate Similarity Scorer</h4>
                      <p className="text-[11px] text-zinc-500 leading-relaxed">Evaluates 'Intended Use' against historical 510(k) clearance data.</p>
                      <button className="w-full py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all">Score Predicate</button>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400 uppercase">Module 03</span>
                      </div>
                      <h4 className="text-sm font-semibold">Biocompatibility Predictor</h4>
                      <p className="text-[11px] text-zinc-500 leading-relaxed">Identifies potential gaps in material testing and sterilization protocols.</p>
                      <button className="w-full py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Predict Risks</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                      <div className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl p-6 min-h-[400px] border border-zinc-200 dark:border-zinc-800 relative overflow-hidden">
                        {isProcessing && (
                          <div className="absolute inset-0 bg-zinc-950/20 backdrop-blur-[2px] flex items-center justify-center z-10">
                            <div className="flex flex-col items-center gap-4">
                              <Activity className="w-12 h-12 text-red-500 animate-spin" />
                              <p className="text-xs font-mono uppercase tracking-widest text-red-500">Inference in Progress...</p>
                            </div>
                          </div>
                        )}
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          {aiResponse ? (
                            <Markdown>{aiResponse}</Markdown>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-[350px] text-zinc-500 space-y-4">
                              <Zap className="w-12 h-12 opacity-20" />
                              <p className="italic">Select a trimmed document and execute a skill to begin analysis.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Multimodal Model</label>
                          <select className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-red-500">
                            <option>Gemini 3 Flash Preview (Recommended)</option>
                            <option>Gemini 2.5 Flash (Low Latency)</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Active Skill Description</label>
                          <textarea 
                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs h-48 focus:outline-none focus:ring-1 focus:ring-red-500 resize-none font-mono leading-relaxed"
                            defaultValue={REGULATORY_SKILL}
                          />
                        </div>

                        <button 
                          onClick={runDirectPrompt}
                          disabled={!selectedDoc || isProcessing}
                          className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2"
                        >
                          Execute Skill
                        </button>
                      </div>

                      <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl space-y-2">
                        <div className="flex items-center gap-2 text-red-500">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Regulatory Warning</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                          AI outputs are strictly advisory. Human ratification is required for all safety-critical determinations.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "wow" && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-light tracking-tight">WOW Interactive Dashboards</h3>
                      <p className="text-sm text-zinc-500">Macro-level observability and risk quantification.</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-mono uppercase text-zinc-500">Overall Readiness</span>
                        <span className="text-xl font-light text-red-500">{metrics.readiness}%</span>
                      </div>
                      <div className="w-12 h-12 rounded-full border-2 border-red-500/20 flex items-center justify-center">
                        <Activity className="w-6 h-6 text-red-500" />
                      </div>
                    </div>
                  </div>

                  <WowInteractiveDashboard metrics={metrics} />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { label: "Evidence Mapping", value: "98.2%", icon: Search, color: "text-blue-500" },
                      { label: "Consistency Score", value: "94.0%", icon: ShieldAlert, color: "text-amber-500" },
                      { label: "Labeling Integrity", value: "82.5%", icon: CheckCircle2, color: "text-green-500" }
                    ].map((m, i) => (
                      <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1">{m.label}</p>
                          <p className="text-2xl font-light tracking-tighter">{m.value}</p>
                        </div>
                        <m.icon className={cn("w-8 h-8 opacity-20", m.color)} />
                      </div>
                    ))}
                  </div>

                  <div className="bg-zinc-950 rounded-2xl p-8 border border-zinc-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Globe className="w-32 h-32" />
                    </div>
                    <div className="relative z-10 space-y-4">
                      <h4 className="text-xs font-mono uppercase tracking-widest text-zinc-500">Global Localization Context</h4>
                      <p className="text-xl font-light max-w-2xl leading-relaxed">
                        System currently optimized for <span className="text-red-500">Asia/Taipei</span> regulatory standards. Dual-language processing active for EN/ZH artifacts.
                      </p>
                      <div className="flex gap-4">
                        <span className="px-3 py-1 bg-zinc-900 rounded-full text-[10px] font-mono text-zinc-400 border border-zinc-800">UTF-8 Compliant</span>
                        <span className="px-3 py-1 bg-zinc-900 rounded-full text-[10px] font-mono text-zinc-400 border border-zinc-800">ISO 13485:2016</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "summary" && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="max-w-4xl mx-auto space-y-8"
                >
                  <div className="text-center space-y-4">
                    <h3 className="text-3xl font-light tracking-tighter">Macro Summary Generation</h3>
                    <p className="text-zinc-500 max-w-xl mx-auto">Synthesizing 3,000 - 4,000 words of structured regulatory intelligence from consolidated artifacts.</p>
                  </div>

                  <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 border border-zinc-200 dark:border-zinc-800 shadow-2xl min-h-[600px] relative">
                    <div className="absolute top-8 right-8">
                      <Settings className="w-5 h-5 text-zinc-400 animate-spin-slow" />
                    </div>
                    
                    <div className="prose prose-lg dark:prose-invert max-w-none">
                      <h1 className="text-2xl font-bold mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-4">FDA 510(k) Administrative Review Report</h1>
                      <div className="space-y-6 text-zinc-500 italic">
                        <p>Awaiting completion of agent orchestration sequence...</p>
                        <div className="space-y-2">
                          <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-full animate-pulse" />
                          <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-5/6 animate-pulse" />
                          <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-4/6 animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4">
                    <button className="px-8 py-4 bg-red-500 text-white rounded-xl font-bold shadow-xl shadow-red-500/20 hover:scale-105 transition-all">
                      Initiate Macro Synthesis
                    </button>
                    <button className="px-8 py-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all">
                      Configure Agents
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* Follow-up Questions Overlay */}
      <AnimatePresence>
        {showQuestions && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-zinc-950/90 backdrop-blur-xl p-12 overflow-y-auto"
          >
            <div className="max-w-4xl mx-auto space-y-12">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-8">
                <div>
                  <h2 className="text-4xl font-light tracking-tighter">Comprehensive Follow-up Questions</h2>
                  <p className="text-zinc-500 mt-2">Technical and operational inquiries regarding v2.8 deployment.</p>
                </div>
                <button 
                  onClick={() => setShowQuestions(false)}
                  className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-zinc-800 transition-colors"
                >
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {followUpQuestions.map((q, i) => (
                  <div key={i} className="flex gap-4 group">
                    <span className="text-red-500 font-mono text-xs mt-1">{(i + 1).toString().padStart(2, '0')}</span>
                    <p className="text-sm text-zinc-300 group-hover:text-white transition-colors leading-relaxed">{q}</p>
                  </div>
                ))}
              </div>

              <div className="pt-12 border-t border-zinc-800 text-center">
                <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">End of Technical Specification — FDA 510(k) Review Studio v2.8</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 p-2 text-center">
        <button 
          onClick={() => setShowQuestions(true)}
          className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 hover:text-red-500 transition-colors"
        >
          View 20 Comprehensive Follow-up Questions
        </button>
      </footer>
    </div>
  );
}
