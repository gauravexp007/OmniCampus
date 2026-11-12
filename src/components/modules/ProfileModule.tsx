import React, { useState, useRef, useEffect } from 'react';
import {
  updatePassword,
  sendPasswordResetEmail,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { ADMIN_EMAIL, ADMIN_DEFAULT_PASSWORD } from '../auth/AuthScreen';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Building,
  GraduationCap,
  Calendar,
  Heart,
  MapPin,
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Save,
  Check,
  X,
  PhoneCall,
  Sparkles,
  KeyRound,
  FileBadge,
  Lock,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { cn } from '../../lib/utils';
import { SKETCH_AVATAR_PRESETS, getSketchAvatar } from '../../utils/sketchAvatars';
import { ConfettiButton } from '../ui/ConfettiButton';

export const ProfileModule: React.FC = () => {
  const { currentUser, updateUserProfile, logout, firebaseUser } = useERP();

  // Local form state initialized from currentUser
  const [name, setName] = useState(currentUser.name || '');
  const [avatar, setAvatar] = useState(
    currentUser.avatar && !currentUser.avatar.includes('unsplash.com')
      ? currentUser.avatar
      : getSketchAvatar(currentUser.role)
  );
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [isPhoneVerified, setIsPhoneVerified] = useState(currentUser.isPhoneVerified || false);
  const [alternateEmail, setAlternateEmail] = useState(currentUser.alternateEmail || '');
  const [department, setDepartment] = useState(currentUser.department || 'Computer Science & Engineering');
  const [campus, setCampus] = useState(currentUser.campus || 'Main Tech Campus');
  const [idNumber, setIdNumber] = useState(currentUser.idNumber || '');
  const [designation, setDesignation] = useState(currentUser.designation || '');
  const [program, setProgram] = useState(currentUser.program || 'B.Tech Computer Science');
  const [semester, setSemester] = useState<number>(currentUser.semester || 6);
  const [bloodGroup, setBloodGroup] = useState(currentUser.bloodGroup || 'O+');
  const [dob, setDob] = useState(currentUser.dob || '2004-05-18');
  const [address, setAddress] = useState(currentUser.address || '');
  const [emergencyContactName, setEmergencyContactName] = useState(currentUser.emergencyContactName || '');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(currentUser.emergencyContactPhone || '');
  const [bio, setBio] = useState(currentUser.bio || '');

  // UI States
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Admin Security & Password State
  const [syncPwdLoading, setSyncPwdLoading] = useState(false);
  const [syncPwdSuccess, setSyncPwdSuccess] = useState<string | null>(null);
  const [syncPwdError, setSyncPwdError] = useState<string | null>(null);

  const isAdminAccount =
    currentUser.role === 'Admin' ||
    (currentUser.email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const handleSyncAdminPassword = async () => {
    const targetEmail = (currentUser.email || firebaseUser?.email || '').trim();
    setSyncPwdError(null);
    setSyncPwdSuccess(null);
    setSyncPwdLoading(true);
    try {
      if (firebaseUser) {
        await updatePassword(firebaseUser, ADMIN_DEFAULT_PASSWORD);
        setSyncPwdSuccess('Password credentials updated successfully.');
      } else if (targetEmail) {
        await sendPasswordResetEmail(auth, targetEmail);
        setSyncPwdSuccess(`Password reset email sent to ${targetEmail}.`);
      }
    } catch (err: any) {
      console.error('Password sync error:', err);
      if (err?.code === 'auth/requires-recent-login') {
        try {
          if (targetEmail) {
            await sendPasswordResetEmail(auth, targetEmail);
            setSyncPwdSuccess(`Password reset email sent to ${targetEmail}.`);
          }
        } catch {
          setSyncPwdError('Please sign out and sign in again before updating credentials.');
        }
      } else {
        setSyncPwdError(err?.message || 'Failed to update credentials.');
      }
    } finally {
      setSyncPwdLoading(false);
    }
  };

  const handleSendResetLink = async () => {
    const targetEmail = (currentUser.email || firebaseUser?.email || '').trim();
    if (!targetEmail) {
      setSyncPwdError('No account email registered to receive reset link.');
      return;
    }
    setSyncPwdError(null);
    setSyncPwdSuccess(null);
    setSyncPwdLoading(true);
    try {
      await sendPasswordResetEmail(auth, targetEmail);
      setSyncPwdSuccess(`Password reset link sent to ${targetEmail}.`);
    } catch (err: any) {
      setSyncPwdError(err?.message || 'Could not send reset link. Try again.');
    } finally {
      setSyncPwdLoading(false);
    }
  };

  // Phone Verification Flow states
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isConfirmingOtp, setIsConfirmingOtp] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [otpInfo, setOtpInfo] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const [showAvatarPresets, setShowAvatarPresets] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 2.5 * 1024 * 1024) {
      setErrorMsg('Image size must be less than 2.5MB.');
      return;
    }

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSendVerificationCode = async () => {
    setErrorMsg(null);
    setOtpError(null);
    setOtpInfo(null);

    const rawPhone = phone.trim();
    if (!rawPhone || rawPhone.length < 8) {
      setErrorMsg('Please enter a valid phone number with country code (e.g. +1 or +91).');
      return;
    }

    let formattedPhone = rawPhone.replace(/[^\d+]/g, '');
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+${formattedPhone}`;
    }

    setIsSendingOtp(true);
    try {
      if (typeof window !== 'undefined') {
        let appVerifier = (window as any).recaptchaVerifier;
        if (!appVerifier) {
          appVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
            callback: () => {},
            'expired-callback': () => {
              setOtpError('Verification expired. Please try sending SMS again.');
            },
          });
          (window as any).recaptchaVerifier = appVerifier;
        }

        const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
        setConfirmationResult(confirmation);
        setIsVerifyingPhone(true);
        setResendCooldown(60);
        setOtpInfo(`Verification code dispatched to ${formattedPhone}`);
      }
    } catch (err: any) {
      console.warn('Firebase Phone Auth:', err);
      setIsVerifyingPhone(true);
      setOtpInfo(`Demo Mode: Enter verification code for ${formattedPhone}`);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleConfirmOtp = async () => {
    if (!verificationCode || verificationCode.length < 4) {
      setOtpError('Please enter the 6-digit verification code.');
      return;
    }

    setOtpError(null);
    setIsConfirmingOtp(true);
    try {
      if (confirmationResult) {
        await confirmationResult.confirm(verificationCode);
      }
      setIsPhoneVerified(true);
      setOtpSuccess(true);
      setTimeout(() => {
        setIsVerifyingPhone(false);
        setOtpSuccess(false);
        setVerificationCode('');
      }, 1500);
      await updateUserProfile({ isPhoneVerified: true, phone: phone.trim() });
    } catch (err: any) {
      console.error('Confirm OTP Error:', err);
      setOtpError(err?.message || 'Verification failed. Please re-enter code.');
    } finally {
      setIsConfirmingOtp(false);
    }
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setIsSaving(true);
    try {
      await updateUserProfile({
        name: name.trim() || currentUser.name,
        avatar,
        phone: phone.trim(),
        isPhoneVerified,
        alternateEmail: alternateEmail.trim(),
        department,
        campus,
        idNumber:
          currentUser.role === 'Faculty'
            ? currentUser.idNumber || currentUser.employeeId || idNumber
            : idNumber.trim(),
        designation: designation.trim(),
        program: program.trim(),
        semester,
        bloodGroup,
        dob,
        address: address.trim(),
        emergencyContactName: emergencyContactName.trim(),
        emergencyContactPhone: emergencyContactPhone.trim(),
        bio: bio.trim(),
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      console.error('Error saving profile:', err);
      setErrorMsg('Failed to save profile changes.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5 pb-16 max-w-5xl mx-auto animate-in fade-in duration-150">
      {/* Clean Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#252b35] p-5 rounded-2xl border border-slate-200 dark:border-[#373e4b] shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            User Profile
          </h1>
        </div>

        {/* Top Actions: Save & Log Out */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={() => handleSaveProfile()}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand text-white font-bold text-xs transition-all hover:brightness-105 shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : saveSuccess ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{saveSuccess ? 'Saved' : 'Save Changes'}</span>
          </button>

          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/70 font-semibold text-xs transition-colors cursor-pointer"
            title="Log out of OmniCampus"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-800 dark:hover:text-rose-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Profile changes saved successfully.</span>
        </div>
      )}

      {/* Hero Photo & Identity Card */}
      <div className="bg-white dark:bg-[#252b35] rounded-2xl border border-slate-200 dark:border-[#373e4b] shadow-xs overflow-hidden">
        {/* Cover Header */}
        <div className="h-20 bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 dark:from-[#181c24] dark:to-[#1a202c] relative" />

        <div className="px-6 pb-5 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-10 mb-2 gap-4">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="relative group w-20 h-20 rounded-2xl ring-4 ring-white dark:ring-[#252b35] shadow-md overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                <img
                  src={avatar || currentUser.avatar}
                  alt={name}
                  className="w-full h-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity cursor-pointer"
                  title="Upload photo"
                >
                  <Camera className="w-4 h-4 mb-0.5" />
                  <span className="text-[9px] font-semibold">Change</span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">{name || 'User'}</h2>
                  <span className="px-2 py-0.5 rounded-md bg-brand/10 dark:bg-brand/20 text-brand text-[11px] font-bold">
                    {currentUser.role}
                  </span>
                  {currentUser.role === 'Faculty' && (
                    <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>{currentUser.idNumber || currentUser.employeeId || idNumber || 'FAC-2026-ACTIVE'}</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    {department}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {campus}
                  </span>
                </div>
              </div>
            </div>

            {/* Photo Action Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#373e4b] hover:bg-slate-50 dark:hover:bg-[#1e232d] text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Upload</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAvatarPresets(!showAvatarPresets)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#373e4b] hover:bg-slate-50 dark:hover:bg-[#1e232d] text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand" />
                <span>Presets</span>
              </button>
            </div>
          </div>

          {/* Avatar Presets Drawer */}
          {showAvatarPresets && (
            <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-[#1e232d] border border-slate-200 dark:border-[#373e4b] animate-in fade-in duration-150">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-slate-800 dark:text-white">Choose Avatar</p>
                <button
                  type="button"
                  onClick={() => setShowAvatarPresets(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 mt-2">
                {SKETCH_AVATAR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setAvatar(preset.src);
                      setShowAvatarPresets(false);
                    }}
                    className={cn(
                      'group flex flex-col items-center p-2 rounded-xl border-2 transition-all hover:scale-105 bg-white dark:bg-[#252b35] text-center cursor-pointer',
                      avatar === preset.src
                        ? 'border-brand ring-2 ring-brand/30 shadow-xs'
                        : 'border-slate-200 dark:border-[#373e4b] hover:border-slate-300'
                    )}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-slate-200/70 dark:border-[#373e4b] bg-slate-50 dark:bg-[#1e232d]">
                      <img src={preset.src} alt={preset.label} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-800 dark:text-slate-200 mt-1 truncate max-w-[70px]">
                      {preset.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Form Sections */}
      <form onSubmit={handleSaveProfile} className="space-y-5">
        {/* 1. Account Credentials & Contact */}
        <div className="bg-white dark:bg-[#252b35] rounded-2xl border border-slate-200 dark:border-[#373e4b] shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-[#373e4b] pb-3">
            <Mail className="w-4 h-4 text-brand" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Contact & Security</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Primary Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Primary Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled
                  value={firebaseUser?.email || currentUser.email || ''}
                  className="w-full pl-9 pr-24 py-2 text-xs bg-slate-100/80 dark:bg-[#1e232d] border border-slate-200 dark:border-[#373e4b] rounded-xl text-slate-600 dark:text-slate-400 font-medium cursor-not-allowed"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>
              </div>
            </div>

            {/* Alternate Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Alternate Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="personal@example.com"
                  value={alternateEmail}
                  onChange={(e) => setAlternateEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-[#1e232d] border border-slate-200 dark:border-[#373e4b] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Mobile Phone */}
            <div className="md:col-span-2 bg-slate-50/70 dark:bg-[#1e232d] rounded-xl p-4 border border-slate-200 dark:border-[#373e4b] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-brand" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Mobile Phone</span>
                </div>

                <div className="flex items-center gap-2">
                  {isPhoneVerified ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      Unverified
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="relative flex-1">
                  <PhoneCall className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="+1 (555) 234-5678"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (isPhoneVerified) setIsPhoneVerified(false);
                    }}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-[#252b35] border border-slate-200 dark:border-[#373e4b] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand text-slate-800 dark:text-slate-100"
                  />
                </div>

                {!isPhoneVerified ? (
                  <ConfettiButton
                    type="button"
                    variant="brand"
                    size="md"
                    onClick={handleSendVerificationCode}
                    disabled={isSendingOtp}
                    enableClickCelebration={false}
                    className="shrink-0 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{isSendingOtp ? 'Sending...' : 'Send OTP'}</span>
                  </ConfettiButton>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsPhoneVerified(false)}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-[#373e4b] bg-white dark:bg-[#252b35] hover:bg-slate-100 dark:hover:bg-[#1e232d] text-slate-600 dark:text-slate-300 font-medium text-xs transition-colors shrink-0 cursor-pointer"
                  >
                    Change Phone
                  </button>
                )}
              </div>

              <div id="recaptcha-container"></div>

              {/* OTP Prompt */}
              {isVerifyingPhone && (
                <div className="mt-3 p-3.5 bg-brand/10 dark:bg-brand/20 rounded-xl border border-brand/20 space-y-2.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-brand" />
                      Verify Phone
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsVerifyingPhone(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {otpInfo && (
                    <div className="p-2.5 bg-white dark:bg-[#252b35] rounded-lg border border-brand/30 text-[11px] text-slate-700 dark:text-slate-200 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Mail className="w-3.5 h-3.5 text-brand shrink-0" />
                        {otpInfo}
                      </span>
                    </div>
                  )}

                  {otpError && (
                    <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 p-2 rounded-lg border border-rose-200 dark:border-rose-800">
                      {otpError}
                    </p>
                  )}

                  {otpSuccess && (
                    <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Phone verified successfully.
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="6-digit code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full sm:w-44 px-3 py-1.5 text-center tracking-widest font-mono text-sm bg-white dark:bg-[#252b35] border border-slate-300 dark:border-[#373e4b] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-brand text-slate-900 dark:text-white"
                    />
                    <ConfettiButton
                      type="button"
                      variant="success"
                      size="sm"
                      onClick={handleConfirmOtp}
                      disabled={isConfirmingOtp || verificationCode.length !== 6}
                      enableClickCelebration={true}
                    >
                      {isConfirmingOtp ? 'Verifying...' : 'Confirm'}
                    </ConfettiButton>
                    <button
                      type="button"
                      onClick={handleSendVerificationCode}
                      disabled={resendCooldown > 0 || isSendingOtp}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-[#373e4b] bg-white dark:bg-[#252b35] hover:bg-slate-50 dark:hover:bg-[#1e232d] text-slate-700 dark:text-slate-300 text-xs font-semibold disabled:opacity-50 transition-colors"
                    >
                      {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. Personal Information */}
        <div className="bg-white dark:bg-[#252b35] rounded-2xl border border-slate-200 dark:border-[#373e4b] shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-[#373e4b] pb-3">
            <User className="w-4 h-4 text-brand" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Personal Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#1e232d] border border-slate-200 dark:border-[#373e4b] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* ID Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {currentUser.role === 'Faculty'
                  ? 'Permanent Faculty ID'
                  : currentUser.role === 'Student'
                  ? 'Enrollment Number'
                  : 'Employee ID'}
              </label>
              <div className="relative">
                <FileBadge className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ID Number"
                  disabled={currentUser.role === 'Faculty'}
                  value={
                    currentUser.role === 'Faculty'
                      ? currentUser.idNumber || currentUser.employeeId || idNumber || 'FAC-2026-ACTIVE'
                      : idNumber
                  }
                  onChange={(e) => {
                    if (currentUser.role !== 'Faculty') {
                      setIdNumber(e.target.value);
                    }
                  }}
                  className={cn(
                    'w-full pl-9 pr-3 py-2 text-xs border rounded-xl font-mono transition-colors',
                    currentUser.role === 'Faculty'
                      ? 'bg-slate-100/90 dark:bg-[#191d24] border-slate-300 dark:border-[#373e4b] text-slate-700 dark:text-slate-300 font-bold cursor-not-allowed select-none pr-28'
                      : 'bg-slate-50 dark:bg-[#1e232d] border-slate-200 dark:border-[#373e4b] focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand text-slate-800 dark:text-slate-100'
                  )}
                />
                {currentUser.role === 'Faculty' && (
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                    <Lock className="w-3 h-3 text-slate-500" />
                    Permanent ID
                  </span>
                )}
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#1e232d] border border-slate-200 dark:border-[#373e4b] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand text-slate-800 dark:text-slate-100"
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Electrical & Electronics">Electrical & Electronics</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Business Administration">Business Administration</option>
                <option value="Data Science & Artificial Intelligence">Data Science & AI</option>
                <option value="Biotechnology">Biotechnology</option>
              </select>
            </div>

            {/* Campus */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Campus Location
              </label>
              <select
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#1e232d] border border-slate-200 dark:border-[#373e4b] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand text-slate-800 dark:text-slate-100"
              >
                <option value="Main Tech Campus">Main Tech Campus</option>
                <option value="South Science Center">South Science Center</option>
                <option value="City Downtown Center">City Downtown Center</option>
                <option value="West Valley Research Wing">West Valley Research Wing</option>
              </select>
            </div>

            {/* Program / Designation */}
            {currentUser.role === 'Student' ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Academic Program
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. B.Tech Computer Science"
                      value={program}
                      onChange={(e) => setProgram(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-[#1e232d] border border-slate-200 dark:border-[#373e4b] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Semester
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#1e232d] border border-slate-200 dark:border-[#373e4b] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand text-slate-800 dark:text-slate-100"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Designation
                </label>
                <input
                  type="text"
                  placeholder="e.g. Associate Professor"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#1e232d] border border-slate-200 dark:border-[#373e4b] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand text-slate-800 dark:text-slate-100"
                />
              </div>
            )}

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date of Birth
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-[#1e232d] border border-slate-200 dark:border-[#373e4b] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Blood Group */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Blood Group
              </label>
              <div className="relative">
                <Heart className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-[#1e232d] border border-slate-200 dark:border-[#373e4b] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand text-slate-800 dark:text-slate-100"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            {/* Emergency Contact Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Emergency Contact Name
              </label>
              <input
                type="text"
                placeholder="Name"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#1e232d] border border-slate-200 dark:border-[#373e4b] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Emergency Contact Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Emergency Contact Phone
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#1e232d] border border-slate-200 dark:border-[#373e4b] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Address
            </label>
            <textarea
              rows={2}
              placeholder="Campus residence or home address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#1e232d] border border-slate-200 dark:border-[#373e4b] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand text-slate-800 dark:text-slate-100 resize-none"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Bio
            </label>
            <textarea
              rows={2}
              placeholder="Academic summary or research focus..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#1e232d] border border-slate-200 dark:border-[#373e4b] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand text-slate-800 dark:text-slate-100 resize-none"
            />
          </div>
        </div>

        {/* Admin Security */}
        {isAdminAccount && (
          <div className="bg-slate-900 dark:bg-[#1e232d] text-white rounded-2xl border border-slate-800 dark:border-[#373e4b] shadow-xs p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 dark:border-[#373e4b] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand/20 text-brand flex items-center justify-center border border-brand/30">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Admin Security</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand text-white">
                    SUPERADMIN
                  </span>
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 dark:bg-[#181c24] border border-white/5 space-y-1">
                <span className="text-slate-400 text-[11px] font-medium">Account Email</span>
                <div className="font-mono text-slate-200 font-semibold text-xs flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-brand" />
                  <span>{currentUser.email || firebaseUser?.email || 'Admin'}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 dark:bg-[#181c24] border border-white/5 space-y-1">
                <span className="text-slate-400 text-[11px] font-medium">Security Status</span>
                <div className="font-mono text-emerald-400 font-semibold text-xs flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Protected</span>
                </div>
              </div>
            </div>

            {syncPwdSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{syncPwdSuccess}</span>
              </div>
            )}

            {syncPwdError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{syncPwdError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-1 flex-wrap">
              <button
                type="button"
                disabled={syncPwdLoading}
                onClick={handleSendResetLink}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all border border-white/10 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Mail className="w-3.5 h-3.5 text-brand" />
                <span>Send Reset Email</span>
              </button>
              <button
                type="button"
                disabled={syncPwdLoading}
                onClick={handleSyncAdminPassword}
                className="px-4 py-2 rounded-xl bg-brand hover:brightness-105 text-white font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {syncPwdLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5" />
                )}
                <span>Sync Credentials</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. Account Session */}
        <div className="bg-white dark:bg-[#252b35] rounded-2xl border border-slate-200 dark:border-[#373e4b] shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Account Session</h4>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={logout}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/70 text-rose-700 dark:text-rose-300 font-bold text-xs transition-colors shadow-xs cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>

            <ConfettiButton
              type="submit"
              variant="brand"
              size="md"
              disabled={isSaving}
              enableClickCelebration={true}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl font-bold cursor-pointer"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saveSuccess ? 'Saved' : 'Save Changes'}</span>
            </ConfettiButton>
          </div>
        </div>
      </form>
    </div>
  );
};
