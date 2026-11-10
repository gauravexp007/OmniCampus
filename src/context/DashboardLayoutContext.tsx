import React, { createContext, useContext, useState, useEffect } from 'react';
import { ERPModuleId } from '../types';

export type QuickAccessTileFormat = 'square' | 'bar' | 'circle';
export type QuickAccessPlacement =
  | 'top-right'
  | 'top-hero'
  | 'above-analytics'
  | 'below-analytics'
  | 'right-column';

export type QuickAccessModuleId =
  | 'attendance'
  | 'exams'
  | 'timetable'
  | 'academics'
  | 'results'
  | 'performance'
  | 'students'
  | 'finance'
  | 'library'
  | 'hostel'
  | 'userfiles';

export interface QuickAccessTileConfig {
  id: QuickAccessModuleId;
  format: QuickAccessTileFormat;
  visible: boolean;
  order: number;
}

export type LayoutPresetId = 'default-hybrid' | 'all-bars' | 'all-squares' | 'compact-circles';

// Dashboard Blocks (The entire dashboard is composed of modular blocks)
export type DashboardBlockId =
  | 'kpis'
  | 'quick_access'
  | 'analytics'
  | 'schedule'
  | 'exams'
  | 'operations'
  | 'facilities'
  | 'vitals';

export type BlockWidth = 'full' | 'half' | 'two-thirds' | 'one-third';

export interface DashboardBlockConfig {
  id: DashboardBlockId;
  name: string;
  subtitle: string;
  visible: boolean;
  order: number;
  width: BlockWidth;
}

export type DashboardPresetId =
  | 'default'
  | 'quick-access-first'
  | 'analytics-first'
  | 'operations-first'
  | 'compact';

export interface DashboardLayoutContextType {
  // Global Edit Mode
  isEditMode: boolean;
  setIsEditMode: (edit: boolean) => void;
  toggleEditMode: () => void;

  // Dashboard Modular Blocks Customization
  blockConfigs: Record<DashboardBlockId, DashboardBlockConfig>;
  orderedBlockIds: DashboardBlockId[];
  moveBlock: (id: DashboardBlockId, direction: 'up' | 'down') => void;
  reorderBlocks: (newOrder: DashboardBlockId[]) => void;
  toggleBlockVisibility: (id: DashboardBlockId) => void;
  setBlockWidth: (id: DashboardBlockId, width: BlockWidth) => void;
  resetDashboardBlocks: () => void;
  applyDashboardPreset: (preset: DashboardPresetId) => void;

  // Legacy Quick Access Placement (retained for backward compatibility)
  placement: QuickAccessPlacement;
  setPlacement: (placement: QuickAccessPlacement) => void;

  // Quick Access Modular Tiles Customization
  tileConfigs: Record<QuickAccessModuleId, QuickAccessTileConfig>;
  orderedTileIds: QuickAccessModuleId[];
  setTileFormat: (id: QuickAccessModuleId, format: QuickAccessTileFormat) => void;
  toggleTileVisibility: (id: QuickAccessModuleId) => void;
  moveTile: (id: QuickAccessModuleId, direction: 'up' | 'down') => void;
  reorderTiles: (newOrder: QuickAccessModuleId[]) => void;
  applyPreset: (preset: LayoutPresetId) => void;
  resetLayout: () => void;
  bigSquaresCount: number;
  smallBarsCount: number;
  smallCirclesCount: number;
}

const STORAGE_KEY = 'omnicampus_dashboard_layout_v3';

// All 8 Dashboard Blocks
export const ALL_DASHBOARD_BLOCK_IDS: DashboardBlockId[] = [
  'kpis',
  'quick_access',
  'analytics',
  'schedule',
  'exams',
  'operations',
  'facilities',
  'vitals',
];

