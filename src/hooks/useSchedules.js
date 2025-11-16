import { useState, useCallback, useEffect } from "react";
import { nextId } from "../utils/ids";

const SCHEDULES_STORAGE_KEY = "schedease_schedules";

// Load schedules from localStorage
function loadSchedulesFromStorage() {
  try {
    const stored = localStorage.getItem(SCHEDULES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load schedules from localStorage:", error);
  }
  return [];
}

// Save schedules to localStorage
function saveSchedulesToStorage(schedules) {
  try {
    localStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(schedules));
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
