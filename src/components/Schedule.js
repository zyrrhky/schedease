import React, { useMemo } from "react";
import { Paper, Box, Typography, List, ListItem, ListItemText, Divider } from "@mui/material";

export default function Schedule({ dataList = [], schedules = [], onSaveSchedule, onDeleteSchedule }) {
  const lookup = useMemo(() => {
    const m = new Map();
    (dataList || []).forEach((d) => m.set(d.data_id, d));
    return m;
  }, [dataList]);

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2, backgroundColor: "#ffffff" }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Schedule</Typography>
        <Typography variant="body2" sx={{ color: "#666" }}>Create or edit schedules on the left. This panel shows created schedules.</Typography>
      </Paper>

      <Paper sx={{ p: 2, backgroundColor: "#ffffff" }}>
        <List>
          {schedules.length === 0 && <ListItem><ListItemText primary="No schedules yet" /></ListItem>}
          {schedules.map((sch) => {
            const subjects = (sch.subjects || []).map((id) => lookup.get(id)).filter(Boolean);
            return (
              <React.Fragment key={sch.schedule_id}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={`${sch.schedule_name || "Untitled"} — ${ (sch.view_days || []).join(", ") } ${sch.start ? `${sch.start}-${sch.end}` : ""}`}
                    secondary={subjects.map(s => s ? `${s.subject_code} ${s.section ? "• " + s.section : ""}` : "").join(", ")}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            );
          })}
        </List>
      </Paper>
    </Box>
  );
}
