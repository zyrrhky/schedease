import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControlLabel,
  Switch
} from "@mui/material";

export default function DataForm({ open = false, initial = null, onClose = () => {}, onSave = () => {}, existingSubjects = [] }) {
  const [form, setForm] = useState({
    data_id: null,
    number: "",
    offering_dept: "",
    subject_code: "",
    subject_title: "",
    credited_units: "",
    section: "",
    schedule: "",
    room: "",
    total_slots: "",
    enrolled: "",
    assessed: "",
    is_closed: false
  });
  const [titleError, setTitleError] = useState("");

  useEffect(() => {
    if (initial) {
      setForm({
        data_id: initial.data_id ?? null,
        number: initial.number ?? "",
        offering_dept: initial.offering_dept ?? "",
        subject_code: initial.subject_code ?? "",
        subject_title: initial.subject_title ?? "",
        credited_units: initial.credited_units ?? "",
        section: initial.section ?? "",
        schedule: initial.schedule ?? "",
        room: initial.room ?? "",
        total_slots: initial.total_slots ?? "",
        enrolled: initial.enrolled ?? "",
        assessed: initial.assessed ?? "",
        is_closed: !!initial.is_closed
      });
    } else {
      setForm((f) => ({ ...f, data_id: null }));
    }
  }, [initial, open]);

  function change(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
    // Clear title error when user modifies the title
    if (k === "subject_title") {
      setTitleError("");
    }
  }

  function handleSave() {
    // Validate that subject_title is not empty
    const trimmedTitle = (form.subject_title || "").trim();
    if (!trimmedTitle) {
      setTitleError("Subject title is required");
      return;
    }
    
    // Check for duplicates (exclude current subject being edited)
    const trimmedTitleLower = trimmedTitle.toLowerCase();
    const isDuplicate = existingSubjects.some((subject) => {
      const existingTitle = (subject.subject_title || "").trim().toLowerCase();
      const isSameId = String(subject.data_id) === String(form.data_id);
      return existingTitle === trimmedTitleLower && !isSameId;
    });
    
    if (isDuplicate) {
      setTitleError("A subject with this title already exists");
      return;
    }

    const out = {
      ...form,
      subject_title: trimmedTitle, // Use trimmed title
      credited_units: form.credited_units === "" ? null : Number(form.credited_units),
      total_slots: form.total_slots === "" ? null : Number(form.total_slots),
      enrolled: form.enrolled === "" ? null : Number(form.enrolled),
      assessed: form.assessed === "" ? null : Number(form.assessed)
    };
    
    const result = onSave(out);
    
    // Check if save was successful (in case hook also validates)
    if (result && !result.success) {
      setTitleError(result.error || "Failed to save subject");
      return;
    }
    
    setTitleError("");
    onClose();
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 4px 16px rgba(158, 8, 7, 0.08)",
          bgcolor: "#fffef7",
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          fontWeight: 700,
          color: "#9e0807",
          fontFamily: "'Poppins', sans-serif",
          borderBottom: "1px solid rgba(244, 197, 34, 0.2)",
        }}
      >
        {form.data_id ? "Edit Subject" : "Add Subject"}
      </DialogTitle>
      <DialogContent dividers sx={{ bgcolor: "#fffef7" }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField label="Offering Dept" value={form.offering_dept} fullWidth onChange={(e) => change("offering_dept", e.target.value)} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Subject Code" value={form.subject_code} fullWidth onChange={(e) => change("subject_code", e.target.value)} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Section" value={form.section} fullWidth onChange={(e) => change("section", e.target.value)} />
          </Grid>

          <Grid item xs={12}>
            <TextField 
              label="Subject Title" 
              value={form.subject_title} 
              fullWidth 
              onChange={(e) => change("subject_title", e.target.value)}
              error={!!titleError}
              helperText={titleError}
              required
            />
          </Grid>

          <Grid item xs={6} md={3}>
            <TextField label="Credited Units" value={form.credited_units} fullWidth onChange={(e) => change("credited_units", e.target.value)} />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField label="Room" value={form.room} fullWidth onChange={(e) => change("room", e.target.value)} />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField label="Total Slots" value={form.total_slots} fullWidth onChange={(e) => change("total_slots", e.target.value)} />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField label="Enrolled" value={form.enrolled} fullWidth onChange={(e) => change("enrolled", e.target.value)} />
          </Grid>

          <Grid item xs={6} md={3}>
            <TextField label="Assessed" value={form.assessed} fullWidth onChange={(e) => change("assessed", e.target.value)} />
          </Grid>
          <Grid item xs={6} md={9}>
            <TextField label="Schedule (human readable)" value={form.schedule} fullWidth onChange={(e) => change("schedule", e.target.value)} />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={<Switch checked={!!form.is_closed} onChange={(e) => change("is_closed", e.target.checked)} />}
              label="Is Closed"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, bgcolor: "#fffef7", borderTop: "1px solid rgba(244, 197, 34, 0.2)" }}>
        <Button 
          onClick={onClose}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            color: "#666",
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSave}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            backgroundColor: "#9e0807",
            "&:hover": { backgroundColor: "#7a0606" },
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
