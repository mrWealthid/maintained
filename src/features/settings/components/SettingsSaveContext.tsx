"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type SettingsSaveSection = {
  id: string;
  label: string;
  save: () => Promise<void> | void;
  isDirty: boolean;
  isSaving?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  disabledReason?: string;
};

type SettingsSaveContextValue = {
  registerSection: (section: SettingsSaveSection) => () => void;
  saveAll: () => Promise<void>;
  dirtyCount: number;
  hasDirty: boolean;
  isBusy: boolean;
  isBlocked: boolean;
  blockedReason?: string;
};

const SettingsSaveContext = createContext<SettingsSaveContextValue | null>(null);

export function SettingsSaveProvider({ children }: { children: ReactNode }) {
  const sectionsRef = useRef(new Map<string, SettingsSaveSection>());
  const [version, setVersion] = useState(0);

  const bump = useCallback(() => setVersion((current) => current + 1), []);

  const registerSection = useCallback(
    (section: SettingsSaveSection) => {
      sectionsRef.current.set(section.id, section);
      bump();

      return () => {
        sectionsRef.current.delete(section.id);
        bump();
      };
    },
    [bump],
  );

  const sections = useMemo(
    () => Array.from(sectionsRef.current.values()),
    [version],
  );
  const dirtySections = sections.filter((section) => section.isDirty);
  const blockedSection = dirtySections.find((section) => section.disabled);
  const isBusy = sections.some(
    (section) => section.isSaving || section.isLoading,
  );

  const saveAll = useCallback(async () => {
    const pendingSections = Array.from(sectionsRef.current.values()).filter(
      (section) =>
        section.isDirty &&
        !section.disabled &&
        !section.isSaving &&
        !section.isLoading,
    );

    for (const section of pendingSections) {
      await section.save();
    }
  }, []);

  const value = useMemo(
    () => ({
      registerSection,
      saveAll,
      dirtyCount: dirtySections.length,
      hasDirty: dirtySections.length > 0,
      isBusy,
      isBlocked: Boolean(blockedSection),
      blockedReason: blockedSection?.disabledReason,
    }),
    [blockedSection, dirtySections.length, isBusy, registerSection, saveAll],
  );

  return (
    <SettingsSaveContext.Provider value={value}>
      {children}
    </SettingsSaveContext.Provider>
  );
}

export function useSettingsSave() {
  const context = useContext(SettingsSaveContext);
  if (!context) {
    throw new Error("useSettingsSave must be used inside SettingsSaveProvider");
  }
  return context;
}

export function useSettingsSaveRegistration(section: SettingsSaveSection) {
  const { registerSection } = useSettingsSave();

  useEffect(() => registerSection(section), [registerSection, section]);
}
