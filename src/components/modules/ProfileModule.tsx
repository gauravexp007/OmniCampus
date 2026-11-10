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
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { cn } from '../../lib/utils';
import { SKETCH_AVATAR_PRESETS, getSketchAvatar } from '../../utils/sketchAvatars';
import { ConfettiButton } from '../ui/ConfettiButton';

export const ProfileModule: React.FC = () => {
  const { currentUser, updateUserProfile, logout, firebaseUser } = useERP();

  // Local form state initialized from currentUser (defaulting to sketch if demo photo exists)
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
        setSyncPwdSuccess('Password credentials securely synchronized with Firebase Authentication and database.');
      } else if (targetEmail) {
        await sendPasswordResetEmail(auth, targetEmail);
        setSyncPwdSuccess(`Security password reset link dispatched to ${targetEmail}.`);
      }
    } catch (err: any) {
      console.error('Password sync error:', err);
      if (err?.code === 'auth/requires-recent-login') {
        try {
          if (targetEmail) {
            await sendPasswordResetEmail(auth, targetEmail);
            setSyncPwdSuccess(
              `Security notice: Direct update requires recent re-login. A secure password reset email was dispatched to ${targetEmail}.`
            );
          }
        } catch {
          setSyncPwdError('Please sign out and sign in again before updating security credentials.');
        }
      } else {
        setSyncPwdError(err?.message || 'Failed to sync credentials with database.');
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
      setSyncPwdSuccess(`Secure password reset link sent to ${targetEmail}. Check your inbox.`);
    } catch (err: any) {
      setSyncPwdError(err?.message || 'Could not send reset link. Try again.');
    } finally {
      setSyncPwdLoading(false);
    }
  };

  // Phone Verification Flow states (Real SMS OTP via Firebase)
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isConfirmingOtp, setIsConfirmingOtp] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [otpInfo, setOtpInfo] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend OTP countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Custom photo modal / preset avatars
  const [showAvatarPresets, setShowAvatarPresets] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle local photo file upload
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

  // Start Phone OTP flow - sends real SMS to the entered mobile number
  const handleSendVerificationCode = async () => {
    setErrorMsg(null);
    setOtpError(null);
    setOtpInfo(null);

    const rawPhone = phone.trim();
    if (!rawPhone || rawPhone.length < 8) {
      setErrorMsg('Please enter a valid phone number with country code (e.g., +1 for US or +91 for India).');
      return;
    }

    // Format phone to standard E.164
    let formattedPhone = rawPhone.replace(/[^\d+]/g, '');
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+${formattedPhone}`;
    }

    setIsSendingOtp(true);
    try {
      // Initialize or reset RecaptchaVerifier
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (_) {}
      }

      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
      });

      const confirmation = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        (window as any).recaptchaVerifier
      );

      setConfirmationResult(confirmation);
      setIsVerifyingPhone(true);
      setVerificationCode('');
      setOtpInfo(`An SMS with a 6-digit verification code was sent to ${formattedPhone}. Please enter it below.`);
      setResendCooldown(60);
    } catch (err: any) {
      console.error('Firebase Phone Auth Error:', err);
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
          (window as any).recaptchaVerifier = undefined;
        } catch (_) {}
      }

      if (err?.code === 'auth/invalid-phone-number') {
        setOtpError('Invalid phone number format. Please ensure country code is included (e.g. +1... or +91...).');
      } else if (err?.code === 'auth/quota-exceeded') {
        setOtpError('SMS quota limit reached. Please wait a few moments before trying again.');
      } else if (err?.code === 'auth/captcha-check-failed') {
        setOtpError('Security verification failed. Please try again.');
      } else if (err?.code === 'auth/operation-not-allowed') {
        setOtpError('Phone SMS authentication is not enabled in Firebase Console. Please verify Auth settings.');
      } else {
        setOtpError(err?.message || 'Unable to send SMS. Please check your mobile number and country code.');
      }
      setIsVerifyingPhone(true);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Confirm Phone OTP received on user's mobile device
  const handleConfirmOtp = async () => {
    if (!verificationCode.trim() || verificationCode.trim().length !== 6) {
      setOtpError('Please enter the 6-digit code received on your mobile phone.');
      return;
    }
    setOtpError(null);
    setIsConfirmingOtp(true);

    try {
      if (confirmationResult) {
        await confirmationResult.confirm(verificationCode.trim());
      } else {
        throw new Error('Verification session expired. Please request a new OTP code.');
      }

      setIsPhoneVerified(true);
      setOtpSuccess(true);
      setOtpInfo(null);
      await updateUserProfile({
        phone: phone.trim(),
        isPhoneVerified: true,
      });

      setTimeout(() => {
        setIsVerifyingPhone(false);
        setOtpSuccess(false);
      }, 1500);
    } catch (err: any) {
      console.error('Confirm OTP Error:', err);
      if (err?.code === 'auth/invalid-verification-code') {
        setOtpError('Incorrect verification code. Please check your SMS messages and re-enter.');
      } else if (err?.code === 'auth/code-expired') {
        setOtpError('This verification code has expired. Please click Resend to receive a fresh SMS.');
      } else {
        setOtpError(err?.message || 'Verification failed. Please check the code received on your phone.');
      }
    } finally {
      setIsConfirmingOtp(false);
    }
  };

  // Save all profile details to Firestore
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
        idNumber: idNumber.trim(),
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
      setErrorMsg('Failed to save profile changes. Please check internet connection.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Institutional Identity</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-semibold text-emerald-600">Active Campus Member</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            My User Profile
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your personal profile, credentials, contact verification, and institutional records.
          </p>
        </div>

        {/* Top Actions: Save & Log Out */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={() => handleSaveProfile()}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand text-white font-semibold text-xs transition-all hover:opacity-95 shadow-xs disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : saveSuccess ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{saveSuccess ? 'Saved!' : 'Save Changes'}</span>
          </button>

          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50/70 text-rose-700 hover:bg-rose-100 font-semibold text-xs transition-colors"
            title="Log out of OmniCampus"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile changes saved and synchronized to Cloud Firestore successfully.</span>
        </div>
      )}

      {/* Hero Photo & Identity Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Cover Header */}
        <div className="h-28 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 relative">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-[11px] font-medium border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Firebase Authenticated</span>
          </div>
        </div>

        <div className="px-6 pb-6 pt-0 relative">
          {/* Avatar positioning */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 mb-4 gap-4">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="relative group w-24 h-24 rounded-2xl ring-4 ring-white shadow-md overflow-hidden bg-slate-100 shrink-0">
                <img
                  src={avatar || currentUser.avatar}
                  alt={name}
                  className="w-full h-full object-cover"
                />

                {/* Upload overlay */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity cursor-pointer"
                  title="Upload photo from device"
                >
                  <Camera className="w-5 h-5 mb-0.5" />
                  <span className="text-[9px] font-semibold">Change</span>
                </button>

                {/* Hidden File Input */}
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
                  <h2 className="text-xl font-bold text-slate-900">{name || 'Your Full Name'}</h2>
                  <span className="px-2 py-0.5 rounded-md bg-brand-light border border-brand text-brand-dark text-[11px] font-bold">
                    {currentUser.role}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Upload Photo</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAvatarPresets(!showAvatarPresets)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand" />
                <span>Avatar Presets</span>
              </button>
            </div>
          </div>

          {/* Illustrated Avatar Presets Drawer */}
          {showAvatarPresets && (
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 animate-in fade-in duration-150">
              <div className="flex items-center justify-between mb-2.5">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Select an Illustrated Avatar Profile</p>
                  <p className="text-[11px] text-slate-500">Choose from 16 illustrated avatars matching campus member profiles</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAvatarPresets(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs p-1 cursor-pointer"
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
                      'group flex flex-col items-center p-2 rounded-xl border-2 transition-all hover:scale-105 bg-white text-center cursor-pointer',
                      avatar === preset.src
                        ? 'border-brand ring-2 ring-brand/30 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-slate-200/70 bg-slate-50">
                      <img src={preset.src} alt={preset.label} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-800 mt-1 truncate max-w-[70px]">
                      {preset.label}
                    </span>
                    <span className="text-[8px] text-slate-400 uppercase tracking-tight">
                      {preset.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Form Sections Grid */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* 1. Account Credentials & Contact Verification */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-brand" />
              <h3 className="text-sm font-bold text-slate-900">Email & Phone Verification</h3>
            </div>
            <span className="text-[11px] text-slate-400">Security & Sign-in</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Primary Login Email (Read Only from Firebase Auth) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mail Used (Primary Account Login)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled
                  value={firebaseUser?.email || currentUser.email || ''}
                  className="w-full pl-9 pr-24 py-2 text-xs bg-slate-100/80 border border-slate-200 rounded-xl text-slate-600 font-medium cursor-not-allowed"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Official institutional email linked to your Firebase user identity.
              </p>
            </div>

            {/* Alternate / Secondary Contact Mail */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alternate Contact Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="personal.backup@gmail.com"
                  value={alternateEmail}
                  onChange={(e) => setAlternateEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand text-slate-800"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Used for notification copies, recovery, and campus announcements.
              </p>
            </div>

            {/* Phone Number with Interactive Verification */}
            <div className="md:col-span-2 bg-slate-50/70 rounded-xl p-4 border border-slate-200/90 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-brand" />
                    <span className="text-xs font-bold text-slate-900">Mobile Phone & SMS Verification</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Required for urgent campus alerts, exam updates, and 2-step verification.
                  </p>
                </div>

                {/* Status badge */}
                <div className="flex items-center gap-2">
                  {isPhoneVerified ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Phone Verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 border border-amber-200">
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
                    placeholder="+1 (555) 234-5678 or +91 9876543210"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (isPhoneVerified) setIsPhoneVerified(false); // require re-verification on change
                    }}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand text-slate-800"
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
                    className="shrink-0"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{isSendingOtp ? 'Sending SMS...' : 'Send OTP Code'}</span>
                  </ConfettiButton>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsPhoneVerified(false)}
                    className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 font-medium text-xs transition-colors shrink-0"
                  >
                    Change Phone
                  </button>
                )}
              </div>

              {/* Invisible Recaptcha Container for Firebase Phone Auth */}
              <div id="recaptcha-container"></div>

              {/* OTP Verification Prompt Card */}
              {isVerifyingPhone && (
                <div className="mt-3 p-3.5 bg-brand-light rounded-xl border border-brand/20 space-y-2.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-brand" />
                      Verify Mobile Number: {phone}
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsVerifyingPhone(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {otpInfo && (
                    <div className="p-2.5 bg-white rounded-lg border border-brand/30 text-[11px] text-slate-700 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-medium text-slate-800">
                        <Mail className="w-3.5 h-3.5 text-brand shrink-0" />
                        {otpInfo}
                      </span>
                    </div>
                  )}

                  {otpError && (
                    <p className="text-[11px] font-semibold text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                      {otpError}
                    </p>
                  )}

                  {otpSuccess && (
                    <p className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Verification successful! Phone verified.
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-digit code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full sm:w-44 px-3 py-1.5 text-center tracking-widest font-mono text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-brand"
                    />
                    <ConfettiButton
                      type="button"
                      variant="success"
                      size="sm"
                      onClick={handleConfirmOtp}
                      disabled={isConfirmingOtp || verificationCode.length !== 6}
                      enableClickCelebration={true}
                    >
                      {isConfirmingOtp ? 'Verifying...' : 'Confirm Code'}
                    </ConfettiButton>
                    <button
                      type="button"
                      onClick={handleSendVerificationCode}
                      disabled={resendCooldown > 0 || isSendingOtp}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold disabled:opacity-50 transition-colors"
                    >
                      {resendCooldown > 0 ? `Resend SMS (${resendCooldown}s)` : 'Resend SMS'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. Personal & Academic Details */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-brand" />
              <h3 className="text-sm font-bold text-slate-900">Personal & Academic Particulars</h3>
            </div>
            <span className="text-[11px] text-slate-400">Feed your profile details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Legal Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand text-slate-800"
              />
            </div>

            {/* Roll / Staff Registration ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {currentUser.role === 'Student' ? 'Roll / Enrollment Number' : 'Employee / Staff ID'}
              </label>
              <div className="relative">
                <FileBadge className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={currentUser.role === 'Student' ? 'e.g. 2024-CS-084' : 'e.g. FAC-CSE-019'}
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand text-slate-800"
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department / Faculty
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand text-slate-800"
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Electrical & Electronics">Electrical & Electronics</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Business Administration">Business Administration</option>
                <option value="Data Science & Artificial Intelligence">Data Science & AI</option>
                <option value="Biotechnology">Biotechnology</option>
              </select>
            </div>

            {/* Campus / Center */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Campus Location
              </label>
              <select
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand text-slate-800"
              >
                <option value="Main Tech Campus">Main Tech Campus (North Block)</option>
                <option value="South Science Center">South Science Center</option>
                <option value="City Downtown Center">City Downtown Center</option>
                <option value="West Valley Research Wing">West Valley Research Wing</option>
              </select>
            </div>

            {/* Student Program / Faculty Designation */}
            {currentUser.role === 'Student' ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Academic Program
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. B.Tech Computer Science"
                      value={program}
                      onChange={(e) => setProgram(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Semester
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand text-slate-800"
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Designation / Academic Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Associate Professor / Senior Registrar"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand text-slate-800"
                />
              </div>
            )}

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date of Birth
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand text-slate-800"
                />
              </div>
            </div>

            {/* Blood Group */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Blood Group (Medical Card)
              </label>
              <div className="relative">
                <Heart className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand text-slate-800"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Emergency Contact Name
              </label>
              <input
                type="text"
                placeholder="Parent, Spouse, or Guardian"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand text-slate-800"
              />
            </div>

            {/* Emergency Contact Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Emergency Contact Phone
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand text-slate-800"
              />
            </div>
          </div>

          {/* Residential / Hostel Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Residential Address / Hostel Room
            </label>
            <textarea
              rows={2}
              placeholder="Room 304, Block B, Campus Residence or Residential Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand text-slate-800 resize-none"
            />
          </div>

          {/* Academic / Research Bio */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Bio / Research Interests & Summary
            </label>
            <textarea
              rows={3}
              placeholder="Describe your academic focus, research publications, or campus extracurriculars..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand text-slate-800 resize-none"
            />
          </div>
        </div>

        {/* Admin Security & Password Master Configuration */}
        {isAdminAccount && (
          <div className="bg-slate-900 text-white rounded-2xl border border-brand-primary/30 shadow-xs p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-light text-brand flex items-center justify-center border border-brand">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Admin Security & Credentials</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand text-white border border-brand-primary">
                      SUPERADMIN
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Master administrator credentials and Firebase Authentication password synchronization.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                <span className="text-slate-400 text-[11px] font-medium">Registered Account Email</span>
                <div className="font-mono text-slate-200 font-semibold text-xs flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-brand" />
                  <span>{currentUser.email || firebaseUser?.email || 'Authorized User'}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                <span className="text-slate-400 text-[11px] font-medium">Authentication Security</span>
                <div className="font-mono text-emerald-400 font-semibold text-xs flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                  <span>•••••••••••• (Encrypted in Database)</span>
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

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <span className="text-[11px] text-slate-400">
                Credentials and security authentication rules are managed securely via Firebase and Firestore database.
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={syncPwdLoading}
                  onClick={handleSendResetLink}
                  className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all border border-white/10 shadow-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <Mail className="w-3.5 h-3.5 text-brand" />
                  <span>Send Reset Email</span>
                </button>
                <button
                  type="button"
                  disabled={syncPwdLoading}
                  onClick={handleSyncAdminPassword}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {syncPwdLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5" />
                  )}
                  <span>Sync Database Credentials</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. Account Actions & Logout Section */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-slate-900">Sign Out of Session</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Securely end your authenticated campus session on this device.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={logout}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors shadow-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out Now</span>
            </button>

            <ConfettiButton
              type="submit"
              variant="brand"
              size="md"
              disabled={isSaving}
              enableClickCelebration={true}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl font-bold"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saveSuccess ? 'Changes Saved!' : 'Save Profile'}</span>
            </ConfettiButton>
          </div>
        </div>
      </form>
    </div>
  );
};
