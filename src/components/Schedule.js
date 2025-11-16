import React, { useMemo, useState, useCallback, useRef, useEffect } from "react";
import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import CloseIcon from "@mui/icons-material/Close";
import { parseScheduleString } from "../utils/parse";

// Helper function to generate time slots from 7:00 AM to 9:00 PM in 30-minute intervals
function generateTimeSlots() {
  const slots = [];
  for (let hour = 7; hour <= 21; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time24 = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      let hour12 = hour;
      let period = "AM";
      if (hour === 0) {
        hour12 = 12;
      } else if (hour === 12) {
        hour12 = 12;
        period = "PM";
      } else if (hour > 12) {
        hour12 = hour - 12;
        period = "PM";
      }
      const time12 = `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
      slots.push({ time24, time12 });
    }
  }
  return slots;
}

// Map day abbreviations to full names and column indices
const DAY_MAP = {
  M: { name: "Monday", index: 0 },
  T: { name: "Tuesday", index: 1 },
  W: { name: "Wednesday", index: 2 },
  TH: { name: "Thursday", index: 3 },
  F: { name: "Friday", index: 4 },
  S: { name: "Saturday", index: 5 },
  SU: { name: "Sunday", index: 6 },
};

// Helper function to parse schedule string and extract all time slots
function parseSubjectSchedule(scheduleString) {
  if (!scheduleString) return [];
  
  // Split by " / " to handle multiple schedule entries
  const scheduleParts = scheduleString.split(" / ").map(s => s.trim()).filter(Boolean);
  const parsedSchedules = [];
  
  for (const part of scheduleParts) {
    const parsed = parseScheduleString(part);
    if (parsed) {
      parsedSchedules.push(parsed);
    } else {
      // Try to parse more flexible formats
      // Example: "MWF 8:00 AM - 9:30 AM" or "M W F 8:00 AM - 9:30 AM"
      const multiDayMatch = part.match(/^([A-Z\s]+)\s+(\d{1,2}:\d{2}\s*[ap]m)\s*-\s*(\d{1,2}:\d{2}\s*[ap]m)\s*(.*)$/i);
      if (multiDayMatch) {
        const [, daysStr, start12, end12, tail] = multiDayMatch;
        const days = daysStr.trim().split(/\s+/).filter(Boolean);
        const room = tail?.trim() || "";
        const start24 = convertTo24h(start12);
        const end24 = convertTo24h(end12);
        
        // Only add if time conversion was successful
        if (start24 && end24) {
          for (const day of days) {
            const normalizedDay = normalizeDay(day);
            if (normalizedDay) {
              parsedSchedules.push({
                day: normalizedDay,
                start: start24,
                end: end24,
                room,
              });
            }
          }
        }
      }
    }
  }
  
  return parsedSchedules;
}

function normalizeDay(d) {
  const x = d.toUpperCase().trim();
  if (x === "TH" || x === "THU" || x === "THURS") return "TH";
  if (x === "SU" || x === "SUN" || x === "SUNDAY") return "SU";
  if (x === "M" || x === "MON" || x === "MONDAY") return "M";
  if (x === "T" || x === "TUE" || x === "TUES" || x === "TUESDAY") return "T";
  if (x === "W" || x === "WED" || x === "WEDNESDAY") return "W";
  if (x === "F" || x === "FRI" || x === "FRIDAY") return "F";
  if (x === "S" || x === "SAT" || x === "SATURDAY") return "S";
  return null;
}

function convertTo24h(t) {
  if (!t) return null;
  const m = String(t).trim().toUpperCase().match(/^(\d{1,2}):(\d{2})\s*([AP])M$/);
  if (!m) {
    // Try to parse if it's already in 24h format
    const m24 = String(t).trim().match(/^(\d{1,2}):(\d{2})$/);
    if (m24) return `${String(parseInt(m24[1], 10)).padStart(2, "0")}:${m24[2]}`;
    return null;
  }
  let [, hh, mm, ap] = m;
  let h = parseInt(hh, 10);
  if (ap === "P" && h !== 12) h += 12;
  if (ap === "A" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${mm}`;
}

// Helper function to check if a time falls within a time range
function isTimeInRange(time24, start24, end24) {
  if (!time24 || !start24 || !end24) return false;
  
  const timeParts = time24.split(":").map(Number);
  const startParts = start24.split(":").map(Number);
  const endParts = end24.split(":").map(Number);
  
  if (timeParts.length !== 2 || startParts.length !== 2 || endParts.length !== 2) {
    return false;
  }
  
  const [timeH, timeM] = timeParts;
  const [startH, startM] = startParts;
  const [endH, endM] = endParts;
  
  if (isNaN(timeH) || isNaN(timeM) || isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) {
    return false;
  }
  
  const timeMinutes = timeH * 60 + timeM;
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  
  return timeMinutes >= startMinutes && timeMinutes < endMinutes;
}

// Helper function to calculate row span for a subject based on duration
function calculateRowSpan(start24, end24) {
  if (!start24 || !end24) return 1;
  
  const startParts = start24.split(":").map(Number);
  const endParts = end24.split(":").map(Number);
  
  if (startParts.length !== 2 || endParts.length !== 2) return 1;
  
  const [startH, startM] = startParts;
  const [endH, endM] = endParts;
  
  if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return 1;
  
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  const durationMinutes = endMinutes - startMinutes;
  
  // Each row is 30 minutes, so calculate how many rows are needed
  // Minimum 1 row
  return Math.max(1, Math.ceil(durationMinutes / 30));
}

export default function Schedule({
  dataList = [],
  schedules = [],
  onSaveSchedule,
  onDeleteSchedule,
  addedSubjectIds = [], // Array of subject IDs that are added to the schedule
  onRemoveSubject, // Callback to remove a subject from the schedule (item, isAdded)
  onHeightChange, // Callback to notify parent of height changes
}) {
  const [scheduleName, setScheduleName] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState(""); // "pdf", "image", or ""
  const scheduleContainerRef = useRef(null);
  const schedulePaperRef = useRef(null); // Ref for the main timetable Paper for export

  // Create lookup map for subjects (supports both data_id and subject_code-section format)
  const lookup = useMemo(() => {
    const m = new Map();
    (dataList || []).forEach((d) => {
      // Store by data_id
      if (d.data_id) {
        m.set(String(d.data_id), d);
      }
      // Also store by subject_code-section format for compatibility
      const altId = `${d.subject_code}-${d.section || ""}`;
      if (altId && altId !== "-") {
        m.set(altId, d);
      }
    });
    return m;
  }, [dataList]);

  // Get added subjects
  const addedSubjects = useMemo(() => {
    return (addedSubjectIds || [])
      .map((id) => {
        const subject = lookup.get(String(id));
        return subject;
      })
      .filter(Boolean);
  }, [addedSubjectIds, lookup]);

  // Generate time slots
  const timeSlots = useMemo(() => generateTimeSlots(), []);

  // Parse schedules for all added subjects and create a grid map
  const scheduleGrid = useMemo(() => {
    const grid = new Map(); // Key: "day-index_time24", Value: subject info
    
    addedSubjects.forEach((subject) => {
      if (!subject.schedule) return;
      
      const parsedSchedules = parseSubjectSchedule(subject.schedule);
      
      parsedSchedules.forEach((parsed) => {
        const dayIndex = DAY_MAP[parsed.day]?.index;
        if (dayIndex === undefined) return;
        
        // Find all time slots that fall within this schedule
        timeSlots.forEach((slot, slotIndex) => {
          if (isTimeInRange(slot.time24, parsed.start, parsed.end)) {
            const key = `${dayIndex}_${slot.time24}`;
            if (!grid.has(key)) {
              grid.set(key, {
                subject,
                parsed,
                startSlot: slotIndex,
                rowSpan: calculateRowSpan(parsed.start, parsed.end),
              });
            }
          }
        });
      });
    });
    
    return grid;
  }, [addedSubjects, timeSlots]);

  // Handle save schedule
  const handleSaveSchedule = useCallback(() => {
    if (!scheduleName.trim()) {
      alert("Please enter a schedule name");
      return;
    }
    
    const scheduleData = {
      schedule_name: scheduleName.trim(),
      subjects: addedSubjectIds,
      created_at: new Date().toISOString(),
    };
    
    if (onSaveSchedule) {
      onSaveSchedule(scheduleData);
    }
    
    setIsSaved(true);
    setLastSavedTime(new Date());
    
    // Reset saved status after 3 seconds
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  }, [scheduleName, addedSubjectIds, onSaveSchedule]);

  // Notify parent of height changes
  useEffect(() => {
    if (scheduleContainerRef.current && onHeightChange) {
      const height = scheduleContainerRef.current.offsetHeight;
      onHeightChange(height);
      
      // Also listen for resize events
      const resizeObserver = new ResizeObserver(() => {
        if (scheduleContainerRef.current) {
          const newHeight = scheduleContainerRef.current.offsetHeight;
          onHeightChange(newHeight);
        }
      });
      
      resizeObserver.observe(scheduleContainerRef.current);
      
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [onHeightChange]);

  // Handle opening export dialog
  const handleOpenExportDialog = useCallback(() => {
    setExportDialogOpen(true);
    setExportFormat(""); // Reset to empty - user must select an option
  }, []);

  // Handle closing export dialog
  const handleCloseExportDialog = useCallback(() => {
    setExportDialogOpen(false);
    setExportFormat("");
  }, []);

  // Handle export as PDF
  const handleExportPDF = useCallback(async () => {
    if (!schedulePaperRef.current) {
      alert("Unable to export: Schedule content not found.");
      return;
    }

    try {
      // Dynamically import jsPDF
      const { default: jsPDF } = await import("jspdf");
      
      // Temporarily hide the "X" buttons for export
      const removeButtons = schedulePaperRef.current.querySelectorAll(".remove-button");
      const originalDisplays = [];
      removeButtons.forEach((btn) => {
        if (btn instanceof HTMLElement) {
          originalDisplays.push(btn.style.display);
          btn.style.display = "none";
        }
      });

      // Use html2canvas to capture the schedule
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(schedulePaperRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      // Restore "X" buttons
      removeButtons.forEach((btn, idx) => {
        if (btn instanceof HTMLElement) {
          btn.style.display = originalDisplays[idx] || "";
        }
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("landscape", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = (pdfHeight - imgHeight * ratio) / 2;

      // Add schedule name at the top
      pdf.setFontSize(16);
      pdf.text(scheduleName || "Untitled Schedule", pdfWidth / 2, 15, { align: "center" });

      pdf.addImage(imgData, "PNG", imgX, imgY + 10, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`${scheduleName || "schedule"}_${new Date().toISOString().split("T")[0]}.pdf`);

      setExportDialogOpen(false);
      setExportFormat("");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Failed to export PDF. Please ensure jsPDF and html2canvas are installed.");
    }
  }, [scheduleName]);

  // Handle export as Image
  const handleExportImage = useCallback(async () => {
    if (!schedulePaperRef.current) {
      alert("Unable to export: Schedule content not found.");
      return;
    }

    try {
      // Temporarily hide the "X" buttons for export
      const removeButtons = schedulePaperRef.current.querySelectorAll(".remove-button");
      const originalDisplays = [];
      removeButtons.forEach((btn) => {
        if (btn instanceof HTMLElement) {
          originalDisplays.push(btn.style.display);
          btn.style.display = "none";
        }
      });

      // Use html2canvas to capture the schedule
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(schedulePaperRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      // Restore "X" buttons
      removeButtons.forEach((btn, idx) => {
        if (btn instanceof HTMLElement) {
          btn.style.display = originalDisplays[idx] || "";
        }
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${scheduleName || "schedule"}_${new Date().toISOString().split("T")[0]}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, "image/png");

      setExportDialogOpen(false);
      setExportFormat("");
    } catch (error) {
      console.error("Error exporting image:", error);
      alert("Failed to export image. Please ensure html2canvas is installed.");
    }
  }, [scheduleName]);

  // Handle download button click
  const handleDownload = useCallback(() => {
    if (exportFormat === "pdf") {
      handleExportPDF();
    } else if (exportFormat === "image") {
      handleExportImage();
    }
  }, [exportFormat, handleExportPDF, handleExportImage]);

  // Handle remove subject from schedule
  const handleRemoveSubject = useCallback((subject) => {
    if (onRemoveSubject) {
      onRemoveSubject(subject, false);
    }
  }, [onRemoveSubject]);

  // Track which cells have been rendered to avoid duplicates
  const renderedCells = useMemo(() => new Set(), []);

  return (
    <Box ref={scheduleContainerRef} sx={{ display: "flex", flexDirection: "column", gap: 2, height: "100%" }}>
      {/* Schedule Name & Save Box */}
      <Paper
        sx={{
          p: 3,
          backgroundColor: "#fffef7",
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(158, 8, 7, 0.08)",
          border: "1px solid rgba(244, 197, 34, 0.15)",
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: "#333" }}>
          Schedule Name & Save
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Schedule Name"
            variant="outlined"
            value={scheduleName}
            onChange={(e) => setScheduleName(e.target.value)}
            placeholder="Enter schedule name"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Box>
        
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSaveSchedule}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
            }}
          >
            Save Schedule
          </Button>
          
          <Button
            variant="outlined"
            color="primary"
            startIcon={<FileDownloadIcon />}
            onClick={handleOpenExportDialog}
            disabled={addedSubjects.length === 0}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
            }}
          >
            Export Schedule
          </Button>
        </Stack>
        
        {/* Status Indicator */}
        <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid rgba(244, 197, 34, 0.2)" }}>
          <Typography
            variant="body2"
            sx={{
              color: isSaved ? "#4caf50" : "#666",
              fontWeight: isSaved ? 600 : 400,
            }}
          >
            {addedSubjects.length} subject(s) added {isSaved ? "• Saved" : ""}
            {lastSavedTime && isSaved && (
              <span style={{ marginLeft: 8, fontSize: "0.85rem" }}>
                ({lastSavedTime.toLocaleTimeString()})
              </span>
            )}
          </Typography>
        </Box>
      </Paper>

      {/* Main Schedule Timetable */}
      <Paper
        ref={schedulePaperRef}
        sx={{
          p: 2,
          backgroundColor: "#fffef7",
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(158, 8, 7, 0.08)",
          border: "1px solid rgba(244, 197, 34, 0.15)",
          flex: 1,
          overflow: "auto",
        }}
      >
        <TableContainer sx={{ maxHeight: "100%", overflow: "auto" }}>
          <Table
            stickyHeader
            size="small"
            sx={{
              minWidth: 650,
              tableLayout: "fixed",
              borderCollapse: "separate",
              borderSpacing: 0,
              "& .MuiTableCell-root": {
                borderRight: "1px solid #e0e0e0",
                borderBottom: "1px solid #e0e0e0",
                "&:last-child": {
                  borderRight: "none",
                },
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell
                  align="center"
                  sx={{
                    backgroundColor: "#9e0807",
                    color: "#ffffff",
                    fontWeight: 700,
                    borderRight: "1px solid #7a0606",
                    position: "sticky",
                    left: 0,
                    zIndex: 3,
                    width: "70px",
                    minWidth: "70px",
                    maxWidth: "70px",
                    padding: "8px 4px",
                  }}
                >
                  Time
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    backgroundColor: "#9e0807",
                    color: "#ffffff",
                    fontWeight: 700,
                    border: "1px solid #7a0606",
                    width: "calc((100% - 70px) / 7)",
                  }}
                >
                  Monday
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    backgroundColor: "#9e0807",
                    color: "#ffffff",
                    fontWeight: 700,
                    border: "1px solid #7a0606",
                    width: "calc((100% - 70px) / 7)",
                  }}
                >
                  Tuesday
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    backgroundColor: "#9e0807",
                    color: "#ffffff",
                    fontWeight: 700,
                    border: "1px solid #7a0606",
                    width: "calc((100% - 70px) / 7)",
                  }}
                >
                  Wednesday
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    backgroundColor: "#9e0807",
                    color: "#ffffff",
                    fontWeight: 700,
                    border: "1px solid #7a0606",
                    width: "calc((100% - 70px) / 7)",
                  }}
                >
                  Thursday
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    backgroundColor: "#9e0807",
                    color: "#ffffff",
                    fontWeight: 700,
                    border: "1px solid #7a0606",
                    width: "calc((100% - 70px) / 7)",
                  }}
                >
                  Friday
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    backgroundColor: "#9e0807",
                    color: "#ffffff",
                    fontWeight: 700,
                    border: "1px solid #7a0606",
                    width: "calc((100% - 70px) / 7)",
                  }}
                >
                  Saturday
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    backgroundColor: "#9e0807",
                    color: "#ffffff",
                    fontWeight: 700,
                    border: "1px solid #7a0606",
                    width: "calc((100% - 70px) / 7)",
                  }}
                >
                  Sunday
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {timeSlots.map((slot, rowIndex) => {
                // Track which day cells have been rendered as part of a rowspan
                const rowSpanCells = new Set();
                
                // First pass: identify all cells that are part of a rowspan from previous rows
                for (let prevRow = 0; prevRow < rowIndex; prevRow++) {
                  [0, 1, 2, 3, 4, 5, 6].forEach((dayIndex) => {
                    const prevKey = `${dayIndex}_${timeSlots[prevRow].time24}`;
                    const prevCellData = scheduleGrid.get(prevKey);
                    if (prevCellData && prevCellData.startSlot === prevRow) {
                      const endRow = prevCellData.startSlot + prevCellData.rowSpan - 1;
                      if (rowIndex <= endRow && rowIndex > prevRow) {
                        rowSpanCells.add(dayIndex);
                      }
                    }
                  });
                }
                
                return (
                  <TableRow key={slot.time24}>
                    <TableCell
                      align="center"
                      sx={{
                        backgroundColor: "#fafafa",
                        fontWeight: 600,
                        borderRight: "1px solid #e0e0e0",
                        borderBottom: "1px solid #e0e0e0",
                        position: "sticky",
                        left: 0,
                        zIndex: 2,
                        whiteSpace: "nowrap",
                        width: "70px",
                        minWidth: "70px",
                        maxWidth: "70px",
                        padding: "8px 4px",
                      }}
                    >
                      {slot.time12}
                    </TableCell>
                    {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                      // Skip if this cell is part of a rowspan from a previous row
                      // Note: rowSpan handles the spanning, so we don't render a cell here
                      if (rowSpanCells.has(dayIndex)) {
                        return null;
                      }
                      
                      const key = `${dayIndex}_${slot.time24}`;
                      const cellData = scheduleGrid.get(key);
                      
                      // Check if this is the start slot for a subject
                      if (cellData && cellData.startSlot === rowIndex) {
                        const { subject, parsed, rowSpan } = cellData;
                        return (
                          <TableCell
                            key={dayIndex}
                            rowSpan={rowSpan}
                            sx={{
                              backgroundColor: "#f4c522",
                              borderRight: "1px solid #d29119",
                              borderBottom: "1px solid #d29119",
                              p: 1,
                              verticalAlign: "middle",
                              textAlign: "center",
                              position: "relative",
                              width: "calc((100% - 70px) / 7)",
                              "&:hover .remove-button": {
                                opacity: 1,
                              },
                            }}
                          >
                            <IconButton
                              className="remove-button"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveSubject(subject);
                              }}
                              sx={{
                                position: "absolute",
                                top: 4,
                                right: 4,
                                opacity: 0,
                                transition: "opacity 0.2s",
                                backgroundColor: "rgba(255, 255, 255, 0.9)",
                                color: "#9e0807",
                                width: 20,
                                height: 20,
                                minWidth: 20,
                                padding: 0,
                                "&:hover": {
                                  backgroundColor: "#ffffff",
                                  opacity: 1,
                                },
                                zIndex: 10,
                              }}
                            >
                              <CloseIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                minHeight: "100%",
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 700, color: "#333333", mb: 0.5 }}
                              >
                                {subject.subject_code}
                                {subject.section && (
                                  <Chip
                                    label={subject.section}
                                    size="small"
                                    sx={{
                                      ml: 0.5,
                                      height: 18,
                                      fontSize: "0.7rem",
                                      backgroundColor: "rgba(158, 8, 7, 0.15)",
                                      color: "#9e0807",
                                      border: "1px solid rgba(158, 8, 7, 0.3)",
                                    }}
                                  />
                                )}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "#333333", display: "block" }}
                              >
                                {parsed.start} - {parsed.end}
                              </Typography>
                              {parsed.room && (
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#333333", display: "block" }}
                                >
                                  Room: {parsed.room}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                        );
                      }
                      
                      // Empty cell - always render with border
                      return (
                        <TableCell
                          key={dayIndex}
                          sx={{
                            borderRight: "1px solid #e0e0e0",
                            borderBottom: "1px solid #e0e0e0",
                            minHeight: 40,
                            width: "calc((100% - 70px) / 7)",
                            backgroundColor: "#ffffff",
                          }}
                        />
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        
        {addedSubjects.length === 0 && (
          <Box
            sx={{
              p: 4,
              textAlign: "center",
              color: "#999",
            }}
          >
            <Typography variant="body1">
              No subjects added yet. Click "Add Schedule" button on subjects to add them to the timetable.
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Export Dialog */}
      <Dialog
        open={exportDialogOpen}
        onClose={handleCloseExportDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#9e0807", pb: 1 }}>
          Export Schedule
        </DialogTitle>
        <DialogContent>
          <FormControl component="fieldset" sx={{ width: "100%", mt: 2 }}>
            <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600, color: "#333" }}>
              Select Export Format
            </FormLabel>
            <RadioGroup
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              sx={{ gap: 1 }}
            >
              <FormControlLabel
                value="pdf"
                control={
                  <Radio
                    sx={{
                      color: "#9e0807",
                      "&.Mui-checked": {
                        color: "#9e0807",
                      },
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontWeight: 500 }}>
                    PDF
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{ display: "block", color: "#666", fontWeight: 400 }}
                    >
                      Export as PDF document with schedule name
                    </Typography>
                  </Typography>
                }
              />
              <FormControlLabel
                value="image"
                control={
                  <Radio
                    sx={{
                      color: "#9e0807",
                      "&.Mui-checked": {
                        color: "#9e0807",
                      },
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontWeight: 500 }}>
                    Image (PNG)
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{ display: "block", color: "#666", fontWeight: 400 }}
                    >
                      Export as PNG image file
                    </Typography>
                  </Typography>
                }
              />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button
            onClick={handleCloseExportDialog}
            sx={{ textTransform: "none", fontWeight: 600, color: "#666" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDownload}
            variant="contained"
            color="primary"
            startIcon={<FileDownloadIcon />}
            disabled={!exportFormat}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              backgroundColor: "#9e0807",
              "&:hover": {
                backgroundColor: "#7a0606",
              },
            }}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
