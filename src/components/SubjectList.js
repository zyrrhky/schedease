import React, { useMemo } from "react";
import {
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  Typography,
  Divider,
  Box,
  Grid,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function SubjectList({ dataList = [], onEdit, onDelete }) {
  const items = useMemo(() => dataList || [], [dataList]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 0,
        
        display: "flex",
        flexDirection: "column",
        gap: 0,
        bgcolor: "transparent",
      }}
    >
      <List disablePadding sx={{ width: "100%" }}>
        {items.length === 0 && (
          <ListItem sx={{ px: 0, py: 0 }}>
            <Box
              sx={{
                width: "100%",
                p: 1.5,
                borderRadius: 2,
                bgcolor: "#ffffff",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              <Typography variant="body1" sx={{ color: "#333" }}>
                No subjects yet — import or add one.
              </Typography>
            </Box>
          </ListItem>
        )}

        {items.map((it) => {
          const {
            data_id,
            subject_code,
            subject_title,
            offering_dept,
            section,
            schedule,
            room,
            total_slots,
            enrolled,
            assessed,
            is_closed,
          } = it;

          const usageText =
            typeof total_slots === "number" || typeof enrolled === "number"
              ? `${enrolled ?? 0} / ${total_slots ?? "?"}`
              : null;

          return (
            <React.Fragment key={data_id}>
              <ListItem
                alignItems="flex-start"
                sx={{
                  px: 0,
                  py: 1,
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "#ffffff",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    display: "flex",
                    gap: 2,
                    alignItems: "flex-start",
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {subject_code || "—"}
                      </Typography>

                      {section && (
                        <Chip
                          size="small"
                          label={section}
                          sx={{
                            bgcolor: "#f2f2f2",
                            fontWeight: 600,
                            borderRadius: "12px",
                            height: 24,
                          }}
                        />
                      )}

                      {is_closed === true && (
                        <Chip
                          size="small"
                          label="CLOSED"
                          color="error"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>

                    <Typography
                      variant="body2"
                      sx={{ color: "#9e0807", fontWeight: 600, mt: 0.25 }}
                    >
                      {subject_title || "—"}{" "}
                      {offering_dept && (
                        <span style={{ color: "#6b0b09" }}>• {offering_dept}</span>
                      )}
                    </Typography>

                    {schedule && (
                      <Typography
                        variant="body2"
                        sx={{
                          mt: 0.5,
                          color: "#333",
                          fontSize: "0.85rem",
                        }}
                      >
                        <strong>Schedule:</strong> {schedule}
                      </Typography>
                    )}

                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                      sx={{ mt: 0.75, flexWrap: "wrap" }}
                    >
                      {room && (
                        <Typography variant="caption">
                          <strong>Room:</strong> {room}
                        </Typography>
                      )}
                      {usageText && (
                        <Typography variant="caption">
                          <strong>Enrolled:</strong> {usageText}
                        </Typography>
                      )}
                      {typeof assessed === "number" && (
                        <Typography variant="caption">
                          <strong>Assessed:</strong> {assessed}
                        </Typography>
                      )}
                    </Stack>
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Edit">
                        <IconButton edge="end" onClick={() => onEdit?.(it)} size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton edge="end" onClick={() => onDelete?.(data_id)} size="small">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>
                </Box>
              </ListItem>

              <Box sx={{ height: 8 }} />
            </React.Fragment>
          );
        })}
      </List>
    </Paper>
  );
}
