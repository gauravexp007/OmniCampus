import { AnimationScene } from './RobotAuthScene';

export interface SceneVisualTheme {
  id: AnimationScene;
  name: string;
  modeBadge: string;
  tagline: string;
  badgePillClass: string;
  logoBg: string;
  logoGlow: string;
  cardBorder: string;
  cardGlow: string;
  ambientAura: string;
  topGlowBar: string;
  tabActiveGradient: string;
  tabActiveGlow: string;
  inputFocusBorder: string;
  inputFocusRing: string;
  inputIconActive: string;
  buttonGradient: string;
  buttonShadow: string;
  roleSelectedBorder: string;
  roleSelectedBg: string;
  roleSelectedRing: string;
  roleSelectedIconText: string;
  strengthBarFilled: string;
  footerDotGlow: string;
  accentHex: string;
  glowColorRgba: string;
  scrollbarThumb: string;
  scrollbarThumbHover: string;
}

export const AUTH_SCENE_THEMES: Record<AnimationScene, SceneVisualTheme> = {
  robot: {
    id: 'robot',
    name: 'Cyber Core AI',
    modeBadge: 'Cyber AI Mode',
    tagline: 'Autonomous AI-assisted institutional security',
    badgePillClass: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.25)]',
    logoBg: 'bg-gradient-to-tr from-cyan-600 via-sky-500 to-blue-600',
    logoGlow: 'shadow-[0_0_24px_rgba(6,182,212,0.6)]',
    cardBorder: 'border-cyan-500/35 hover:border-cyan-400/50',
    cardGlow: 'shadow-[0_0_60px_-10px_rgba(6,182,212,0.3)]',
    ambientAura: 'from-cyan-500/25 via-sky-600/15 to-transparent',
    topGlowBar: 'from-transparent via-cyan-400 to-transparent',
    tabActiveGradient: 'bg-gradient-to-r from-cyan-500 to-sky-500 text-white',
    tabActiveGlow: 'shadow-[0_0_18px_rgba(6,182,212,0.5)]',
    inputFocusBorder: 'focus-within:border-cyan-400',
    inputFocusRing: 'focus-within:ring-2 focus-within:ring-cyan-500/30',
    inputIconActive: 'text-cyan-400',
    buttonGradient: 'bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500',
    buttonShadow: 'shadow-[0_0_28px_rgba(6,182,212,0.5)]',
    roleSelectedBorder: 'border-cyan-400',
    roleSelectedBg: 'bg-cyan-500/15',
    roleSelectedRing: 'ring-2 ring-cyan-500/30',
    roleSelectedIconText: 'text-cyan-300',
    strengthBarFilled: 'bg-cyan-400',
    footerDotGlow: 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]',
    accentHex: '#06b6d4',
    glowColorRgba: 'rgba(6, 182, 212, 0.4)',
    scrollbarThumb: 'rgba(6, 182, 212, 0.45)',
    scrollbarThumbHover: '#22d3ee',
  },
  welcome: {
    id: 'welcome',
    name: 'OmniConnect Welcome',
    modeBadge: 'Welcome Mode',
    tagline: 'Instant campus onboarding & verified digital identity',
    badgePillClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]',
    logoBg: 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500',
    logoGlow: 'shadow-[0_0_24px_rgba(16,185,129,0.6)]',
    cardBorder: 'border-emerald-500/35 hover:border-emerald-400/50',
    cardGlow: 'shadow-[0_0_60px_-10px_rgba(16,185,129,0.3)]',
    ambientAura: 'from-emerald-500/25 via-teal-600/15 to-transparent',
    topGlowBar: 'from-transparent via-emerald-400 to-transparent',
    tabActiveGradient: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
    tabActiveGlow: 'shadow-[0_0_18px_rgba(16,185,129,0.5)]',
    inputFocusBorder: 'focus-within:border-emerald-400',
    inputFocusRing: 'focus-within:ring-2 focus-within:ring-emerald-500/30',
    inputIconActive: 'text-emerald-400',
    buttonGradient: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-400 hover:to-teal-500',
    buttonShadow: 'shadow-[0_0_28px_rgba(16,185,129,0.5)]',
    roleSelectedBorder: 'border-emerald-400',
    roleSelectedBg: 'bg-emerald-500/15',
    roleSelectedRing: 'ring-2 ring-emerald-500/30',
    roleSelectedIconText: 'text-emerald-300',
    strengthBarFilled: 'bg-emerald-400',
    footerDotGlow: 'bg-emerald-400 shadow-[0_0_10px_#34d399]',
    accentHex: '#10b981',
    glowColorRgba: 'rgba(16, 185, 129, 0.4)',
    scrollbarThumb: 'rgba(16, 185, 129, 0.45)',
    scrollbarThumbHover: '#34d399',
  },
  study: {
    id: 'study',
    name: 'OmniScholar Academy',
    modeBadge: 'Academic Mode',
    tagline: 'Next-generation syllabus, faculty & course access',
    badgePillClass: 'bg-violet-500/10 text-violet-300 border-violet-500/30 shadow-[0_0_12px_rgba(139,92,246,0.25)]',
    logoBg: 'bg-gradient-to-tr from-violet-600 via-purple-600 to-fuchsia-500',
    logoGlow: 'shadow-[0_0_24px_rgba(139,92,246,0.6)]',
    cardBorder: 'border-violet-500/35 hover:border-violet-400/50',
    cardGlow: 'shadow-[0_0_60px_-10px_rgba(139,92,246,0.3)]',
    ambientAura: 'from-violet-600/25 via-purple-600/15 to-transparent',
    topGlowBar: 'from-transparent via-violet-400 to-transparent',
    tabActiveGradient: 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white',
    tabActiveGlow: 'shadow-[0_0_18px_rgba(139,92,246,0.5)]',
    inputFocusBorder: 'focus-within:border-violet-400',
    inputFocusRing: 'focus-within:ring-2 focus-within:ring-violet-500/30',
    inputIconActive: 'text-violet-400',
    buttonGradient: 'bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500',
    buttonShadow: 'shadow-[0_0_28px_rgba(139,92,246,0.5)]',
    roleSelectedBorder: 'border-violet-400',
    roleSelectedBg: 'bg-violet-500/15',
    roleSelectedRing: 'ring-2 ring-violet-500/30',
    roleSelectedIconText: 'text-violet-300',
    strengthBarFilled: 'bg-violet-400',
    footerDotGlow: 'bg-violet-400 shadow-[0_0_10px_#c084fc]',
    accentHex: '#8b5cf6',
    glowColorRgba: 'rgba(139, 92, 246, 0.4)',
    scrollbarThumb: 'rgba(139, 92, 246, 0.45)',
    scrollbarThumbHover: '#c084fc',
  },
  studying: {
    id: 'studying',
    name: 'OmniFocus Station',
    modeBadge: 'Focus Desk Mode',
    tagline: 'Deep study workspace, library & research collaboration',
    badgePillClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.25)]',
    logoBg: 'bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500',
    logoGlow: 'shadow-[0_0_24px_rgba(245,158,11,0.6)]',
    cardBorder: 'border-amber-500/35 hover:border-amber-400/50',
    cardGlow: 'shadow-[0_0_60px_-10px_rgba(245,158,11,0.3)]',
    ambientAura: 'from-amber-500/25 via-orange-600/15 to-transparent',
    topGlowBar: 'from-transparent via-amber-400 to-transparent',
    tabActiveGradient: 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white',
    tabActiveGlow: 'shadow-[0_0_18px_rgba(245,158,11,0.5)]',
    inputFocusBorder: 'focus-within:border-amber-400',
    inputFocusRing: 'focus-within:ring-2 focus-within:ring-amber-500/30',
    inputIconActive: 'text-amber-400',
    buttonGradient: 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400',
    buttonShadow: 'shadow-[0_0_28px_rgba(245,158,11,0.5)]',
    roleSelectedBorder: 'border-amber-400',
    roleSelectedBg: 'bg-amber-500/15',
    roleSelectedRing: 'ring-2 ring-amber-500/30',
    roleSelectedIconText: 'text-amber-300',
    strengthBarFilled: 'bg-amber-400',
    footerDotGlow: 'bg-amber-400 shadow-[0_0_10px_#fbbf24]',
    accentHex: '#f59e0b',
    glowColorRgba: 'rgba(245, 158, 11, 0.4)',
    scrollbarThumb: 'rgba(245, 158, 11, 0.45)',
    scrollbarThumbHover: '#fbbf24',
  },
};