export const DEFAULT_BLOCK_CONFIGS: Record<DashboardBlockId, DashboardBlockConfig> = {
  kpis: {
    id: 'kpis',
    name: 'Key Performance Indicators (KPIs)',
    subtitle: 'Enrolled scholars, faculty headcount, admissions & revenue stats',
    visible: true,
    order: 0,
    width: 'full',
  },
  quick_access: {
    id: 'quick_access',
    name: 'Quick Access Modular Launchpad',
    subtitle: '1-click direct launch cards, small bars & circles',
    visible: true,
    order: 1,
    width: 'half',
  },
  analytics: {
    id: 'analytics',
    name: 'Visual Analytics & Graphs',
    subtitle: 'Attendance turnout and student performance charts',
    visible: true,
    order: 2,
    width: 'half',
  },
  schedule: {
    id: 'schedule',
    name: 'Class Schedule & Timetable',
    subtitle: 'Registered weekly lecture periods & timings',
    visible: true,
    order: 3,
    width: 'two-thirds',
  },
  exams: {
    id: 'exams',
    name: 'Upcoming Examinations',
    subtitle: 'Academic assessment dates & venues',
    visible: true,
    order: 4,
    width: 'one-third',
  },
  operations: {
    id: 'operations',
    name: 'Quick Actions & Operational Workflows',
    subtitle: 'Direct operational management buttons',
    visible: true,
    order: 5,
    width: 'half',
  },
  facilities: {
    id: 'facilities',
    name: 'Campus Services & Digital Amenities',
    subtitle: 'Hostel rooms, Library catalog & Cloud Vault',
    visible: true,
    order: 6,
    width: 'half',
  },
  vitals: {
    id: 'vitals',
    name: 'Campus Vital Signs & Live Pulse',
    subtitle: 'Real-time database sync, operational telemetry & health',
    visible: true,
    order: 7,
    width: 'full',
  },
};

// All 11 Quick Access Module IDs
export const ALL_QUICK_ACCESS_MODULE_IDS: QuickAccessModuleId[] = [
  'attendance',
  'exams',
  'timetable',
  'academics',
  'results',
  'performance',
  'students',
  'finance',
  'library',
  'hostel',
  'userfiles',
];

// Default tile configuration: 4 Big Squares (like image 1) and 7 Small Rectangle Bars (like image 2)
export const DEFAULT_TILE_CONFIGS: Record<QuickAccessModuleId, QuickAccessTileConfig> = {
  attendance: { id: 'attendance', format: 'square', visible: true, order: 0 },
  exams: { id: 'exams', format: 'square', visible: true, order: 1 },
  timetable: { id: 'timetable', format: 'square', visible: true, order: 2 },
  academics: { id: 'academics', format: 'square', visible: true, order: 3 },
  results: { id: 'results', format: 'bar', visible: true, order: 4 },
  performance: { id: 'performance', format: 'bar', visible: true, order: 5 },
  students: { id: 'students', format: 'bar', visible: true, order: 6 },
  finance: { id: 'finance', format: 'bar', visible: true, order: 7 },
  library: { id: 'library', format: 'bar', visible: true, order: 8 },
  hostel: { id: 'hostel', format: 'bar', visible: true, order: 9 },
  userfiles: { id: 'userfiles', format: 'bar', visible: true, order: 10 },
};

const DashboardLayoutContext = createContext<DashboardLayoutContextType | undefined>(undefined);

