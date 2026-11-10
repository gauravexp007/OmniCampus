import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Lock,
  ArrowRight,
  X,
  Send,
  Building,
  KeyRound,
  Inbox,
} from 'lucide-react';
import { dispatchFormalPasswordResetEmail, FormalMailDispatch } from '../../services/mailService';

interface FormalPasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
  onSelectResetToken?: (email: string, token: string) => void;
}

export const FormalPasswordResetModal: React.FC<FormalPasswordResetModalProps> = ({
  isOpen,
  onClose,
  defaultEmail = '',
  onSelectResetToken,
}) => {
  const [email, setEmail] = useState(defaultEmail || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dispatchResult, setDispatchResult] = useState<FormalMailDispatch | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'receipt' | 'letterhead'>('receipt');

  // Synchronize with defaultEmail when opened or changed
  useEffect(() => {
    if (defaultEmail) {
      setEmail(defaultEmail);
    }
  }, [defaultEmail, isOpen]);

  // Reset local state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setDispatchResult(null);
      setCopiedLink(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendFormalReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const result = await dispatchFormalPasswordResetEmail(email.trim());
      setDispatchResult(result);
    } catch (err: any) {
      setError(err?.message || 'Failed to dispatch password reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!dispatchResult?.resetUrl) return;
    navigator.clipboard.writeText(dispatchResult.resetUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleOpenSpecialWindow = () => {
    if (!dispatchResult) return;
    if (onSelectResetToken) {
      onSelectResetToken(dispatchResult.recipientEmail, dispatchResult.trackingNumber);
    } else {
      window.location.href = dispatchResult.resetUrl;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="bg-[#132c4e] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0 border border-white/20">
              <KeyRound className="w-5 h-5 text-brand-light" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">University ERP Security Gateway</h3>
              <p className="text-[11px] text-slate-300">
                Official Credential Recovery & Secure Reset Link Dispatch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-700 text-xs">
          {!dispatchResult ? (
            /* Input Form: Asks User For Their Email ID */
            <form onSubmit={handleSendFormalReset} className="space-y-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <Building className="w-4 h-4 text-[#132c4e]" />
                  <span>Institutional Password Reset Service</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Enter your registered institutional or personal email address below. We will send a secure password reset link to your email, allowing you to re-establish your credentials inside a dedicated reset window.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-800">
                  Your Registered Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 absolute left-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address (e.g. name@university.edu)"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#132c4e] focus:bg-white transition-all shadow-2xs"
                  />
                </div>
                <div className="text-[11px] text-slate-400 pt-0.5">
                  <span>We will dispatch an authorized password reset link to this address.</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#132c4e] hover:bg-[#1c3e6b] active:scale-98 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending Reset Link...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Password Reset Link</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Result View: Confirms Email Sent & Allows Opening Special Reset Window */
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-emerald-900">
                    Password Reset Link Sent Successfully!
                  </h4>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    A formal security notification containing your legitimate authorization link has been sent to{' '}
                    <strong>{dispatchResult.recipientEmail}</strong>. Please check your inbox and click the link to reset your password with the special window.
                  </p>
                </div>
              </div>

              {/* Special Reset Window Launch Box */}
              <div className="p-4 bg-gradient-to-br from-[#132c4e]/5 via-white to-slate-50 border border-[#132c4e]/20 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#132c4e] text-white flex items-center justify-center">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#132c4e]">
                      Special Password Reset Window
                    </h5>
                    <p className="text-[10px] text-slate-500">
                      Single-use cryptographic verification token active for 60 minutes
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-700 leading-relaxed">
                  You can click the link dispatched to your email, or launch the special reset window right now for{' '}
                  <span className="font-semibold text-slate-900">{dispatchResult.recipientEmail}</span>:
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                  <button
                    onClick={handleOpenSpecialWindow}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#132c4e] hover:bg-[#1c3e6b] rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <span>Open Special Reset Window Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-2.5 text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="Copy reset link"
                  >
                    {copiedLink ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-slate-200 gap-4 text-xs font-semibold text-slate-500">
                <button
                  onClick={() => setActiveTab('receipt')}
                  className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'receipt'
                      ? 'border-[#132c4e] text-[#132c4e] font-bold'
                      : 'border-transparent hover:text-slate-800'
                  }`}
                >
                  Dispatch Receipt & Link
                </button>
                <button
                  onClick={() => setActiveTab('letterhead')}
                  className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'letterhead'
                      ? 'border-[#132c4e] text-[#132c4e] font-bold'
                      : 'border-transparent hover:text-slate-800'
                  }`}
                >
                  Formal Email Letterhead Preview
                </button>
              </div>

              {activeTab === 'receipt' ? (
                <div className="space-y-3.5">
                  {/* Dispatch Details Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Recipient Email:</span>
                      <span className="font-semibold text-slate-900 truncate block">{dispatchResult.recipientEmail}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Tracking Number:</span>
                      <span className="font-mono font-bold text-slate-800">{dispatchResult.trackingNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Delivery Status:</span>
                      <span className="font-bold text-emerald-600">Dispatched & Active</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Authorized Window:</span>
                      <span className="text-slate-700">60 Minutes</span>
                    </div>
                  </div>

                  {/* Reset URL Display Box */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-800">
                      University ERP Reset Link:
                    </label>
                    <div className="p-2.5 bg-slate-100 rounded-xl border border-slate-300 font-mono text-[10px] text-slate-700 break-all select-all flex items-center justify-between gap-2">
                      <span className="truncate">{dispatchResult.resetUrl}</span>
                      <button
                        onClick={handleCopyLink}
                        className="px-2.5 py-1 text-[10px] font-bold bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-slate-700 flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                      >
                        {copiedLink ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* Back Action */}
                  <div className="pt-1 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setDispatchResult(null);
                        setEmail('');
                      }}
                      className="text-[11px] text-slate-500 hover:text-slate-900 hover:underline cursor-pointer"
                    >
                      Send to a different email address
                    </button>
                    <button
                      onClick={onClose}
                      className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                /* Full Letterhead Preview */
                <div className="space-y-3">
                  <div
                    className="p-4 bg-white border border-slate-200 rounded-xl max-h-72 overflow-y-auto text-[11px] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: dispatchResult.htmlBody }}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-[#132c4e] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Reset URL</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
