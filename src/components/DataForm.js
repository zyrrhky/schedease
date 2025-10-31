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

export default function DataForm({ open = false, initial = null, onClose = () => {}, onSave = () => {} }) {
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
  }

  function handleSave() {
    const out = {
      ...form,
      credited_units: form.credited_units === "" ? null : Number(form.credited_units),
      total_slots: form.total_slots === "" ? null : Number(form.total_slots),
      enrolled: form.enrolled === "" ? null : Number(form.enrolled),
      assessed: form.assessed === "" ? null : Number(form.assessed)
    };
    onSave(out);
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{form.data_id ? "Edit Subject" : "Add Subject"}</DialogTitle>
      <DialogContent dividers>
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
            <TextField label="Subject Title" value={form.subject_title} fullWidth onChange={(e) => change("subject_title", e.target.value)} />
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

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
