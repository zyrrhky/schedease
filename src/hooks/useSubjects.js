import { useState, useCallback, useEffect } from "react";
import { nextId } from "../utils/ids";

const SUBJECTS_STORAGE_KEY = "schedease_subjects";

// Load subjects from localStorage
function loadSubjectsFromStorage() {
  try {
    const stored = localStorage.getItem(SUBJECTS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load subjects from localStorage:", error);
  }
  return [];
}

// Save subjects to localStorage
function saveSubjectsToStorage(subjects) {
  try {
    localStorage.setItem(SUBJECTS_STORAGE_KEY, JSON.stringify(subjects));
  } catch (error) {
    console.error("Failed to save subjects to localStorage:", error);
  }
}

export default function useSubjects(initial = []) {
  const [subjects, setSubjects] = useState(() => {
    // Initialize from localStorage on first render
    const stored = loadSubjectsFromStorage();
    return stored.length > 0 ? stored : initial;
  });

  // Persist subjects to localStorage whenever they change
  useEffect(() => {
    saveSubjectsToStorage(subjects);
  }, [subjects]);

  const addMany = useCallback((parsedArray = []) => {
    setSubjects((prev) => {
      const existing = new Set(prev.map((d) => String(d.data_id)));
      const existingTitles = new Set(
        prev.map((d) => (d.subject_title || "").trim().toLowerCase()).filter(Boolean)
      );
      
      const mapped = parsedArray
        .filter((p) => {
          // Filter out subjects with duplicate titles
          const title = (p.subject_title || "").trim().toLowerCase();
          if (!title || existingTitles.has(title)) {
            return false;
          }
          existingTitles.add(title);
          return true;
        })
        .map((p) => {
          let id = String(p.data_id || "");
          if (!id || existing.has(id)) {
            do {
              id = nextId("data");
            } while (existing.has(id));
          }
          existing.add(id);
          return { ...p, data_id: id };
        });
      return prev.concat(mapped);
    });
  }, []);

  const save = useCallback((item, skipValidation = false) => {
    if (!item) return { success: false, error: "No item provided" };
    if (!item.data_id) item.data_id = nextId("data");
    
    let result = { success: true };
    
    setSubjects((prev) => {
      // Check for duplicate title (case-insensitive) unless validation is skipped
      if (!skipValidation) {
        const trimmedTitle = (item.subject_title || "").trim().toLowerCase();
        if (trimmedTitle) {
          const isDuplicate = prev.some((p) => {
            const existingTitle = (p.subject_title || "").trim().toLowerCase();
            const isSameId = String(p.data_id) === String(item.data_id);
            return existingTitle === trimmedTitle && !isSameId;
          });
          
          if (isDuplicate) {
            result = { success: false, error: "A subject with this title already exists" };
            return prev; // Don't modify if duplicate found
          }
        }
      }
      
      let found = false;
      const next = prev.map((p) => {
        if (String(p.data_id) === String(item.data_id)) {
          found = true;
          return item;
        }
        return p;
      });
      if (!found) next.unshift(item);
      return next;
    });
    
    return result;
  }, []);

  const remove = useCallback((id) => {
    setSubjects((prev) => prev.filter((p) => String(p.data_id) !== String(id)));
  }, []);

  return { subjects, addMany, save, remove, setSubjects };
}
