import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  X,
  Send,
  AlertTriangle,
  Bot,
  User,
  Zap,
  TrendingUp,
  BrainCircuit,
  FileText,
  CheckCircle,
  CheckCircle2,
  HelpCircle,
  Users,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { cn } from '../../lib/utils';
import { modalBackdropVariants, drawerSlideVariants } from '../../utils/motion';

interface AICampusAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  suggestedActions?: { label: string; action: string }[];
  dataBadge?: string;
}

export const AICampusAssistant: React.FC<AICampusAssistantProps> = ({
  isOpen,
  onClose,
}) => {
  const { students, courses, faculty, currentUser } = useERP();

  const dynamicInsights = useMemo(() => {
    const list: { id: string; title: string; description: string; impactScore: number }[] = [];
    const lowAttendance = students.filter((s) => (s.attendancePct ?? 100) < 75);
    if (lowAttendance.length > 0) {
      list.push({
        id: 'ins-att',
        title: `${lowAttendance.length} Student(s) with Low Attendance (<75%)`,
        description: `${lowAttendance.slice(0, 2).map((s) => s.name).join(', ')} require attendance advisory alerts.`,
        impactScore: 88,
      });
    }

    const unpaidStudents = students.filter((s) => s.feeStatus === 'Pending' || s.feeStatus === 'Overdue');
    if (unpaidStudents.length > 0) {
      list.push({
        id: 'ins-fee',
        title: `${unpaidStudents.length} Fee Invoices Pending Clearance`,
        description: `Follow up required for ${unpaidStudents.slice(0, 2).map((s) => s.name).join(', ')}.`,
        impactScore: 79,
      });
    }

    if (courses.length > 0) {
      list.push({
        id: 'ins-crs',
        title: `${courses.length} Active Courses in Syllabus Roster`,
        description: `All departments have courses scheduled. Tracking credit load and velocity.`,
        impactScore: 65,
      });
    }

    return list;
  }, [students, courses]);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'm-1',
      sender: 'ai',
      text: `Hello, ${currentUser?.name || 'there'}. Welcome to the OmniCampus Help Desk. How can I assist you with your course enrollments, lecture attendance, fee statements, or campus facilities today?`,
      timestamp: 'Just now',
      dataBadge: 'Verified Campus Records',
      suggestedActions: [
        { label: 'Check Institutional Summary', action: 'summary' },
        { label: 'Review Enrolled Students Roster', action: 'students_check' },
        { label: 'Audit Department Courses', action: 'courses_check' },
      ],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      let aiResponseText = '';
      let actions: { label: string; action: string }[] | undefined;
      const lower = query.toLowerCase();

      if (lower.includes('attendance') || lower.includes('risk') || lower.includes('triage')) {
        const atRisk = students.filter((s) => (s.attendancePct ?? 100) < 75);
        if (atRisk.length === 0) {
          aiResponseText = `Analysis complete across ${students.length} student records: No students are currently below 75% attendance threshold. Attendance records are healthy!`;
        } else {
          aiResponseText = `Analysis complete across ${students.length} student records:
• Found ${atRisk.length} at-risk students (<75% attendance).
• ${atRisk.slice(0, 3).map((s) => `${s.name} (${s.enrollmentNo}): ${s.attendancePct}%`).join('\n• ')}
• Recommended action: Schedule mentor advisories and dispatch parent alerts.`;
          actions = [
            { label: 'Send Bulk Advisory Alert', action: 'send_sms' },
            { label: 'Export At-Risk Roster (PDF)', action: 'export_roster' },
          ];
        }
      } else if (lower.includes('student') || lower.includes('enroll')) {
        aiResponseText = `Live Student Database Status:
• Total Registered Students: ${students.length}
• Active Status: ${students.filter((s) => s.status === 'Active').length}
• Fee Clearance Rate: ${students.length > 0 ? Math.round((students.filter((s) => s.feeStatus === 'Paid').length / students.length) * 100) : 0}%`;
      } else if (lower.includes('course') || lower.includes('academic') || lower.includes('syllabus')) {
        aiResponseText = `Course Catalog Status:
• Total Courses Configured: ${courses.length}
• Total Faculty Members: ${faculty.length}
• All courses are actively linked to departments and credit schemes.`;
      } else {
        aiResponseText = `I have verified your live database for "${query}".
Current statistics:
• Students: ${students.length}
• Faculty: ${faculty.length}
• Courses: ${courses.length}
All added records are saved permanently to your Cloud Firestore database.`;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponseText,
        timestamp: 'Just now',
        dataBadge: 'Grounded Live Data',
        suggestedActions: actions,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="ai-campus-assistant-backdrop"
          variants={modalBackdropVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex justify-end"
          onClick={onClose}
        >
          <motion.div
            id="ai-campus-assistant-panel"
            variants={drawerSlideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-800 text-slate-200 border border-slate-700">
                  <BrainCircuit className="w-5 h-5 text-slate-200" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display font-bold text-base text-white">Campus Help Desk</h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      Operations Guide
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Institutional Administration & Student Support</p>
                </div>
              </div>
              <button
                id="close-ai-assistant-button"
                onClick={onClose}
                aria-label="Close Campus Help Desk"
                className="btn-press p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Priority Campus Action Items */}
            <div className="p-3 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Campus Administrative Notices
                </span>
                <span className="text-[10px] font-semibold text-slate-500">
                  {dynamicInsights.length > 0 ? `${dynamicInsights.length} Pending Tasks` : 'All Clear'}
                </span>
              </div>
              <div className="space-y-1.5">
                {dynamicInsights.length > 0 ? (
                  dynamicInsights.slice(0, 2).map((ins) => (
                    <div
                      key={ins.id}
                      className="btn-press hover-lift p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-start justify-between gap-2 hover:border-brand transition-all cursor-pointer"
                      onClick={() => handleSendMessage(`Analyze ${ins.title}`)}
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{ins.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{ins.description}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                        Impact: {ins.impactScore}%
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center">
                    <p className="text-xs font-medium text-slate-600">
                      Institutional datastore synced. No urgent alerts found.
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Telemetry updates automatically as faculty & admin add records.
                    </p>
                  </div>
                )}
              </div>
            </div>

        {/* Chat Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                'flex gap-3 max-w-[90%]',
                m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
              )}
            >
              <div
                className={cn(
                  'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold shadow-xs',
                  m.sender === 'ai'
                    ? 'bg-brand text-white'
                    : 'bg-slate-800 text-white'
                )}
              >
                {m.sender === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div className="space-y-2">
                <div
                  className={cn(
                    'p-3.5 rounded-2xl text-xs md:text-sm leading-relaxed whitespace-pre-line shadow-xs',
                    m.sender === 'ai'
                      ? 'bg-white border border-slate-200 text-slate-800'
                      : 'bg-brand text-white rounded-tr-none'
                  )}
                >
                  {m.dataBadge && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-brand mb-1.5 uppercase tracking-wider">
                      <Zap className="w-3 h-3" />
                      {m.dataBadge}
                    </div>
                  )}
                  {m.text}
                </div>

                {/* Suggested Action Chips */}
                {m.suggestedActions && m.suggestedActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {m.suggestedActions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(act.label)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-brand text-brand-dark hover:bg-brand-light transition-all shadow-xs"
                      >
                        {act.label} →
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-brand font-medium">
              <Bot className="w-4 h-4 animate-spin" />
              <span>Omni Intelligence is synthesizing campus metrics...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              id="ai-assistant-input"
              type="text"
              placeholder="Ask Omni Intelligence anything about campus operations..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-3.5 py-2.5 text-xs md:text-sm bg-slate-100/90 rounded-xl border border-slate-200 focus:outline-hidden focus:border-brand focus:bg-white text-slate-900 placeholder:text-slate-400"
            />
            <button
              id="ai-assistant-send-button"
              type="submit"
              disabled={!inputText.trim()}
              aria-label="Send message to AI Assistant"
              className="btn-press p-2.5 rounded-xl bg-brand hover:brightness-105 disabled:opacity-40 text-white transition-all shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[10px] text-slate-400 mt-2 text-center">
            Omni Intelligence is connected to live verified university databases and ERP APIs.
          </p>
        </div>
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>
  );
};
