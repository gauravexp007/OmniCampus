import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  updatePassword,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../../lib/firebase';
import { UserRole } from '../../types';
import { useERP } from '../../context/ERPContext';
import { getSketchAvatar } from '../../utils/sketchAvatars';
import { RobotAuthScene, AnimationScene } from './RobotAuthScene';
import { FormalPasswordResetModal } from './FormalPasswordResetModal';
import { SetNewPasswordScreen } from './SetNewPasswordScreen';
import {
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
  Bot,
  Sparkles,
  GraduationCap,
  Flame,
  Building,
  Sun,
  Moon,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const ADMIN_EMAIL = 'fab.gaurav007@gmail.com';
export const ADMIN_DEFAULT_PASSWORD = '#Gauravxmarvel111#';

interface AuthModalProps {
  initialMode?: 'signin' | 'signup';
  onSuccess?: () => void;
}

export const AuthScreen: React.FC<AuthModalProps> = ({ initialMode = 'signin', onSuccess }) => {
  const { isDarkMode, toggleDarkMode } = useERP();
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [activeScene, setActiveScene] = useState<AnimationScene>('robot');
  const [focusedField, setFocusedField] = useState<'email' | 'password' | 'name' | 'general' | null>(null);

  const [email, setEmail] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('omnicampus_remember_email') || '';
    }
    return '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign up fields
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [role, setRole] = useState<UserRole>('Student');

  const [error, setError] = useState<string | null>(null);
  const [socialNotice, setSocialNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');

  const pageContainerRef = useRef<HTMLDivElement>(null);

  // Check if user landed from legitimate password reset link
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'resetPassword') {
        const linkEmail = params.get('email') || '';
        const linkToken = params.get('token') || '';
        setResetEmail(linkEmail);
        setResetToken(linkToken);
        setIsResettingPassword(true);
      }
    }
  }, []);

  if (isResettingPassword) {
    return (
      <SetNewPasswordScreen
        email={resetEmail}
        token={resetToken}
        onComplete={() => {
          setIsResettingPassword(false);
          if (typeof window !== 'undefined') {
            const cleanUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
          }
        }}
      />
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSocialNotice(null);
    setIsLoading(true);

    if (rememberMe && email.trim()) {
      localStorage.setItem('omnicampus_remember_email', email.trim());
    } else {
      localStorage.removeItem('omnicampus_remember_email');
    }

    try {
      const cleanEmail = email.trim().toLowerCase();
      const isDesignatedAdmin = cleanEmail === ADMIN_EMAIL.toLowerCase();

      if (isSignUp) {
        if (!fullName.trim()) {
          throw new Error('Please enter your full name');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }

        const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const firebaseUser = userCred.user;

        await updateProfile(firebaseUser, {
          displayName: fullName.trim(),
        });

        const assignedRole: UserRole = isDesignatedAdmin
          ? 'Admin'
          : (role === 'Faculty' ? 'Faculty' : 'Student');

        const facultyYear = new Date().getFullYear();
        const uniqueFacultyId = `FAC-${facultyYear}-${Math.floor(1000 + Math.random() * 9000)}`;

        const userDocRef = doc(db, 'users', firebaseUser.uid);
        await setDoc(userDocRef, {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: fullName.trim(),
          role: assignedRole,
          department: department,
          idNumber: assignedRole === 'Faculty' ? uniqueFacultyId : `STU-${facultyYear}-${Math.floor(1000 + Math.random() * 9000)}`,
          employeeId: assignedRole === 'Faculty' ? uniqueFacultyId : undefined,
          facultyId: assignedRole === 'Faculty' ? uniqueFacultyId : undefined,
          avatar: getSketchAvatar(assignedRole),
          campus: 'Main Tech Campus',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        if (assignedRole === 'Faculty') {
          try {
            await setDoc(doc(db, 'faculty', firebaseUser.uid), {
              id: firebaseUser.uid,
              employeeId: uniqueFacultyId,
              name: fullName.trim(),
              email: firebaseUser.email,
              avatar: getSketchAvatar('Faculty'),
              department: department || 'Engineering & Technology',
              designation: 'Assistant Professor',
              specialization: 'Core Academics',
              coursesAssigned: [],
              weeklyHours: 16,
              publicationsCount: 0,
              rating: 4.8,
              status: 'Active',
              phone: '',
              officeRoom: 'Faculty Wing',
              joinedYear: facultyYear,
            });
          } catch (facErr) {
            console.warn('Notice saving faculty profile to faculty collection:', facErr);
          }
        }
      } else {
        let userCred;
        try {
          userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
        } catch (signErr: any) {
          if (
            isDesignatedAdmin &&
            password === ADMIN_DEFAULT_PASSWORD &&
            (signErr?.code === 'auth/user-not-found' ||
              signErr?.code === 'auth/invalid-credential' ||
              signErr?.message?.includes('user-not-found') ||
              signErr?.message?.includes('invalid-credential'))
          ) {
            try {
              userCred = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_DEFAULT_PASSWORD);
              await updateProfile(userCred.user, {
                displayName: 'Gaurav (Administrator)',
              });
            } catch (createErr: any) {
              if (createErr?.code === 'auth/email-already-in-use') {
                throw new Error(
                  'Invalid credentials. If you forgot your password, please use the reset link.'
                );
              }
              throw createErr;
            }
          } else {
            throw signErr;
          }
        }

        const firebaseUser = userCred.user;

        if (isDesignatedAdmin && password === ADMIN_DEFAULT_PASSWORD) {
          try {
            await updatePassword(firebaseUser, ADMIN_DEFAULT_PASSWORD);
          } catch (syncErr) {
            // Silently continue
          }
        }

        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const snap = await getDoc(userDocRef);
        const facultyYear = new Date().getFullYear();
        const uniqueFacultyId = `FAC-${facultyYear}-${Math.floor(1000 + Math.random() * 9000)}`;

        if (!snap.exists()) {
          const chosenRole: UserRole = isDesignatedAdmin
            ? 'Admin'
            : (role === 'Faculty' ? 'Faculty' : 'Student');

          await setDoc(userDocRef, {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || (isDesignatedAdmin ? 'Gaurav (Administrator)' : role === 'Faculty' ? 'Faculty Member' : 'Student Member'),
            role: chosenRole,
            department: isDesignatedAdmin ? 'University Governance & Administration' : department || 'Computer Science & Engineering',
            idNumber: chosenRole === 'Faculty' ? uniqueFacultyId : `STU-${facultyYear}-${Math.floor(1000 + Math.random() * 9000)}`,
            employeeId: chosenRole === 'Faculty' ? uniqueFacultyId : undefined,
            facultyId: chosenRole === 'Faculty' ? uniqueFacultyId : undefined,
            avatar: getSketchAvatar(chosenRole),
            campus: 'Main Tech Campus',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });

          if (chosenRole === 'Faculty') {
            try {
              await setDoc(doc(db, 'faculty', firebaseUser.uid), {
                id: firebaseUser.uid,
                employeeId: uniqueFacultyId,
                name: firebaseUser.displayName || 'Faculty Member',
                email: firebaseUser.email,
                avatar: getSketchAvatar('Faculty'),
                department: department || 'Computer Science & Engineering',
                designation: 'Assistant Professor',
                specialization: 'Core Academics',
                status: 'Active',
                joinedYear: facultyYear,
              }, { merge: true });
            } catch (e) {
              console.warn('Faculty collection seed notice:', e);
            }
          }
        } else {
          const data = snap.data();
          if (isDesignatedAdmin) {
            if (data.role !== 'Admin') {
              await setDoc(userDocRef, { role: 'Admin', updatedAt: new Date().toISOString() }, { merge: true });
            }
          } else {
            // Regular user: update role to what they chose on the sign in screen
            const chosenRole: UserRole = role === 'Faculty' ? 'Faculty' : 'Student';
            const resolvedFacId = data.idNumber || data.employeeId || data.facultyId || uniqueFacultyId;

            const updatePayload: Record<string, any> = {
              role: chosenRole,
              updatedAt: new Date().toISOString(),
            };

            if (chosenRole === 'Faculty') {
              updatePayload.idNumber = resolvedFacId;
              updatePayload.employeeId = resolvedFacId;
              updatePayload.facultyId = resolvedFacId;

              try {
                await setDoc(doc(db, 'faculty', firebaseUser.uid), {
                  id: firebaseUser.uid,
                  employeeId: resolvedFacId,
                  name: data.name || firebaseUser.displayName || 'Faculty Member',
                  email: firebaseUser.email,
                  avatar: data.avatar || getSketchAvatar('Faculty'),
                  department: data.department || department || 'Computer Science & Engineering',
                  designation: data.designation || 'Assistant Professor',
                  status: 'Active',
                  joinedYear: data.joinedYear || facultyYear,
                }, { merge: true });
              } catch (facSyncErr) {
                console.warn('Faculty sync notice:', facSyncErr);
              }
            }

            await setDoc(userDocRef, updatePayload, { merge: true });
          }
        }

        if (isDesignatedAdmin) {
          try {
            const credRef = doc(db, 'system_credentials', 'admin_auth');
            await setDoc(credRef, {
              adminEmail: ADMIN_EMAIL,
              role: 'Admin',
              passwordConfigured: true,
              authProvider: 'firebase_auth',
              lastAuthenticated: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }, { merge: true });
          } catch (sysErr) {
            console.warn('System credentials sync:', sysErr);
          }
        }
      }

      onSuccess?.();
    } catch (err: unknown) {
      console.error('Firebase Auth Error:', err);
      if (err instanceof Error) {
        if (err.message.includes('auth/invalid-credential') || err.message.includes('auth/wrong-password') || err.message.includes('auth/user-not-found')) {
          setError('Invalid username, email, or password.');
        } else if (err.message.includes('auth/email-already-in-use')) {
          setError('An account with this email already exists.');
        } else if (err.message.includes('auth/weak-password')) {
          setError('Password should be at least 6 characters.');
        } else if (err.message.includes('auth/invalid-email')) {
          setError('Please provide a valid email address.');
        } else {
          setError(err.message || 'Authentication failed. Please verify credentials.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSocialNotice(null);
    setIsLoading(true);
    try {
      const userCred = await signInWithPopup(auth, googleProvider);
      const firebaseUser = userCred.user;
      const cleanEmail = (firebaseUser.email || '').trim().toLowerCase();
      const isDesignatedAdmin = cleanEmail === ADMIN_EMAIL.toLowerCase();

      if (isDesignatedAdmin) {
        try {
          await updatePassword(firebaseUser, ADMIN_DEFAULT_PASSWORD);
        } catch (pwdSyncErr) {
          // Silently continue
        }
      }
      const assignedRole: UserRole = isDesignatedAdmin
        ? 'Admin'
        : (role === 'Faculty' ? 'Faculty' : 'Student');

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const snap = await getDoc(userDocRef);
      const facultyYear = new Date().getFullYear();
      const uniqueFacultyId = `FAC-${facultyYear}-${Math.floor(1000 + Math.random() * 9000)}`;

      if (!snap.exists()) {
        const idNumber = assignedRole === 'Faculty'
          ? uniqueFacultyId
          : assignedRole === 'Student'
          ? `STU-${facultyYear}-${Math.floor(1000 + Math.random() * 9000)}`
          : 'ADM-2026-001';

        await setDoc(userDocRef, {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || (assignedRole === 'Faculty' ? 'Faculty Member' : 'Campus Member'),
          role: assignedRole,
          department: department || (assignedRole === 'Admin' ? 'University Administration' : 'Computer Science & AI'),
          idNumber,
          employeeId: assignedRole === 'Faculty' ? uniqueFacultyId : undefined,
          facultyId: assignedRole === 'Faculty' ? uniqueFacultyId : undefined,
          avatar: getSketchAvatar(assignedRole),
          campus: 'Main Tech Campus',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        if (assignedRole === 'Faculty') {
          try {
            await setDoc(doc(db, 'faculty', firebaseUser.uid), {
              id: firebaseUser.uid,
              employeeId: uniqueFacultyId,
              name: firebaseUser.displayName || 'Faculty Member',
              email: firebaseUser.email,
              avatar: getSketchAvatar('Faculty'),
              department: department || 'Computer Science & AI',
              designation: 'Assistant Professor',
              specialization: 'Core Academics',
              coursesAssigned: [],
              weeklyHours: 14,
              publicationsCount: 0,
              rating: 4.8,
              status: 'Active',
              joinedYear: facultyYear,
              officeRoom: 'Room 302, Academic Block',
              phone: '',
            }, { merge: true });
          } catch (facErr) {
            console.warn('Faculty collection seed error on Google SSO:', facErr);
          }
        }
      } else {
        const data = snap.data();
        if (isDesignatedAdmin) {
          if (data.role !== 'Admin') {
            await setDoc(userDocRef, { role: 'Admin', updatedAt: new Date().toISOString() }, { merge: true });
          }
        } else {
          // Regular user logging in: apply their chosen role
          const chosenRole: UserRole = role === 'Faculty' ? 'Faculty' : 'Student';
          const resolvedFacId = data.idNumber || data.employeeId || data.facultyId || uniqueFacultyId;

          const updatePayload: Record<string, any> = {
            role: chosenRole,
            updatedAt: new Date().toISOString(),
          };

          if (chosenRole === 'Faculty') {
            updatePayload.idNumber = resolvedFacId;
            updatePayload.employeeId = resolvedFacId;
            updatePayload.facultyId = resolvedFacId;

            try {
              await setDoc(doc(db, 'faculty', firebaseUser.uid), {
                id: firebaseUser.uid,
                employeeId: resolvedFacId,
                name: data.name || firebaseUser.displayName || 'Faculty Member',
                email: firebaseUser.email,
                avatar: data.avatar || getSketchAvatar('Faculty'),
                department: data.department || department || 'Computer Science & AI',
                designation: data.designation || 'Assistant Professor',
                specialization: data.specialization || 'Core Academics',
                coursesAssigned: data.coursesAssigned || [],
                weeklyHours: 14,
                publicationsCount: 0,
                rating: 4.8,
                status: 'Active',
                joinedYear: data.joinedYear || facultyYear,
                officeRoom: data.officeRoom || 'Room 302, Academic Block',
                phone: data.phone || '',
              }, { merge: true });
            } catch (facSyncErr) {
              console.warn('Faculty sync error on Google SSO:', facSyncErr);
            }
          }

          await setDoc(userDocRef, updatePayload, { merge: true });
        }
      }

      onSuccess?.();
    } catch (err: unknown) {
      console.error('Google Sign-in Error:', err);
      if (err instanceof Error && !err.message.includes('popup-closed-by-user')) {
        setError(err.message || 'Google Sign-in failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialNotice = (provider: string) => {
    setSocialNotice(`${provider} Single Sign-On is connecting. Use Google SSO for verified 1-click access.`);
    setTimeout(() => setSocialNotice(null), 4000);
  };

  // Color refraction glow adapted dynamically from active animation scene
  const sceneAuraColors = {
    robot: isDarkMode
      ? 'from-cyan-500/25 via-sky-600/15 to-blue-600/25'
      : 'from-cyan-400/25 via-sky-300/20 to-blue-400/25',
    welcome: isDarkMode
      ? 'from-emerald-500/25 via-teal-600/15 to-cyan-600/25'
      : 'from-emerald-400/25 via-teal-300/20 to-cyan-400/25',
    study: isDarkMode
      ? 'from-violet-500/25 via-purple-600/15 to-fuchsia-600/25'
      : 'from-violet-400/25 via-purple-300/20 to-fuchsia-400/25',
    studying: isDarkMode
      ? 'from-amber-500/25 via-orange-600/15 to-rose-600/25'
      : 'from-amber-400/25 via-orange-300/20 to-rose-400/25',
  }[activeScene];

  return (
    <div
      ref={pageContainerRef}
      id="auth-page-container"
      className={cn(
        'w-full min-h-screen relative overflow-x-hidden transition-colors duration-700 selection:bg-blue-500 selection:text-white',
        // Scrolling in tablet & mobile only; locked viewport on desktop (lg+)
        'overflow-y-auto lg:overflow-hidden lg:h-screen flex flex-col lg:flex-row items-center justify-start lg:justify-between px-3 sm:px-6 lg:px-10 xl:px-16',
        isDarkMode
          ? 'bg-gradient-to-br from-[#111317] via-[#1a1e25] to-[#2b313d] text-white'
          : 'bg-gradient-to-br from-[#f8fafc] via-[#edf2f8] to-[#dbe4ef] text-slate-900'
      )}
    >
      {/* =========================================================================
          CONTINUOUS FULL-CANVAS ATMOSPHERIC LIGHT FIELD (Hardware-Accelerated)
          ========================================================================= */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-60 transition-opacity duration-700"
        style={{
          backgroundImage: `
            radial-gradient(circle at 15% 15%, rgba(56, 189, 248, 0.12) 0%, transparent 50%),
            radial-gradient(circle at 85% 85%, rgba(99, 102, 241, 0.12) 0%, transparent 50%)
          `,
        }}
      />

      {/* Floating Top Controls: Scene Switcher (Left) & Dark Mode Toggle (Right) */}
      <div className="fixed sm:absolute top-3 left-3 sm:top-5 sm:left-6 z-40 flex items-center gap-1 bg-white/45 dark:bg-white/10 backdrop-blur-2xl p-1 sm:px-2 sm:py-1 rounded-2xl border border-white/70 dark:border-white/20 shadow-[0_6px_16px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.8)]">
        {[
          { id: 'robot' as AnimationScene, label: 'Cyber AI', icon: Bot, color: 'text-cyan-600 dark:text-cyan-400' },
          { id: 'welcome' as AnimationScene, label: 'Welcome', icon: Sparkles, color: 'text-emerald-600 dark:text-emerald-400' },
          { id: 'study' as AnimationScene, label: 'Academy', icon: GraduationCap, color: 'text-violet-600 dark:text-violet-400' },
          { id: 'studying' as AnimationScene, label: 'Focus', icon: Flame, color: 'text-amber-600 dark:text-amber-400' },
        ].map((sceneItem) => {
          const Icon = sceneItem.icon;
          const isActive = activeScene === sceneItem.id;
          return (
            <button
              key={sceneItem.id}
              type="button"
              onClick={() => setActiveScene(sceneItem.id)}
              title={`Switch to ${sceneItem.label}`}
              className={cn(
                'px-2 py-1 rounded-xl text-[10px] sm:text-[11px] font-semibold flex items-center gap-1 transition-all duration-200 cursor-pointer',
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/10'
              )}
            >
              <Icon className={cn('w-3 h-3 sm:w-3.5 sm:h-3.5', isActive ? 'text-white' : sceneItem.color)} />
              <span className="hidden md:inline">{sceneItem.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dark Mode Toggle (Top Right) */}
      <div className="fixed sm:absolute top-3 right-3 sm:top-5 sm:right-6 z-40">
        <button
          type="button"
          onClick={toggleDarkMode}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-white/45 dark:bg-white/10 backdrop-blur-2xl border border-white/70 dark:border-white/20 shadow-[0_6px_16px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.8)] text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          {isDarkMode ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-slate-700" />
              <span className="hidden sm:inline">Dark</span>
            </>
          )}
        </button>
      </div>

      {/* =========================================================================
          SECTION 1: ANIMATION STAGE (Fully accessible in Tablet & Mobile at top;
          Side-by-side on desktop with reduced compact sizing)
          ========================================================================= */}
      <div className="w-full lg:w-[54%] xl:w-[58%] lg:h-full flex flex-col items-center justify-center pt-16 sm:pt-20 lg:pt-0 pb-2 sm:pb-4 lg:pb-0 shrink-0 pointer-events-auto z-10">
        <RobotAuthScene
          focusedField={focusedField}
          authMode={isSignUp ? 'signup' : 'signin'}
          activeScene={activeScene}
          onSceneChange={setActiveScene}
        />
      </div>

      {/* =========================================================================
          SECTION 2: REDUCED COMPACT LOGIN WINDOW OVERLAY
          (Accessible via scroll in tablet/mobile, side-by-side on desktop)
          ========================================================================= */}
      {/* =========================================================================
          SECTION 2: GLASSMORPHIC LOGIN WINDOW OVERLAY
          (Accessible via scroll in tablet/mobile; enlarged ratio side-by-side on desktop/laptop)
          ========================================================================= */}
      <div className="w-full lg:w-[46%] xl:w-[42%] lg:h-full flex items-center justify-center xl:justify-center pb-12 pt-2 lg:py-6 shrink-0 z-20">
        <motion.div
          id="auth-form-panel"
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[340px] sm:max-w-[380px] lg:max-w-[430px] xl:max-w-[470px] relative my-auto"
        >
          {/* Dynamic Ambient Refraction Glow adapting to active animation scene */}
          <div
            className={cn(
              'absolute -inset-1.5 rounded-[2.75rem] lg:rounded-[3.25rem] blur-2xl pointer-events-none transition-all duration-1000 -z-10 bg-gradient-to-tr',
              sceneAuraColors
            )}
          />

          {/* CURVED BOX CONTAINER WITH GLASSMORPHIC EFFECT (Enlarged on laptop/desktop) */}
          <div
            className={cn(
              'relative w-full rounded-[2.25rem] sm:rounded-[2.5rem] lg:rounded-[3rem] border p-5 sm:p-7 lg:p-8 xl:p-9 flex flex-col overflow-hidden transition-all duration-700 backdrop-blur-3xl',
              isDarkMode
                ? 'bg-[#000000]/45 border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_2px_4px_rgba(255,255,255,0.2),inset_0_-2px_4px_rgba(0,0,0,0.6)]'
                : 'bg-white/35 sm:bg-white/45 border-white/75 shadow-[0_20px_50px_-15px_rgba(37,99,235,0.18),0_8px_20px_-5px_rgba(15,23,42,0.06),inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-2px_4px_rgba(255,255,255,0.4)]'
            )}
          >
            {/* Top Specular Glass Reflection Sweep */}
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />

            {/* WHITE GLASSMORPHIC LOGO (Enlarged on laptop/desktop) */}
            <div className="flex justify-center mb-2.5 sm:mb-3 lg:mb-4">
              <div
                className={cn(
                  'w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 xl:w-15 xl:h-15 rounded-xl sm:rounded-2xl lg:rounded-3xl flex items-center justify-center transition-all duration-500 backdrop-blur-2xl border shadow-md',
                  isDarkMode
                    ? 'bg-white/10 border-white/25 text-cyan-400 shadow-[inset_0_2px_4px_rgba(255,255,255,0.25)]'
                    : 'bg-white/60 border-white/80 text-blue-600 shadow-[inset_0_2px_4px_rgba(255,255,255,0.95),0_6px_16px_rgba(37,99,235,0.15)]'
                )}
              >
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 stroke-[2.2]" />
              </div>
            </div>

            {/* Header: Title and Minimal Tagline */}
            <div className="text-center mb-4 sm:mb-5 lg:mb-6">
              <h1
                className={cn(
                  'text-2xl sm:text-3xl lg:text-3xl xl:text-4xl font-extrabold tracking-tight',
                  isDarkMode ? 'text-white' : 'text-[#0f172a]'
                )}
              >
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h1>
              <p
                className={cn(
                  'text-[11px] sm:text-xs lg:text-sm font-medium tracking-wide mt-0.5 lg:mt-1',
                  isDarkMode ? 'text-slate-300' : 'text-[#64748b]'
                )}
              >
                {isSignUp ? 'Sign up to continue' : 'Sign in to continue'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-3 p-2.5 lg:p-3 rounded-xl lg:rounded-2xl bg-rose-500/15 backdrop-blur-md border border-rose-400/30 flex items-start gap-2 text-rose-600 dark:text-rose-300 text-xs lg:text-sm animate-shake">
                <AlertCircle className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0 mt-0.5 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Social Notification */}
            {socialNotice && (
              <div className="mb-3 p-2.5 lg:p-3 rounded-xl lg:rounded-2xl bg-blue-500/15 backdrop-blur-md border border-blue-400/30 flex items-center gap-2 text-blue-700 dark:text-blue-300 text-xs lg:text-sm">
                <Check className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0 text-blue-500" />
                <span>{socialNotice}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5 lg:space-y-4">
              {/* WHO ARE YOU: Student vs Faculty Selector (Available on Sign In & Sign Up) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <span className={cn(
                    'text-[10px] sm:text-[11px] font-black uppercase tracking-wider',
                    isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  )}>
                    {isSignUp ? 'Register As:' : 'Sign In As:'}
                  </span>
                  <span className={cn(
                    'text-[10px] font-bold px-2 py-0.5 rounded-full',
                    role === 'Student'
                      ? 'bg-blue-500/20 text-blue-400 dark:text-cyan-300 border border-blue-400/30'
                      : 'bg-indigo-500/20 text-indigo-500 dark:text-indigo-300 border border-indigo-400/30'
                  )}>
                    {role === 'Student' ? '🎓 Student Portal' : '👨‍🏫 Faculty Portal'}
                  </span>
                </div>

                <div
                  className={cn(
                    'grid grid-cols-2 p-1 rounded-full border backdrop-blur-2xl transition-all',
                    isDarkMode
                      ? 'bg-white/10 border-white/20 shadow-[inset_0_2px_4px_rgba(255,255,255,0.15)]'
                      : 'bg-white/60 border-white/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.9)]'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setRole('Student');
                      if (activeScene === 'robot') setActiveScene('study');
                    }}
                    className={cn(
                      'py-2 px-3 rounded-full text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none',
                      role === 'Student'
                        ? 'bg-blue-600 text-white shadow-md scale-102 ring-2 ring-blue-400/50'
                        : isDarkMode
                        ? 'text-slate-300 hover:text-white hover:bg-white/10'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                    )}
                  >
                    <GraduationCap className="w-4 h-4 stroke-[2.4]" />
                    <span>Student</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRole('Faculty');
                      if (activeScene === 'robot') setActiveScene('welcome');
                    }}
                    className={cn(
                      'py-2 px-3 rounded-full text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none',
                      role === 'Faculty'
                        ? 'bg-indigo-600 text-white shadow-md scale-102 ring-2 ring-indigo-400/50'
                        : isDarkMode
                        ? 'text-slate-300 hover:text-white hover:bg-white/10'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                    )}
                  >
                    <UserCheck className="w-4 h-4 stroke-[2.4]" />
                    <span>Faculty</span>
                  </button>
                </div>
              </div>

              {/* If signing up: Full legal name */}
              {isSignUp && (
                <div
                  className={cn(
                    'relative flex items-center rounded-full transition-all duration-300 h-10 sm:h-11 lg:h-12 xl:h-13 border backdrop-blur-2xl',
                    isDarkMode
                      ? 'bg-white/10 border-white/20 shadow-[inset_0_2px_4px_rgba(255,255,255,0.15)] focus-within:bg-white/15 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/30'
                      : 'bg-white/50 border-white/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),0_4px_14px_rgba(0,0,0,0.04)] focus-within:bg-white/75 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-400/30'
                  )}
                >
                  <User className="w-4 h-4 lg:w-5 lg:h-5 text-slate-400 dark:text-slate-300 ml-4 lg:ml-5 shrink-0 stroke-[2]" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name"
                    style={{ backgroundColor: 'transparent', outline: 'none' }}
                    className={cn(
                      'glass-input w-full bg-transparent px-3 py-2 lg:px-4 lg:py-3 text-xs sm:text-sm lg:text-base font-medium focus:outline-hidden border-0',
                      isDarkMode
                        ? 'text-white placeholder:text-slate-400'
                        : 'text-[#1e293b] placeholder:text-[#94a3b8]'
                    )}
                  />
                </div>
              )}

              {/* WHITE GLASSMORPHIC TEXT FIELD: Username or Email (Enlarged on laptop/desktop) */}
              <div
                className={cn(
                  'relative flex items-center rounded-full transition-all duration-300 h-10 sm:h-11 lg:h-12 xl:h-13 border backdrop-blur-2xl',
                  isDarkMode
                    ? 'bg-white/10 border-white/20 shadow-[inset_0_2px_4px_rgba(255,255,255,0.15)] focus-within:bg-white/15 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/30'
                    : 'bg-white/50 border-white/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),0_4px_14px_rgba(0,0,0,0.04)] focus-within:bg-white/75 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-400/30'
                )}
              >
                <User className="w-4 h-4 lg:w-5 lg:h-5 text-slate-400 dark:text-slate-300 ml-4 lg:ml-5 shrink-0 stroke-[2]" />
                <input
                  type="text"
                  required
                  value={email}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    role === 'Faculty'
                      ? 'Faculty ID or Email (e.g. FAC-...)'
                      : 'Student ID or Email (e.g. STU-...)'
                  }
                  style={{ backgroundColor: 'transparent', outline: 'none' }}
                  className={cn(
                    'glass-input w-full bg-transparent px-3 py-2 lg:px-4 lg:py-3 text-xs sm:text-sm lg:text-base font-medium focus:outline-hidden border-0',
                    isDarkMode
                      ? 'text-white placeholder:text-slate-400'
                      : 'text-[#1e293b] placeholder:text-[#94a3b8]'
                  )}
                />
              </div>

              {/* WHITE GLASSMORPHIC TEXT FIELD: Password (Enlarged on laptop/desktop) */}
              <div
                className={cn(
                  'relative flex items-center rounded-full transition-all duration-300 h-10 sm:h-11 lg:h-12 xl:h-13 border backdrop-blur-2xl',
                  isDarkMode
                    ? 'bg-white/10 border-white/20 shadow-[inset_0_2px_4px_rgba(255,255,255,0.15)] focus-within:bg-white/15 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/30'
                    : 'bg-white/50 border-white/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),0_4px_14px_rgba(0,0,0,0.04)] focus-within:bg-white/75 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-400/30'
                )}
              >
                <Lock className="w-4 h-4 lg:w-5 lg:h-5 text-slate-400 dark:text-slate-300 ml-4 lg:ml-5 shrink-0 stroke-[2]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  style={{ backgroundColor: 'transparent', outline: 'none' }}
                  className={cn(
                    'glass-input w-full bg-transparent px-3 py-2 lg:px-4 lg:py-3 text-xs sm:text-sm lg:text-base font-medium focus:outline-hidden border-0',
                    isDarkMode
                      ? 'text-white placeholder:text-slate-400'
                      : 'text-[#1e293b] placeholder:text-[#94a3b8]'
                  )}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="mr-3.5 lg:mr-4.5 p-1 text-slate-400 dark:text-slate-300 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 lg:w-5 lg:h-5 stroke-[2]" />
                  ) : (
                    <Eye className="w-4 h-4 lg:w-5 lg:h-5 stroke-[2]" />
                  )}
                </button>
              </div>

              {/* If signing up: Department selector (Especially for Faculty) */}
              {isSignUp && (
                <div
                  className={cn(
                    'relative flex items-center rounded-full border backdrop-blur-2xl h-10 sm:h-11 lg:h-12 xl:h-13',
                    isDarkMode
                      ? 'bg-white/10 border-white/20'
                      : 'bg-white/50 border-white/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.9)]'
                  )}
                >
                  <Building className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-slate-400 dark:text-slate-300 ml-3.5 lg:ml-4 shrink-0 pointer-events-none" />
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className={cn(
                      'w-full bg-transparent px-2.5 py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm font-medium focus:outline-hidden cursor-pointer',
                      isDarkMode ? 'text-white' : 'text-[#1e293b]'
                    )}
                  >
                    <option className="bg-slate-900 text-white" value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option className="bg-slate-900 text-white" value="Electrical & Electronics">Electrical & Electronics</option>
                    <option className="bg-slate-900 text-white" value="Mechanical Engineering">Mechanical Engineering</option>
                    <option className="bg-slate-900 text-white" value="Business Administration">Business Administration</option>
                    <option className="bg-slate-900 text-white" value="Data Science & Artificial Intelligence">Data Science & Artificial Intelligence</option>
                  </select>
                </div>
              )}

              {/* Remember Me & Forgot Password Row */}
              {!isSignUp && (
                <div className="flex items-center justify-between px-1 py-0.5 lg:py-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRememberMe(!rememberMe)}
                      className={cn(
                        'w-4 h-4 lg:w-4.5 lg:h-4.5 rounded-sm lg:rounded-md flex items-center justify-center transition-all cursor-pointer',
                        rememberMe
                          ? 'bg-[#2563eb] text-white shadow-xs'
                          : isDarkMode
                          ? 'bg-white/10 border border-white/20'
                          : 'bg-white/70 border border-slate-300'
                      )}
                    >
                      {rememberMe && <Check className="w-3 h-3 lg:w-3.5 lg:h-3.5 stroke-[3]" />}
                    </button>
                    <span
                      onClick={() => setRememberMe(!rememberMe)}
                      className={cn(
                        'text-[11px] sm:text-xs lg:text-sm font-semibold cursor-pointer select-none',
                        isDarkMode ? 'text-slate-200' : 'text-[#334155]'
                      )}
                    >
                      Remember Me
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsResetModalOpen(true)}
                    className={cn(
                      'text-[11px] sm:text-xs lg:text-sm font-bold hover:underline cursor-pointer transition-colors',
                      isDarkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-[#2563eb] hover:text-[#1d4ed8]'
                    )}
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* Vibrant Blue 3D Pill Button with Arrow (Enlarged on laptop/desktop) */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 sm:h-11 lg:h-12 xl:h-13.5 rounded-full text-white font-bold text-xs sm:text-sm lg:text-base transition-all duration-300 relative overflow-hidden flex items-center justify-between px-3.5 sm:px-4 lg:px-5 group cursor-pointer disabled:opacity-50 bg-gradient-to-r from-[#2c77f4] via-[#1d65ef] to-[#0f54e4] shadow-[0_8px_20px_rgba(29,101,239,0.38),inset_0_1px_2px_rgba(255,255,255,0.45)] hover:shadow-[0_12px_26px_rgba(29,101,239,0.48)] active:scale-[0.985] mt-1 lg:mt-2"
              >
                <div className="w-7 sm:w-8 lg:w-9 xl:w-10 shrink-0" />
                <span className="text-center font-bold tracking-wide">
                  {isLoading ? (isSignUp ? 'Creating...' : 'Signing In...') : (isSignUp ? 'Sign Up' : 'Login')}
                </span>
                <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 lg:w-9 lg:h-9 xl:w-10 xl:h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white shrink-0 shadow-xs transition-transform group-hover:translate-x-0.5">
                  {isLoading ? (
                    <div className="w-3.5 h-3.5 lg:w-4 lg:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 stroke-[2.4]" />
                  )}
                </div>
              </button>
            </form>

            {/* Divider: OR CONTINUE WITH */}
            <div className="relative my-3.5 sm:my-4 lg:my-5 flex items-center justify-center">
              <div className={cn('w-full border-t', isDarkMode ? 'border-white/15' : 'border-[#d0dced]')} />
              <span
                className={cn(
                  'absolute px-2.5 lg:px-3 backdrop-blur-md text-[9px] sm:text-[10px] lg:text-xs font-bold tracking-widest uppercase rounded-full',
                  isDarkMode ? 'bg-black/60 text-slate-400' : 'bg-white/60 text-[#8a9bb2]'
                )}
              >
                Or Continue With
              </span>
            </div>

            {/* Social Logins: 3 White Glassmorphic Squircles (Enlarged on laptop/desktop) */}
            <div className="flex items-center justify-center gap-3.5 sm:gap-4 lg:gap-5">
              {/* Google */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                title="Sign in with Google"
                disabled={isLoading}
                className={cn(
                  'w-11 h-11 sm:w-12 sm:h-12 lg:w-13.5 lg:h-13.5 xl:w-15 xl:h-15 rounded-xl sm:rounded-2xl lg:rounded-3xl backdrop-blur-2xl border hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer transition-all',
                  isDarkMode
                    ? 'bg-white/10 border-white/20 shadow-[0_6px_16px_rgba(0,0,0,0.4),inset_0_2px_3px_rgba(255,255,255,0.2)] hover:bg-white/15'
                    : 'bg-white/65 border-white/80 shadow-[0_6px_16px_rgba(148,163,184,0.18),inset_0_2px_3px_rgba(255,255,255,0.95)] hover:bg-white/80'
                )}
              >
                <svg className="w-5 h-5 lg:w-6 lg:h-6 xl:w-6.5 xl:h-6.5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </button>

              {/* Discord */}
              <button
                type="button"
                onClick={() => handleSocialNotice('Discord')}
                title="Sign in with Discord"
                disabled={isLoading}
                className={cn(
                  'w-11 h-11 sm:w-12 sm:h-12 lg:w-13.5 lg:h-13.5 xl:w-15 xl:h-15 rounded-xl sm:rounded-2xl lg:rounded-3xl backdrop-blur-2xl border hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer transition-all',
                  isDarkMode
                    ? 'bg-white/10 border-white/20 shadow-[0_6px_16px_rgba(0,0,0,0.4),inset_0_2px_3px_rgba(255,255,255,0.2)] hover:bg-white/15'
                    : 'bg-white/65 border-white/80 shadow-[0_6px_16px_rgba(148,163,184,0.18),inset_0_2px_3px_rgba(255,255,255,0.95)] hover:bg-white/80'
                )}
              >
                <svg className="w-5 h-5 lg:w-6 lg:h-6 xl:w-6.5 xl:h-6.5 shrink-0" viewBox="0 0 24 24" fill="#5865F2">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </button>

              {/* Facebook */}
              <button
                type="button"
                onClick={() => handleSocialNotice('Facebook')}
                title="Sign in with Facebook"
                disabled={isLoading}
                className={cn(
                  'w-11 h-11 sm:w-12 sm:h-12 lg:w-13.5 lg:h-13.5 xl:w-15 xl:h-15 rounded-xl sm:rounded-2xl lg:rounded-3xl backdrop-blur-2xl border hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer transition-all',
                  isDarkMode
                    ? 'bg-white/10 border-white/20 shadow-[0_6px_16px_rgba(0,0,0,0.4),inset_0_2px_3px_rgba(255,255,255,0.2)] hover:bg-white/15'
                    : 'bg-white/65 border-white/80 shadow-[0_6px_16px_rgba(148,163,184,0.18),inset_0_2px_3px_rgba(255,255,255,0.95)] hover:bg-white/80'
                )}
              >
                <svg className="w-5 h-5 lg:w-6 lg:h-6 xl:w-6.5 xl:h-6.5 shrink-0" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>
            </div>

            {/* Bottom Toggle between Sign In and Sign Up */}
            <div className="mt-3.5 sm:mt-4 lg:mt-5 text-center">
              <span className={cn('text-[11px] sm:text-xs lg:text-sm', isDarkMode ? 'text-slate-400' : 'text-[#7c8ba0]')}>
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                className={cn(
                  'text-[11px] sm:text-xs lg:text-sm font-bold hover:underline cursor-pointer transition-colors',
                  isDarkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-[#2563eb] hover:text-[#1d4ed8]'
                )}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Formal University Password Reset Modal */}
      <FormalPasswordResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        defaultEmail={email}
        onSelectResetToken={(targetEmail, token) => {
          setIsResetModalOpen(false);
          setResetEmail(targetEmail);
          setResetToken(token);
          setIsResettingPassword(true);
        }}
      />
    </div>
  );
};
