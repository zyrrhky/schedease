import { useState, useCallback } from "react";
import { nextId } from "../utils/ids";

export default function useSchedules(initial = []) {
  const [schedules, setSchedules] = useState(initial);

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
