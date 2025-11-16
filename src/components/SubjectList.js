import React, { useMemo, useState, useEffect } from "react";
import {
  Paper,
  List,
  ListItem,
  Box,
  Typography,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Button,
  Divider,
  Avatar,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import SchoolIcon from "@mui/icons-material/School";
import ScheduleIcon from "@mui/icons-material/Schedule";
import RoomIcon from "@mui/icons-material/MeetingRoom";

export default function SubjectList({
  dataList = [],
  onEdit,
  onDelete,
  onAdd, // optional callback when toggling add state (item, isAdded)
  onClear,
  addedIds = [], // optional initial list of added ids
}) {
  const items = useMemo(() => dataList || [], [dataList]);

  // manage which subjects are "added" locally (toggleable)
  const [addedSet, setAddedSet] = useState(() => {
    return new Set((addedIds || []).map((id) => String(id)));
  });

  // Sync local state with addedIds prop when it changes (for external updates like X button removal)
  // Also filter to only include valid item IDs
  useEffect(() => {
    const validIds = new Set(items.map((it) => String(it.data_id ?? `${it.subject_code}-${it.section || ""}`)));
    const propIds = new Set((addedIds || []).map((id) => String(id)));
    // Only keep IDs that are both in propIds and validIds
    const syncedIds = new Set([...propIds].filter((id) => validIds.has(id)));
    setAddedSet(syncedIds);
  }, [addedIds, items]);

  const toggleAdded = (it) => {
    const id = String(it.data_id ?? `${it.subject_code}-${it.section || ""}`);
    const wasAdded = addedSet.has(id);
    const willBeAdded = !wasAdded;
    
    // Notify parent first if provided - parent can reject the action
    try {
      onAdd?.(it, willBeAdded);
    } catch (e) {
      // ignore callback errors
      // eslint-disable-next-line no-console
      console.error(e);
    }
    
    // Note: The actual state update will happen via the useEffect
    // that syncs with addedIds prop from parent
  };

  // small helper to infer modality for display
  const detectModality = (it) => {
    const fields = [
      it.modality,
      it.mode,
      it.type,
      it.classType,
      it.notes,
      it.rawModality,
      it.room,
      it.raw_room,
      it.schedule,
      it.subject_title,
      it.subject_code,
      it.offering_dept,
      it.section,
    ].filter(Boolean);

    for (const f of fields) {
      const txt = String(f).toLowerCase();
      if (!txt) continue;
      if (txt.includes("/")) {
        const parts = txt.split("/").map((p) => p.trim().toLowerCase());
        const aOnline = parts[0] === "online";
        const bOnline = parts[1] === "online";
        if (aOnline && bOnline) return "online";
        if (aOnline || bOnline) return "hybrid";
        return "f2f";
      }
      if (txt.includes("online")) return "online";
      if (txt.includes("hybrid")) return "hybrid";
      if (txt.includes("lec") || txt.includes("lab") || txt.includes("caseroom") || txt.includes("room")) {
        return "f2f";
      }
    }
    // fallback: unknown
    return "unknown";
  };

  const deleteDisabled = items.length === 0;

  // mapping for chip color and styles
  const modalityChipProps = (mod) => {
    switch (mod) {
      case "online":
        return { color: "info", label: "ONLINE" };
      case "hybrid":
        return { color: "warning", label: "HYBRID" };
      case "f2f":
        return { color: "success", label: "F2F" };
      default:
        return { color: "default", label: "N/A" };
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 0,
        display: "flex",
        flexDirection: "column",
        gap: 0,
        bgcolor: "transparent",
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, bgcolor: "#f5f5f5" }}>
        <Box display="flex" alignItems="center">
          <Avatar sx={{ bgcolor: "#f4c522", mr: 2 }}>
            <SchoolIcon />
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: "#9e0807" }}>
            Subjects
          </Typography>
        </Box>

        <Button
          variant="outlined"
          color="error"
          size="small"
          startIcon={<ClearIcon />}
          onClick={() => onClear?.()}
          disabled={deleteDisabled}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          Clear List
        </Button>
      </Box>
      <Divider />

      <List disablePadding sx={{ width: "100%" }}>
        {items.length === 0 && (
          <ListItem sx={{ px: 0, py: 0 }}>
            <Box sx={{ width: "100%", p: 3, borderRadius: 0, bgcolor: "#ffffff", textAlign: "center" }}>
              <Typography variant="body1" sx={{ color: "#666" }}>
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

          const idKey = String(data_id ?? `${subject_code}-${section || ""}`);
          const isAdded = addedSet.has(idKey);
          const modality = detectModality(it); // "online"|"hybrid"|"f2f"|"unknown"
          const chip = modalityChipProps(modality);

          // icon color matches Add button: red when not added, gray when added
          const iconColor = isAdded ? "#9e9e9e" : "#9e0807";
          const iconSize = 20; // slightly larger

          return (
            <React.Fragment key={idKey}>
              <ListItem alignItems="flex-start" sx={{ px: 0, py: 0 }}>
                <Paper elevation={1} sx={{ width: "100%", mb: 2, borderRadius: 2, bgcolor: "#ffffff", border: "1px solid #e0e0e0" }}>
                  <Box display="flex" alignItems="center" p={2}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "#333" }}>
                        <span>{subject_code || "—"}</span>
                        {section && (
                          <Chip
                            size="small"
                            label={section}
                            sx={{
                              ml: 1,
                              bgcolor: "#f2f2f2",
                              color: "#1976d2", // distinct color for section
                              fontWeight: 700,
                              height: 24,
                              borderRadius: "12px",
                            }}
                          />
                        )}
                      </Typography>

                      {/* class type / modality chip */}
                      <Box sx={{ mt: 1 }}>
                        <Chip size="small" label={chip.label} color={chip.color} sx={{ fontWeight: 700 }} />
                        {is_closed === true && (
                          <Chip size="small" label="CLOSED" color="error" sx={{ ml: 1, fontWeight: 700 }} />
                        )}
                      </Box>
                    </Box>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  <Box sx={{ px: 2, pb: 2 }}>
                    <Box mb={2}>
                      <Typography variant="body1" sx={{ color: "#9e0807", fontWeight: 600 }}>
                        {subject_title || "—"}{" "}
                        {offering_dept && <span style={{ fontWeight: 400 }}>• {offering_dept}</span>}
                      </Typography>
                    </Box>

                    {schedule && (
                      <Box mb={2}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <ScheduleIcon sx={{ mr: 1, color: "#f4c522" }} />
                          <Typography variant="body2" sx={{ fontWeight: 700, color: "#555" }}>
                            Schedule
                          </Typography>
                        </Box>
                        {/* whole schedule content bold */}
                        <Typography variant="body2" sx={{ color: "#333", fontSize: "0.85rem", fontWeight: 700 }}>
                          {schedule}
                        </Typography>
                      </Box>
                    )}

                    {(room || usageText || (typeof assessed === "number")) && (
                      <Box mb={2}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <RoomIcon sx={{ mr: 1, color: "#f4c522" }} />
                          <Typography variant="body2" sx={{ fontWeight: 700, color: "#555" }}>
                            Details
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
                          {room && (
                            <Typography variant="body2" sx={{ color: "#333", fontSize: "0.85rem" }}>
                              <strong>Room:</strong> <span style={{ fontWeight: 400 }}>{room}</span>
                            </Typography>
                          )}
                          {usageText && (
                            <Typography variant="body2" sx={{ color: "#333", fontSize: "0.85rem" }}>
                              <strong>Enrolled:</strong> <span style={{ fontWeight: 400 }}>{usageText}</span>
                            </Typography>                          )}
                          {typeof assessed === "number" && (
                            <Typography variant="body2" sx={{ color: "#333", fontSize: "0.85rem" }}>
                              <strong>Assessed:</strong> <span style={{ fontWeight: 400 }}>{assessed}</span>
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                    )}

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                        {/* icons in small gray boxes stacked */}
                        <Box>
                          <Box sx={{ display: "flex", gap: 0.5, flexDirection: "row", alignItems: "center" }}>
                            <Box sx={{ bgcolor: "#f5f5f5", borderRadius: 1, p: 0.25 }}>
                              <Tooltip title="Edit">
                                <IconButton
                                  onClick={() => onEdit?.(it)}
                                  size="small"
                                  sx={{ color: iconColor, width: 38, height: 38 }}
                                >
                                  <EditIcon sx={{ fontSize: iconSize }} />
                                </IconButton>
                              </Tooltip>
                            </Box>

                            <Box sx={{ bgcolor: "#f5f5f5", borderRadius: 1, p: 0.25, mt: 0.5 }}>
                              <Tooltip title="Delete">
                                <IconButton
                                  onClick={() => onDelete?.(data_id)}
                                  size="small"
                                  sx={{ color: iconColor, width: 38, height: 38 }}
                                >
                                  <DeleteIcon sx={{ fontSize: iconSize }} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        </Box>

                        
                      </Box>
                      {/* Add / Added button placed beside icons (visually below due to column layout) */}
                        <Box sx={{ display: "flex", flexDirection: "row", alignItems: "flex-end", ml: 1 }}>
                          <Button
                            size="small"
                            startIcon={isAdded ? null : <AddIcon sx={{ fontSize: 18 }} />}
                            onClick={() => toggleAdded(it)}
                            disabled={is_closed === true}
                            sx={{
                              textTransform: "none",
                              fontWeight: 700,
                              minWidth: 84,
                              borderRadius: 2,
                              fontFamily: "'Poppins', sans-serif",
                              ...(isAdded 
                                ? { 
                                    backgroundColor: "#9e9e9e", 
                                    color: "#fff",
                                    "&:hover": { backgroundColor: "#757575" }
                                  }
                                : {
                                    backgroundColor: "#9e0807",
                                    color: "#ffffff",
                                    "&:hover": { 
                                      backgroundColor: "#7a0606",
                                      boxShadow: "0 2px 8px rgba(244, 197, 34, 0.3)"
                                    }
                                  }
                              ),
                            }}
                            variant="contained"
                          >
                            {isAdded ? "Added" : "Add"}
                          </Button>
                        </Box>
                    </Box>
                  </Box>
                </Paper>
              </ListItem>

              <Box sx={{ height: 8 }} />
            </React.Fragment>
          );
        })}
      </List>
    </Paper>
  );
}


/* WORKING
import React, { useMemo } from "react";
import {
  Paper,
  List,
  ListItem,
  Box,
  Typography,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function SubjectList({ dataList = [], onEdit, onDelete, onGenerate, onClear }) {
  const items = useMemo(() => dataList || [], [dataList]);
  // ADDED: disable Generate button when no items
  const generateDisabled = items.length === 0;

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
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1.5 }}>
        

        <Box sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
          <Button
            variant="contained"
            color="success"
            size="small"
            onClick={() => onGenerate?.()}
            disabled={generateDisabled}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Generate Schedule
          </Button>

          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => onClear?.()}
            disabled={generateDisabled}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Delete List
          </Button>
        </Box>
      </Box>

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
            <React.Fragment key={data_id ?? `${subject_code}-${section || ""}`}>
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
}*/

/*import React, { useMemo } from "react";
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
*/