export const DashboardLayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [placement, setPlacementState] = useState<QuickAccessPlacement>('top-right');

  // Load blockConfigs
  const [blockConfigs, setBlockConfigs] = useState<Record<DashboardBlockId, DashboardBlockConfig>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.blockConfigs) {
          const merged = { ...DEFAULT_BLOCK_CONFIGS };
          Object.keys(parsed.blockConfigs).forEach((key) => {
            const bKey = key as DashboardBlockId;
            if (merged[bKey]) {
              merged[bKey] = {
                ...merged[bKey],
                ...parsed.blockConfigs[key],
              };
            }
          });
          return merged;
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_BLOCK_CONFIGS;
  });

  // Load tileConfigs
  const [tileConfigs, setTileConfigs] = useState<Record<QuickAccessModuleId, QuickAccessTileConfig>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.tileConfigs) {
          const merged = { ...DEFAULT_TILE_CONFIGS };
          Object.keys(parsed.tileConfigs).forEach((key) => {
            const modKey = key as QuickAccessModuleId;
            if (merged[modKey]) {
              merged[modKey] = {
                ...merged[modKey],
                ...parsed.tileConfigs[key],
              };
            }
          });
          return merged;
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_TILE_CONFIGS;
  });

  // Load placement from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.placement) {
          setPlacementState(parsed.placement);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Save changes to localStorage
  const saveToStorage = (
    newBlocks: Record<DashboardBlockId, DashboardBlockConfig>,
    newTiles: Record<QuickAccessModuleId, QuickAccessTileConfig>,
    newPlacement: QuickAccessPlacement
  ) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          blockConfigs: newBlocks,
          tileConfigs: newTiles,
          placement: newPlacement,
          updatedAt: new Date().toISOString(),
        })
      );
    } catch {
      // storage unavailable
    }
  };

  // Block management functions
  const orderedBlockIds = (Object.values(blockConfigs) as DashboardBlockConfig[])
    .sort((a, b) => a.order - b.order)
    .map((b) => b.id);

  const moveBlock = (id: DashboardBlockId, direction: 'up' | 'down') => {
    const currentIndex = orderedBlockIds.indexOf(id);
    if (currentIndex === -1) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= orderedBlockIds.length) return;

    const newOrder = [...orderedBlockIds];
    const [removed] = newOrder.splice(currentIndex, 1);
    newOrder.splice(targetIndex, 0, removed);

    reorderBlocks(newOrder);
  };

  const reorderBlocks = (newOrder: DashboardBlockId[]) => {
    setBlockConfigs((prev) => {
      const updated = { ...prev };
      newOrder.forEach((id, index) => {
        if (updated[id]) {
          updated[id] = { ...updated[id], order: index };
        }
      });
      saveToStorage(updated, tileConfigs, placement);
      return updated;
    });
  };

  const toggleBlockVisibility = (id: DashboardBlockId) => {
    setBlockConfigs((prev) => {
      const updated = {
        ...prev,
        [id]: {
          ...prev[id],
          visible: !prev[id].visible,
        },
      };
      saveToStorage(updated, tileConfigs, placement);
      return updated;
    });
  };

  const setBlockWidth = (id: DashboardBlockId, width: BlockWidth) => {
    setBlockConfigs((prev) => {
      const updated = {
        ...prev,
        [id]: {
          ...prev[id],
          width,
        },
      };
      saveToStorage(updated, tileConfigs, placement);
      return updated;
    });
  };

  const resetDashboardBlocks = () => {
    setBlockConfigs(DEFAULT_BLOCK_CONFIGS);
    saveToStorage(DEFAULT_BLOCK_CONFIGS, tileConfigs, placement);
  };

  const applyDashboardPreset = (preset: DashboardPresetId) => {
    setBlockConfigs((prev) => {
      const updated = { ...prev };
      switch (preset) {
        case 'default':
          // Standard balanced: KPIs (full) -> Quick Access (half) -> Analytics (half) -> Schedule (2/3) -> Exams (1/3) -> Operations (half) -> Facilities (half) -> Vitals (full)
          ALL_DASHBOARD_BLOCK_IDS.forEach((id) => {
            updated[id] = { ...DEFAULT_BLOCK_CONFIGS[id] };
          });
          break;

        case 'quick-access-first':
          // Quick Access directly at top (full), followed by KPIs, Graphs, Schedule, etc.
          updated.quick_access = { ...updated.quick_access, order: 0, width: 'full', visible: true };
          updated.kpis = { ...updated.kpis, order: 1, width: 'full', visible: true };
          updated.analytics = { ...updated.analytics, order: 2, width: 'full', visible: true };
          updated.schedule = { ...updated.schedule, order: 3, width: 'two-thirds', visible: true };
          updated.exams = { ...updated.exams, order: 4, width: 'one-third', visible: true };
          updated.operations = { ...updated.operations, order: 5, width: 'half', visible: true };
          updated.facilities = { ...updated.facilities, order: 6, width: 'half', visible: true };
          updated.vitals = { ...updated.vitals, order: 7, width: 'full', visible: true };
          break;

        case 'analytics-first':
          // Graphs & Visual Analytics at the top!
          updated.analytics = { ...updated.analytics, order: 0, width: 'full', visible: true };
          updated.quick_access = { ...updated.quick_access, order: 1, width: 'full', visible: true };
          updated.kpis = { ...updated.kpis, order: 2, width: 'full', visible: true };
          updated.schedule = { ...updated.schedule, order: 3, width: 'two-thirds', visible: true };
          updated.exams = { ...updated.exams, order: 4, width: 'one-third', visible: true };
          updated.operations = { ...updated.operations, order: 5, width: 'half', visible: true };
          updated.facilities = { ...updated.facilities, order: 6, width: 'half', visible: true };
          updated.vitals = { ...updated.vitals, order: 7, width: 'full', visible: true };
          break;

        case 'operations-first':
          // Timetable & Operations prioritized
          updated.schedule = { ...updated.schedule, order: 0, width: 'two-thirds', visible: true };
          updated.exams = { ...updated.exams, order: 1, width: 'one-third', visible: true };
          updated.quick_access = { ...updated.quick_access, order: 2, width: 'half', visible: true };
          updated.operations = { ...updated.operations, order: 3, width: 'half', visible: true };
          updated.kpis = { ...updated.kpis, order: 4, width: 'full', visible: true };
          updated.analytics = { ...updated.analytics, order: 5, width: 'full', visible: true };
          updated.facilities = { ...updated.facilities, order: 6, width: 'half', visible: true };
          updated.vitals = { ...updated.vitals, order: 7, width: 'full', visible: true };
          break;

        case 'compact':
          // Only Quick Access, Graphs & KPIs visible
          updated.quick_access = { ...updated.quick_access, order: 0, width: 'half', visible: true };
          updated.analytics = { ...updated.analytics, order: 1, width: 'half', visible: true };
          updated.kpis = { ...updated.kpis, order: 2, width: 'full', visible: true };
          updated.schedule = { ...updated.schedule, order: 3, visible: false };
          updated.exams = { ...updated.exams, order: 4, visible: false };
          updated.operations = { ...updated.operations, order: 5, visible: false };
          updated.facilities = { ...updated.facilities, order: 6, visible: false };
          updated.vitals = { ...updated.vitals, order: 7, visible: false };
          break;
      }
      saveToStorage(updated, tileConfigs, placement);
      return updated;
    });
  };

  const setPlacement = (newPlacement: QuickAccessPlacement) => {
    setPlacementState(newPlacement);
    saveToStorage(blockConfigs, tileConfigs, newPlacement);
  };

  const setTileFormat = (id: QuickAccessModuleId, format: QuickAccessTileFormat) => {
    setTileConfigs((prev) => {
      const updated = {
        ...prev,
        [id]: {
          ...prev[id],
          format,
        },
      };
      saveToStorage(blockConfigs, updated, placement);
      return updated;
    });
  };

  const toggleTileVisibility = (id: QuickAccessModuleId) => {
    setTileConfigs((prev) => {
      const updated = {
        ...prev,
        [id]: {
          ...prev[id],
          visible: !prev[id].visible,
        },
      };
      saveToStorage(blockConfigs, updated, placement);
      return updated;
    });
  };

  const orderedTileIds = (Object.values(tileConfigs) as QuickAccessTileConfig[])
    .sort((a, b) => a.order - b.order)
    .map((t) => t.id);

  const moveTile = (id: QuickAccessModuleId, direction: 'up' | 'down') => {
    const currentIndex = orderedTileIds.indexOf(id);
    if (currentIndex === -1) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= orderedTileIds.length) return;

    const newOrder = [...orderedTileIds];
    const [removed] = newOrder.splice(currentIndex, 1);
    newOrder.splice(targetIndex, 0, removed);

    reorderTiles(newOrder);
  };

  const reorderTiles = (newOrder: QuickAccessModuleId[]) => {
    setTileConfigs((prev) => {
      const updated = { ...prev };
      newOrder.forEach((id, index) => {
        if (updated[id]) {
          updated[id] = { ...updated[id], order: index };
        }
      });
      saveToStorage(blockConfigs, updated, placement);
      return updated;
    });
  };

  const applyPreset = (preset: LayoutPresetId) => {
    setTileConfigs((prev) => {
      const updated = { ...prev };
      switch (preset) {
        case 'default-hybrid':
          ALL_QUICK_ACCESS_MODULE_IDS.forEach((id, idx) => {
            const format: QuickAccessTileFormat = idx < 4 ? 'square' : 'bar';
            updated[id] = { ...updated[id], format, visible: true, order: idx };
          });
          break;
        case 'all-bars':
          ALL_QUICK_ACCESS_MODULE_IDS.forEach((id, idx) => {
            updated[id] = { ...updated[id], format: 'bar', visible: true, order: idx };
          });
          break;
        case 'all-squares':
          ALL_QUICK_ACCESS_MODULE_IDS.forEach((id, idx) => {
            updated[id] = { ...updated[id], format: 'square', visible: true, order: idx };
          });
          break;
        case 'compact-circles':
          ALL_QUICK_ACCESS_MODULE_IDS.forEach((id, idx) => {
            const format: QuickAccessTileFormat = idx < 4 ? 'circle' : 'bar';
            updated[id] = { ...updated[id], format, visible: true, order: idx };
          });
          break;
      }
      saveToStorage(blockConfigs, updated, placement);
      return updated;
    });
  };

  const resetLayout = () => {
    setPlacementState('top-right');
    setTileConfigs(DEFAULT_TILE_CONFIGS);
    setBlockConfigs(DEFAULT_BLOCK_CONFIGS);
    saveToStorage(DEFAULT_BLOCK_CONFIGS, DEFAULT_TILE_CONFIGS, 'top-right');
  };

  const toggleEditMode = () => setIsEditMode((prev) => !prev);

  const bigSquaresCount = (Object.values(tileConfigs) as QuickAccessTileConfig[]).filter(
    (t) => t.visible && t.format === 'square'
  ).length;
  const smallBarsCount = (Object.values(tileConfigs) as QuickAccessTileConfig[]).filter(
    (t) => t.visible && t.format === 'bar'
  ).length;
  const smallCirclesCount = (Object.values(tileConfigs) as QuickAccessTileConfig[]).filter(
    (t) => t.visible && t.format === 'circle'
  ).length;

  return (
    <DashboardLayoutContext.Provider
      value={{
        isEditMode,
        setIsEditMode,
        toggleEditMode,
        blockConfigs,
        orderedBlockIds,
        moveBlock,
        reorderBlocks,
        toggleBlockVisibility,
        setBlockWidth,
        resetDashboardBlocks,
        applyDashboardPreset,
        placement,
        setPlacement,
        tileConfigs,
        orderedTileIds,
        setTileFormat,
        toggleTileVisibility,
        moveTile,
        reorderTiles,
        applyPreset,
        resetLayout,
        bigSquaresCount,
        smallBarsCount,
        smallCirclesCount,
      }}
    >
      {children}
    </DashboardLayoutContext.Provider>
  );
};

export const useDashboardLayout = (): DashboardLayoutContextType => {
  const context = useContext(DashboardLayoutContext);
  if (!context) {
    throw new Error('useDashboardLayout must be used within a DashboardLayoutProvider');
  }
  return context;
};
