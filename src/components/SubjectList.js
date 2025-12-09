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
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";

export default function SubjectList({
  dataList = [],
  onEdit,
  onDelete,
  onAdd, // optional callback when toggling add state (item, isAdded)
  onClear,
  addedIds = [], // optional initial list of added ids
  onNavigateToImport, // New prop for navigation to Import Data
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

  const handleImportNow = () => {
    if (onNavigateToImport) {
      // Direct navigation without any notification
      onNavigateToImport();
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
        height: "100%", // Added to take full height
      }}
    >
      {/* Header with background color */}
      <Box sx={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        p: 2, 
        bgcolor: "#f5f5f5",
        flexShrink: 0, // Prevent header from shrinking
      }}>
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
      
      {/* Background container with same color as header */}
      <Box sx={{
        flex: 1,
        backgroundColor: "#f5f5f5", // Same color as header
        overflowY: "auto", // Make content scrollable
        p: 2,
        "&::-webkit-scrollbar": {
          width: "8px",
        },
        "&::-webkit-scrollbar-track": {
          background: "#e0e0e0",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "#9e0807",
          borderRadius: "4px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          background: "#7a0506",
        },
      }}>
        <List disablePadding sx={{ width: "100%" }}>
          {items.length === 0 && (
            <ListItem sx={{ px: 0, py: 0 }}>
              <Box sx={{ 
                width: "100%", 
                p: 3, 
                borderRadius: 2, 
                bgcolor: "#ffffff", 
                textAlign: "center",
                border: "1px solid #e0e0e0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}>
                <Typography variant="body1" sx={{ color: "#666", fontSize: "1.05rem" }}>
                  No subjects yet — import or add one.
                </Typography>
                
                {/* Import Subjects Now Button */}
                <Button
                  variant="contained"
                  onClick={handleImportNow}
                  startIcon={<SystemUpdateAltIcon />}
                  sx={{
                    bgcolor: "#9e0807",
                    color: "#ffffff",
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "1rem",
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    mt: 1,
                    "&:hover": {
                      bgcolor: "#7a0506",
                      boxShadow: "0 4px 12px rgba(158, 8, 7, 0.3)",
                    },
                  }}
                >
                  Import Subjects Now
                </Button>
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
                <ListItem alignItems="flex-start" sx={{ px: 0, py: 0, mb: 2 }}>
                  <Paper elevation={2} sx={{ 
                    width: "100%", 
                    borderRadius: 3, 
                    bgcolor: "#ffffff", 
                    border: "1px solid #e0e0e0",
                    overflow: "hidden",
                  }}>
                    <Box display="flex" alignItems="center" p={3}>
                      <Box sx={{ flex: 1 }}>
                        {/* Increased font sizes */}
                        <Typography variant="h5" sx={{ 
                          fontWeight: 700, 
                          color: "#333",
                          fontSize: { xs: "1.3rem", md: "1.5rem" },
                          mb: 0.5,
                        }}>
                          <span>{subject_code || "—"}</span>
                          {section && (
                            <Chip
                              size="medium"
                              label={section}
                              sx={{
                                ml: 1.5,
                                bgcolor: "#f2f2f2",
                                color: "#1976d2", // distinct color for section
                                fontWeight: 700,
                                height: 28,
                                borderRadius: "14px",
                                fontSize: "0.95rem",
                              }}
                            />
                          )}
                        </Typography>

                        {/* class type / modality chip */}
                        <Box sx={{ mt: 1.5 }}>
                          <Chip 
                            size="medium" 
                            label={chip.label} 
                            color={chip.color} 
                            sx={{ 
                              fontWeight: 700,
                              fontSize: "0.85rem",
                              height: 28,
                            }} 
                          />
                          {is_closed === true && (
                            <Chip 
                              size="medium" 
                              label="CLOSED" 
                              color="error" 
                              sx={{ 
                                ml: 1.5, 
                                fontWeight: 700,
                                fontSize: "0.85rem",
                                height: 28,
                              }} 
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Box sx={{ px: 3, pb: 3 }}>
                      <Box mb={2.5}>
                        {/* Increased font size */}
                        <Typography variant="h6" sx={{ 
                          color: "#9e0807", 
                          fontWeight: 600,
                          fontSize: { xs: "1.1rem", md: "1.2rem" },
                        }}>
                          {subject_title || "—"}{" "}
                          {offering_dept && (
                            <span style={{ 
                              fontWeight: 400,
                              fontSize: "1rem",
                            }}>
                              • {offering_dept}
                            </span>
                          )}
                        </Typography>
                      </Box>

                      {schedule && (
                        <Box mb={2.5}>
                          <Box display="flex" alignItems="center" mb={1.5}>
                            <ScheduleIcon sx={{ mr: 1.5, color: "#f4c522", fontSize: "1.4rem" }} />
                            <Typography variant="body1" sx={{ 
                              fontWeight: 700, 
                              color: "#555",
                              fontSize: "1.1rem",
                            }}>
                              Schedule
                            </Typography>
                          </Box>
                          {/* Increased font size */}
                          <Typography variant="body1" sx={{ 
                            color: "#333", 
                            fontSize: "1rem", 
                            fontWeight: 700,
                            lineHeight: 1.5,
                          }}>
                            {schedule}
                          </Typography>
                        </Box>
                      )}

                      {(room || usageText || (typeof assessed === "number")) && (
                        <Box mb={3}>
                          <Box display="flex" alignItems="center" mb={1.5}>
                            <RoomIcon sx={{ mr: 1.5, color: "#f4c522", fontSize: "1.4rem" }} />
                            <Typography variant="body1" sx={{ 
                              fontWeight: 700, 
                              color: "#555",
                              fontSize: "1.1rem",
                            }}>
                              Details
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={3} sx={{ flexWrap: "wrap" }}>
                            {room && (
                              <Typography variant="body1" sx={{ 
                                color: "#333", 
                                fontSize: "1rem",
                              }}>
                                <strong style={{ fontSize: "1.05rem" }}>Room:</strong>{" "}
                                <span style={{ fontWeight: 400 }}>{room}</span>
                              </Typography>
                            )}
                            {usageText && (
                              <Typography variant="body1" sx={{ 
                                color: "#333", 
                                fontSize: "1rem",
                              }}>
                                <strong style={{ fontSize: "1.05rem" }}>Enrolled:</strong>{" "}
                                <span style={{ fontWeight: 400 }}>{usageText}</span>
                              </Typography>
                            )}
                            {typeof assessed === "number" && (
                              <Typography variant="body1" sx={{ 
                                color: "#333", 
                                fontSize: "1rem",
                              }}>
                                <strong style={{ fontSize: "1.05rem" }}>Assessed:</strong>{" "}
                                <span style={{ fontWeight: 400 }}>{assessed}</span>
                              </Typography>
                            )}
                          </Stack>
                        </Box>
                      )}

                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                          {/* icons in small gray boxes stacked */}
                          <Box>
                            <Box sx={{ display: "flex", gap: 1, flexDirection: "row", alignItems: "center" }}>
                              <Box sx={{ bgcolor: "#f5f5f5", borderRadius: 1.5, p: 0.5 }}>
                                <Tooltip title="Edit">
                                  <IconButton
                                    onClick={() => onEdit?.(it)}
                                    size="medium"
                                    sx={{ color: iconColor, width: 44, height: 44 }}
                                  >
                                    <EditIcon sx={{ fontSize: 22 }} />
                                  </IconButton>
                                </Tooltip>
                              </Box>

                              <Box sx={{ bgcolor: "#f5f5f5", borderRadius: 1.5, p: 0.5 }}>
                                <Tooltip title="Delete">
                                  <IconButton
                                    onClick={() => onDelete?.(data_id)}
                                    size="medium"
                                    sx={{ color: iconColor, width: 44, height: 44 }}
                                  >
                                    <DeleteIcon sx={{ fontSize: 22 }} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                        {/* Add / Added button placed beside icons (visually below due to column layout) */}
                        <Box sx={{ display: "flex", flexDirection: "row", alignItems: "flex-end", ml: 1.5 }}>
                          <Button
                            size="medium"
                            startIcon={isAdded ? null : <AddIcon sx={{ fontSize: 20 }} />}
                            onClick={() => toggleAdded(it)}
                            disabled={is_closed === true}
                            sx={{
                              textTransform: "none",
                              fontWeight: 700,
                              minWidth: 96,
                              borderRadius: 2.5,
                              fontFamily: "'Poppins', sans-serif",
                              fontSize: "0.95rem",
                              padding: "8px 16px",
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
              </React.Fragment>
            );
          })}
        </List>
      </Box>
    </Paper>
  );
}