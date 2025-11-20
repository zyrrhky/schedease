import { useState, useCallback, useEffect } from "react";
import { nextId } from "../utils/ids";
import { userKey } from "../utils/storage";

const SCHEDULES_STORAGE_BASE = "schedease_schedules";

// Load schedules from localStorage for current user
function loadSchedulesFromStorage() {
  try {
    const key = userKey(SCHEDULES_STORAGE_BASE);
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch (error) {
    console.error("Failed to load schedules from localStorage:", error);
  }
  return [];
}

// Save schedules to localStorage for current user
function saveSchedulesToStorage(schedules) {
  try {
    const key = userKey(SCHEDULES_STORAGE_BASE);
    localStorage.setItem(key, JSON.stringify(schedules));
  } catch (error) {
    console.error("Failed to save schedules to localStorage:", error);
  }
}

export default function useSchedules(initial = []) {
  const [schedules, setSchedules] = useState(() => {
    // Initialize from localStorage on first render
    const stored = loadSchedulesFromStorage();
    return stored.length > 0 ? stored : initial;
  });

  // Persist schedules to localStorage whenever they change
  useEffect(() => {
    saveSchedulesToStorage(schedules);
  }, [schedules]);

  const saveSchedule = useCallback((newSchedule) => {
    if (!newSchedule) return;
    if (!newSchedule.schedule_id) newSchedule.schedule_id = nextId("schedule");
    setSchedules((prev) => {
      const exists = prev.find((s) => s.schedule_id === newSchedule.schedule_id);
      if (exists) return prev.map((s) => (s.schedule_id === newSchedule.schedule_id ? newSchedule : s));
      return [newSchedule, ...prev];
    });
  }, []);

  const deleteSchedule = useCallback((id) => {
    setSchedules((prev) => prev.filter((s) => s.schedule_id !== id));
  }, []);

  const removeSubjectFromSchedules = useCallback((subjectId) => {
    setSchedules((prev) =>
      prev.map((s) => ({ ...s, subjects: (s.subjects || []).filter((x) => x !== subjectId) }))
    );
  }, []);

  return { schedules, saveSchedule, deleteSchedule, removeSubjectFromSchedules, setSchedules };
}
