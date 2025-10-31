import { useState, useCallback } from "react";
import { nextId } from "../utils/ids";

export default function useSubjects(initial = []) {
  const [subjects, setSubjects] = useState(initial);

  const addMany = useCallback((parsedArray = []) => {
    setSubjects((prev) => {
      const existing = new Set(prev.map((d) => String(d.data_id)));
      const mapped = parsedArray.map((p) => {
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

  const save = useCallback((item) => {
    if (!item) return;
    if (!item.data_id) item.data_id = nextId("data");
    setSubjects((prev) => {
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
  }, []);

  const remove = useCallback((id) => {
    setSubjects((prev) => prev.filter((p) => String(p.data_id) !== String(id)));
  }, []);

  return { subjects, addMany, save, remove, setSubjects };
}
