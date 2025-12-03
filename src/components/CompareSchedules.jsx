import React, { useState, useMemo } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  CircularProgress,
  Alert,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
} from "@mui/material";
import Header from "./Header";
import Sidebar from "./Sidebar";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import CloseIcon from "@mui/icons-material/Close";
import useSchedules from "../hooks/useSchedules";
import useSubjects from "../hooks/useSubjects";
import { parseScheduleString } from "../utils/parse";

export default function CompareSchedules() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { schedules } = useSchedules([]);
  const { subjects } = useSubjects([]);
  const [selectedSchedule1, setSelectedSchedule1] = useState("");
  const [selectedSchedule2, setSelectedSchedule2] = useState("");
  const [isComparing, setIsComparing] = useState(false);
  const [error, setError] = useState("");

  // Create a lookup map for subjects
  const subjectsMap = useMemo(() => {
    const map = new Map();
    subjects.forEach((subject) => {
      if (subject.data_id) {
        map.set(String(subject.data_id), subject);
      }
    });
    return map;
  }, [subjects]);

  const handleCompare = () => {
    setError("");
    if (!selectedSchedule1 || !selectedSchedule2) {
      setError("Please select two schedules to compare");
      return;
    }
    if (selectedSchedule1 === selectedSchedule2) {
      setError("Please select two different schedules");
      return;
    }
    setIsComparing(true);
  };

  const handleClearComparison = () => {
    setSelectedSchedule1("");
    setSelectedSchedule2("");
    setIsComparing(false);
    setError("");
  };

  const getScheduleById = (id) => {
    return schedules.find(s => s.schedule_id === id) || null;
  };

  const getScheduleSubjects = (schedule) => {
    if (!schedule || !schedule.subjects) return [];
    return schedule.subjects
      .map((subjectId) => subjectsMap.get(String(subjectId)))
      .filter(Boolean);
  };

  // Generate condensed time slots (only display every hour)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 7; hour <= 21; hour++) {
      const time24 = `${String(hour).padStart(2, "0")}:00`;
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
      const time12 = `${hour12}:00 ${period}`;
      slots.push({ time24, time12 });
    }
    return slots;
  };

  const DAY_MAP = {
    M: { name: "Monday", index: 0 },
    T: { name: "Tuesday", index: 1 },
    W: { name: "Wednesday", index: 2 },
    TH: { name: "Thursday", index: 3 },
    F: { name: "Friday", index: 4 },
    S: { name: "Saturday", index: 5 },
    SU: { name: "Sunday", index: 6 },
  };

  const normalizeDay = (d) => {
    const x = d.toUpperCase().trim();
    if (x === "TH" || x === "THU" || x === "THURS") return "TH";
    if (x === "SU" || x === "SUN" || x === "SUNDAY") return "SU";
    if (x === "M" || x === "MON" || x === "MONDAY") return "M";
    if (x === "T" || x === "TUE" || x === "TUES" || x === "TUESDAY") return "T";
    if (x === "W" || x === "WED" || x === "WEDNESDAY") return "W";
    if (x === "F" || x === "FRI" || x === "FRIDAY") return "F";
    if (x === "S" || x === "SAT" || x === "SATURDAY") return "S";
    return null;
  };

  const convertTo24h = (t) => {
    if (!t) return null;
    const m = String(t).trim().toUpperCase().match(/^(\d{1,2}):(\d{2})\s*([AP])M$/);
    if (!m) {
      const m24 = String(t).trim().match(/^(\d{1,2}):(\d{2})$/);
      if (m24) return `${String(parseInt(m24[1], 10)).padStart(2, "0")}:${m24[2]}`;
      return null;
    }
    let [, hh, mm, ap] = m;
    let h = parseInt(hh, 10);
    if (ap === "P" && h !== 12) h += 12;
    if (ap === "A" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${mm}`;
  };

  const parseSubjectSchedule = (scheduleString) => {
    if (!scheduleString) return [];
    const scheduleParts = scheduleString.split(" / ").map(s => s.trim()).filter(Boolean);
    const parsedSchedules = [];
    
    for (const part of scheduleParts) {
      const parsed = parseScheduleString(part);
      if (parsed) {
        parsedSchedules.push(parsed);
      } else {
        const multiDayMatch = part.match(/^([A-Z\s]+)\s+(\d{1,2}:\d{2}\s*[ap]m)\s*-\s*(\d{1,2}:\d{2}\s*[ap]m)\s*(.*)$/i);
        if (multiDayMatch) {
          const [, daysStr, start12, end12, tail] = multiDayMatch;
          const days = daysStr.trim().split(/\s+/).filter(Boolean);
          const room = tail?.trim() || "";
          const start24 = convertTo24h(start12);
          const end24 = convertTo24h(end12);
          
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
  };

  const isTimeInRange = (time24, start24, end24) => {
    if (!time24 || !start24 || !end24) return false;
    const timeParts = time24.split(":").map(Number);
    const startParts = start24.split(":").map(Number);
    const endParts = end24.split(":").map(Number);
    
    if (timeParts.length !== 2 || startParts.length !== 2 || endParts.length !== 2) return false;
    
    const [timeH, timeM] = timeParts;
    const [startH, startM] = startParts;
    const [endH, endM] = endParts;
    
    if (isNaN(timeH) || isNaN(timeM) || isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return false;
    
    const timeMinutes = timeH * 60 + timeM;
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    
    return timeMinutes >= startMinutes && timeMinutes < endMinutes;
  };

  const calculateRowSpan = (start24, end24) => {
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
    
    return Math.max(1, Math.ceil(durationMinutes / 60)); // Using hour increments
  };

  // Generate schedule grid for a schedule
  const generateScheduleGrid = (schedule) => {
    const timeSlots = generateTimeSlots();
    const scheduleSubjects = getScheduleSubjects(schedule);
    const grid = new Map();
    
    scheduleSubjects.forEach((subject) => {
      if (!subject.schedule) return;
      const parsedSchedules = parseSubjectSchedule(subject.schedule);
      
      parsedSchedules.forEach((parsed) => {
        const dayIndex = DAY_MAP[parsed.day]?.index;
        if (dayIndex === undefined) return;
        
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
    
    return { grid, timeSlots };
  };

  // Schedule Calendar Component - Compact version
  const ScheduleCalendar = ({ schedule, title }) => {
    if (!schedule) return null;
    
    const { grid, timeSlots } = generateScheduleGrid(schedule);
    const scheduleSubjects = getScheduleSubjects(schedule);
    
    return (
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          bgcolor: "#fffef7",
          borderRadius: 3,
          boxShadow: "0 2px 12px rgba(158, 8, 7, 0.08)",
          border: "1px solid rgba(244, 197, 34, 0.15)",
          width: "100%",
        }}
      >
        <CardContent sx={{ p: 0, flex: 1, display: "flex", flexDirection: "column" }}>
          <Box sx={{ 
            p: 1.5, 
            borderBottom: "1px solid rgba(244, 197, 34, 0.2)",
            bgcolor: "#fdfaf0",
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 700, 
                color: "#9e0807",
                fontFamily: "'Poppins', sans-serif",
                fontSize: "0.95rem",
                mb: 0.5,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {title}
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5, alignItems: "center", flexWrap: "wrap" }}>
              <Chip
                label={`${scheduleSubjects.length} Subject${scheduleSubjects.length !== 1 ? "s" : ""}`}
                size="small"
                sx={{
                  bgcolor: "rgba(244, 197, 34, 0.2)",
                  color: "#9e0807",
                  fontWeight: 600,
                  borderRadius: "12px",
                  fontSize: "0.7rem",
                  height: 22,
                }}
              />
            </Box>
          </Box>
          
          <Box sx={{ flex: 1, display: "flex" }}>
            <TableContainer 
              sx={{ 
                flex: 1,
                maxHeight: "none",
                overflow: "hidden",
              }}
            >
              <Table
                stickyHeader
                size="small"
                sx={{
                  tableLayout: "fixed",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  "& .MuiTableCell-root": {
                    borderRight: "1px solid #e0e0e0",
                    borderBottom: "1px solid #e0e0e0",
                    "&:last-child": {
                      borderRight: "none",
                    },
                    padding: "4px 2px",
                    fontSize: "0.7rem",
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
                        width: "45px",
                        minWidth: "45px",
                        maxWidth: "45px",
                        padding: "6px 2px",
                        fontSize: "0.7rem",
                      }}
                    >
                      Time
                    </TableCell>
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                      <TableCell
                        key={day}
                        align="center"
                        sx={{
                          backgroundColor: "#9e0807",
                          color: "#ffffff",
                          fontWeight: 700,
                          border: "1px solid #7a0606",
                          width: "calc((100% - 45px) / 7)",
                          padding: "6px 2px",
                          fontSize: "0.7rem",
                        }}
                      >
                        {day}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {timeSlots.map((slot, rowIndex) => {
                    const rowSpanCells = new Set();
                    
                    for (let prevRow = 0; prevRow < rowIndex; prevRow++) {
                      [0, 1, 2, 3, 4, 5, 6].forEach((dayIndex) => {
                        const prevKey = `${dayIndex}_${timeSlots[prevRow].time24}`;
                        const prevCellData = grid.get(prevKey);
                        if (prevCellData && prevCellData.startSlot === prevRow) {
                          const endRow = prevCellData.startSlot + prevCellData.rowSpan - 1;
                          if (rowIndex <= endRow && rowIndex > prevRow) {
                            rowSpanCells.add(dayIndex);
                          }
                        }
                      });
                    }
                    
                    return (
                      <TableRow key={slot.time24} sx={{ height: "auto" }}>
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
                            width: "45px",
                            minWidth: "45px",
                            maxWidth: "45px",
                            padding: "4px 2px",
                            fontSize: "0.7rem",
                          }}
                        >
                          {slot.time12}
                        </TableCell>
                        {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                          if (rowSpanCells.has(dayIndex)) {
                            return null;
                          }
                          
                          const key = `${dayIndex}_${slot.time24}`;
                          const cellData = grid.get(key);
                          
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
                                  p: 0.5,
                                  verticalAlign: "middle",
                                  textAlign: "center",
                                  width: "calc((100% - 45px) / 7)",
                                }}
                              >
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
                                    variant="caption"
                                    sx={{ 
                                      fontWeight: 700, 
                                      color: "#333333", 
                                      mb: 0.25,
                                      fontSize: "0.65rem",
                                      lineHeight: 1,
                                    }}
                                  >
                                    {subject.subject_code}
                                    {subject.section && (
                                      <Chip
                                        label={subject.section}
                                        size="small"
                                        sx={{
                                          ml: 0.25,
                                          height: 16,
                                          fontSize: "0.6rem",
                                          backgroundColor: "rgba(158, 8, 7, 0.15)",
                                          color: "#9e0807",
                                          border: "1px solid rgba(158, 8, 7, 0.3)",
                                          display: "inline-flex",
                                          verticalAlign: "middle",
                                        }}
                                      />
                                    )}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{ 
                                      color: "#333333", 
                                      display: "block",
                                      fontSize: "0.6rem",
                                      lineHeight: 1,
                                    }}
                                  >
                                    {parsed.start} - {parsed.end}
                                  </Typography>
                                </Box>
                              </TableCell>
                            );
                          }
                          
                          return (
                            <TableCell
                              key={dayIndex}
                              sx={{
                                borderRight: "1px solid #e0e0e0",
                                borderBottom: "1px solid #e0e0e0",
                                minHeight: 30,
                                width: "calc((100% - 45px) / 7)",
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
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fff6db" }}>
      <Header onMenu={() => setSidebarOpen(true)} cartCount={schedules.length} />
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onNavigate={() => setSidebarOpen(false)} 
      />

      <Container 
        maxWidth={isComparing ? "xl" : "lg"} 
        sx={{ 
          py: 4,
          display: "flex",
          flexDirection: "column",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <Box sx={{ flex: "0 0 auto", mb: 4 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              color: "#9e0807",
              fontFamily: "'Poppins', sans-serif",
              mb: 1,
            }}
          >
            Compare Schedules
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: "#666",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Select two schedules to compare them side by side
          </Typography>
        </Box>

        {/* Selection Section */}
        {!isComparing && (
          <Paper
            sx={{
              p: 3,
              mb: 4,
              bgcolor: "#fffef7",
              borderRadius: 3,
              boxShadow: "0 2px 12px rgba(158, 8, 7, 0.08)",
              border: "1px solid rgba(244, 197, 34, 0.15)",
            }}
          >
            <Stack spacing={3}>
              <Box sx={{ display: "flex", gap: 3, alignItems: "flex-end" }}>
                <FormControl fullWidth>
                  <InputLabel id="schedule1-label">First Schedule</InputLabel>
                  <Select
                    labelId="schedule1-label"
                    value={selectedSchedule1}
                    label="First Schedule"
                    onChange={(e) => setSelectedSchedule1(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        bgcolor: "#fff",
                      },
                    }}
                  >
                    <MenuItem value="">
                      <em>Select a schedule</em>
                    </MenuItem>
                    {schedules.map((schedule) => (
                      <MenuItem key={schedule.schedule_id} value={schedule.schedule_id}>
                        {schedule.schedule_name || "Untitled Schedule"} 
                        ({getScheduleSubjects(schedule).length} subjects)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel id="schedule2-label">Second Schedule</InputLabel>
                  <Select
                    labelId="schedule2-label"
                    value={selectedSchedule2}
                    label="Second Schedule"
                    onChange={(e) => setSelectedSchedule2(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        bgcolor: "#fff",
                      },
                    }}
                  >
                    <MenuItem value="">
                      <em>Select a schedule</em>
                    </MenuItem>
                    {schedules.map((schedule) => (
                      <MenuItem key={schedule.schedule_id} value={schedule.schedule_id}>
                        {schedule.schedule_name || "Untitled Schedule"} 
                        ({getScheduleSubjects(schedule).length} subjects)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    borderRadius: "12px",
                    "& .MuiAlert-icon": {
                      color: "#d32f2f",
                    },
                  }}
                >
                  {error}
                </Alert>
              )}

              <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                <Button
                  variant="contained"
                  startIcon={<CompareArrowsIcon />}
                  onClick={handleCompare}
                  disabled={!selectedSchedule1 || !selectedSchedule2 || isComparing}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    bgcolor: "#9e0807",
                    color: "#fff",
                    borderRadius: "20px",
                    px: 4,
                    py: 1.5,
                    fontSize: "1rem",
                    "&:hover": {
                      bgcolor: "#7a0606",
                    },
                    "&.Mui-disabled": {
                      bgcolor: "#cccccc",
                      color: "#666666",
                    },
                  }}
                >
                  {isComparing ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1, color: "#fff" }} />
                      Comparing...
                    </>
                  ) : (
                    "Compare Schedules"
                  )}
                </Button>

                {(selectedSchedule1 || selectedSchedule2 || isComparing) && (
                  <Button
                    variant="outlined"
                    startIcon={<CloseIcon />}
                    onClick={handleClearComparison}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      color: "#9e0807",
                      borderColor: "#9e0807",
                      borderRadius: "20px",
                      px: 4,
                      py: 1.5,
                      fontSize: "1rem",
                      "&:hover": {
                        borderColor: "#7a0606",
                        bgcolor: "rgba(158, 8, 7, 0.04)",
                      },
                    }}
                  >
                    Clear
                  </Button>
                )}
              </Box>
            </Stack>
          </Paper>
        )}

        {/* Comparison Results - Side by side */}
        {isComparing && selectedSchedule1 && selectedSchedule2 && (
          <Box sx={{ 
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}>
            <Box sx={{ 
              flex: 1,
              display: "flex",
              gap: 3,
              alignItems: "stretch",
              overflow: "hidden",
            }}>
              {/* Left Calendar */}
              <Box sx={{ 
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
              }}>
                <ScheduleCalendar 
                  schedule={getScheduleById(selectedSchedule1)}
                  title={getScheduleById(selectedSchedule1)?.schedule_name || "Schedule 1"}
                />
              </Box>
              
              {/* Right Calendar */}
              <Box sx={{ 
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
              }}>
                <ScheduleCalendar 
                  schedule={getScheduleById(selectedSchedule2)}
                  title={getScheduleById(selectedSchedule2)?.schedule_name || "Schedule 2"}
                />
              </Box>
            </Box>
            
            {/* Clear Comparison Button */}
            <Box sx={{ 
              mt: 3, 
              pt: 3, 
              borderTop: "1px solid rgba(244, 197, 34, 0.2)",
              display: "flex",
              justifyContent: "center",
            }}>
              <Button
                variant="outlined"
                startIcon={<CloseIcon />}
                onClick={handleClearComparison}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  color: "#9e0807",
                  borderColor: "#9e0807",
                  borderRadius: "20px",
                  px: 4,
                  py: 1.5,
                  fontSize: "1rem",
                  "&:hover": {
                    borderColor: "#7a0606",
                    bgcolor: "rgba(158, 8, 7, 0.04)",
                  },
                }}
              >
                Clear Comparison
              </Button>
            </Box>
          </Box>
        )}

        {!isComparing && schedules.length === 0 && (
          <Paper
            sx={{
              p: 6,
              textAlign: "center",
              bgcolor: "#fffef7",
              borderRadius: 3,
              boxShadow: "0 2px 12px rgba(158, 8, 7, 0.08)",
              border: "1px solid rgba(244, 197, 34, 0.15)",
              mt: 4,
            }}
          >
            <CompareArrowsIcon 
              sx={{ 
                fontSize: 64, 
                color: "#f4c522", 
                mb: 2,
                opacity: 0.5,
              }} 
            />
            <Typography 
              variant="h6" 
              sx={{ 
                color: "#666",
                fontFamily: "'Poppins', sans-serif",
                mb: 1,
              }}
            >
              No Saved Schedules Yet
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: "#999",
                fontFamily: "'Poppins', sans-serif",
                mb: 3,
              }}
            >
              Create and save schedules from the dashboard to compare them here
            </Typography>
            <Button
              variant="contained"
              href="/dashboard"
              sx={{
                textTransform: "none",
                fontWeight: 600,
                bgcolor: "#9e0807",
                color: "#fff",
                borderRadius: "20px",
                px: 4,
                py: 1.5,
                "&:hover": {
                  bgcolor: "#7a0606",
                },
              }}
            >
              Go to Dashboard
            </Button>
          </Paper>
        )}
      </Container>
    </Box>
  );
}