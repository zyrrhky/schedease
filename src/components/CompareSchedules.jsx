import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Fade,
  Zoom,
  Divider,
} from "@mui/material";
import Header from "./Header";
import Sidebar from "./Sidebar";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
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
    return schedules.find((s) => s.schedule_id === id) || null;
  };

  const getScheduleSubjects = (schedule) => {
    if (!schedule || !schedule.subjects) return [];
    return schedule.subjects
      .map((subjectId) => subjectsMap.get(String(subjectId)))
      .filter(Boolean);
  };

  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 7;
    const endHour = 21; // 9 PM

    for (let h = startHour; h <= endHour; h++) {
      let hour12 = h;
      let period = "AM";
      if (h === 0) hour12 = 12;
      else if (h === 12) { hour12 = 12; period = "PM"; }
      else if (h > 12) { hour12 = h - 12; period = "PM"; }

      slots.push({
        time24: `${String(h).padStart(2, "0")}:00`,
        time12: `${hour12}:00 ${period}`
      });

      if (h < endHour) {
        slots.push({
          time24: `${String(h).padStart(2, "0")}:30`,
          time12: `${hour12}:30 ${period}`
        });
      }
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
    const m = String(t)
      .trim()
      .toUpperCase()
      .match(/^(\d{1,2}):(\d{2})\s*([AP])M$/);
    if (!m) {
      const m24 = String(t)
        .trim()
        .match(/^(\d{1,2}):(\d{2})$/);
      if (m24)
        return `${String(parseInt(m24[1], 10)).padStart(2, "0")}:${m24[2]}`;
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
    const scheduleParts = scheduleString
      .split(" / ")
      .map((s) => s.trim())
      .filter(Boolean);
    const parsedSchedules = [];

    for (const part of scheduleParts) {
      const parsed = parseScheduleString(part);
      if (parsed) {
        parsedSchedules.push(parsed);
      } else {
        const multiDayMatch = part.match(
          /^([A-Z\s]+)\s+(\d{1,2}:\d{2}\s*[ap]m)\s*-\s*(\d{1,2}:\d{2}\s*[ap]m)\s*(.*)$/i
        );
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

    if (
      timeParts.length !== 2 ||
      startParts.length !== 2 ||
      endParts.length !== 2
    )
      return false;

    const [timeH, timeM] = timeParts;
    const [startH, startM] = startParts;
    const [endH, endM] = endParts;

    if (
      isNaN(timeH) ||
      isNaN(timeM) ||
      isNaN(startH) ||
      isNaN(startM) ||
      isNaN(endH) ||
      isNaN(endM)
    )
      return false;

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

    // 30 minute increments
    return Math.max(1, Math.ceil(durationMinutes / 30));
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

  // Schedule Calendar Component - Full screen optimized version (Compact)
  const ScheduleCalendar = ({ schedule, title }) => {
    if (!schedule) return null;

    const { grid, timeSlots } = generateScheduleGrid(schedule);
    const scheduleSubjects = getScheduleSubjects(schedule);

    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          bgcolor: "#ffffff",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            px: 1,
            py: 0.5,
            borderBottom: "1px solid #e0e0e0",
            bgcolor: "#fffef7",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: "36px",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: "#9e0807",
                fontFamily: "'Poppins', sans-serif",
                fontSize: "0.85rem",
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "#666", fontSize: "0.7rem" }}
            >
              ({scheduleSubjects.length})
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flex: 1, overflow: "auto" }}>
          <Table
            stickyHeader
            size="small"
            sx={{
              tableLayout: "fixed",
              borderCollapse: "separate",
              borderSpacing: 0,
              "& .MuiTableCell-root": {
                borderRight: "1px solid #f0f0f0",
                borderBottom: "1px solid #f0f0f0",
                "&:last-child": {
                  borderRight: "none",
                },
                padding: "0px",
                fontSize: "0.65rem",
                height: "28px",
              },
            }}
          >
            <TableHead>
              <TableRow sx={{ height: "32px" }}>
                <TableCell
                  align="center"
                  sx={{
                    backgroundColor: "#9e0807",
                    color: "#ffffff",
                    fontWeight: 700,
                    width: "65px",
                    minWidth: "65px",
                    maxWidth: "65px",
                    padding: "2px",
                    fontSize: "0.7rem",
                    borderBottom: "none",
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
                      padding: "2px",
                      fontSize: "0.7rem",
                      borderBottom: "none",
                      borderLeft: "1px solid rgba(255,255,255,0.1)",
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
                      const endRow =
                        prevCellData.startSlot + prevCellData.rowSpan - 1;
                      if (rowIndex <= endRow && rowIndex > prevRow) {
                        rowSpanCells.add(dayIndex);
                      }
                    }
                  });
                }

                const isHour = slot.time24.endsWith(":00");

                return (
                  <TableRow key={slot.time24} sx={{ height: "28px" }}>
                    <TableCell
                      align="center"
                      sx={{
                        backgroundColor: "#fafafa",
                        color: isHour ? "#333" : "#999",
                        fontWeight: isHour ? 700 : 400,
                        borderRight: "2px solid #e0e0e0",
                        whiteSpace: "nowrap",
                        fontSize: "0.6rem",
                        padding: "0 2px",
                        width: "65px",
                        minWidth: "65px",
                        maxWidth: "65px",
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
                              border: "1px solid #fff",
                              p: 0,
                              verticalAlign: "middle",
                              textAlign: "center",
                              position: "relative",
                              transition: "all 0.2s",
                              "&:hover": {
                                filter: "brightness(0.95)",
                                zIndex: 2,
                              },
                            }}
                          >
                            <Box
                              sx={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                p: 0.25,
                                overflow: "hidden"
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 700,
                                  color: "#333",
                                  fontSize: "0.85rem",
                                  lineHeight: 1,
                                  textAlign: "center",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  width: "100%",
                                }}
                              >
                                {subject.subject_code}
                              </Typography>
                              {(rowSpan > 1) && (
                                <>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#444",
                                      fontSize: "0.75rem",
                                      lineHeight: 1,
                                      textAlign: "center",
                                      mt: 0.25,
                                    }}
                                  >
                                    {parsed.room}
                                  </Typography>
                                  {subject.section && (
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        fontSize: "0.75rem",
                                        color: "#9e0807",
                                        fontWeight: 600,
                                      }}
                                    >
                                      {subject.section}
                                    </Typography>
                                  )}
                                </>
                              )}
                            </Box>
                          </TableCell>
                        );
                      }

                      return (
                        <TableCell
                          key={dayIndex}
                          sx={{
                            borderRight: "1px solid #f5f5f5",
                            borderBottom: "1px solid #f5f5f5",
                            backgroundColor:
                              rowIndex % 2 === 0 ? "#ffffff" : "#fafafa",
                          }}
                        />
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      </Box >
    );
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#fff6db",
        overflow: "hidden",
      }}
    >
      <Header onMenu={() => setSidebarOpen(true)} cartCount={schedules.length} />
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={() => setSidebarOpen(false)}
      />

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden", // Prevent main scroll
        }}
      >
        {isComparing ? (
          <Fade in={true}>
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <CodeHeader
                selectedSchedule1={selectedSchedule1}
                selectedSchedule2={selectedSchedule2}
                schedules={schedules}
                onClear={handleClearComparison}
              />

              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  width: "100%",
                  height: "100%",
                  overflow: "hidden",
                }}
              >
                <Box sx={{ flex: 1, overflow: "hidden", borderRight: "4px solid #fff6db" }}>
                  <ScheduleCalendar
                    schedule={getScheduleById(selectedSchedule1)}
                    title={
                      getScheduleById(selectedSchedule1)?.schedule_name ||
                      "Schedule 1"
                    }
                  />
                </Box>
                <Box sx={{ flex: 1, overflow: "hidden" }}>
                  <ScheduleCalendar
                    schedule={getScheduleById(selectedSchedule2)}
                    title={
                      getScheduleById(selectedSchedule2)?.schedule_name ||
                      "Schedule 2"
                    }
                  />
                </Box>
              </Box>
            </Box>
          </Fade>
        ) : (
          <Zoom in={true}>
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 3,
                overflowY: "auto",
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  width: "100%",
                  maxWidth: 900,
                  p: { xs: 3, md: 6 },
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  borderRadius: 4,
                  bgcolor: "#fffef7",
                  border: "1px solid rgba(244, 197, 34, 0.3)",
                  boxShadow: "0 8px 32px rgba(158, 8, 7, 0.08)",
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    bgcolor: "rgba(244, 197, 34, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 4,
                  }}
                >
                  <CompareArrowsIcon
                    sx={{ fontSize: 40, color: "#9e0807" }}
                  />
                </Box>

                <Typography
                  variant="h3"
                  align="center"
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
                  align="center"
                  sx={{
                    color: "#666",
                    mb: 6,
                    maxWidth: 500,
                  }}
                >
                  Select two schedules from your saved collection to view them
                  side-by-side and see which schedule works better for you.
                </Typography>

                {error && (
                  <Alert
                    severity="error"
                    sx={{
                      width: "100%",
                      mb: 4,
                      borderRadius: 2,
                      border: "1px solid #ef5350",
                    }}
                  >
                    {error}
                  </Alert>
                )}

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 3,
                    width: "100%",
                    mb: 5,
                  }}
                >
                  <SelectionCard
                    label="First Schedule"
                    value={selectedSchedule1}
                    onChange={setSelectedSchedule1}
                    schedules={schedules}
                    getSubjectCount={(s) => getScheduleSubjects(s).length}
                  />

                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Typography variant="h6" sx={{ color: "#ccc", fontWeight: 700 }}>VS</Typography>
                  </Box>

                  <SelectionCard
                    label="Second Schedule"
                    value={selectedSchedule2}
                    onChange={setSelectedSchedule2}
                    schedules={schedules}
                    getSubjectCount={(s) => getScheduleSubjects(s).length}
                  />
                </Box>

                <Button
                  variant="contained"
                  size="large"
                  onClick={handleCompare}
                  disabled={!selectedSchedule1 || !selectedSchedule2}
                  sx={{
                    bgcolor: "#9e0807",
                    color: "#fff",
                    px: 6,
                    py: 1.5,
                    borderRadius: "50px",
                    fontWeight: 600,
                    fontSize: "1.1rem",
                    textTransform: "none",
                    boxShadow: "0 8px 24px rgba(158, 8, 7, 0.3)",
                    transition: "all 0.3s",
                    "&:hover": {
                      bgcolor: "#7a0606",
                      transform: "translateY(-2px)",
                      boxShadow: "0 12px 28px rgba(158, 8, 7, 0.4)",
                    },
                    "&:disabled": {
                      bgcolor: "#e0e0e0",
                    },
                  }}
                >
                  Compare
                </Button>

                {schedules.length === 0 && (
                  <Button
                    variant="text"
                    href="/dashboard"
                    startIcon={<CalendarTodayIcon />}
                    sx={{ mt: 3, color: "#9e0807" }}
                  >
                    Need to create a schedule? Go to Dashboard
                  </Button>
                )}
              </Paper>
            </Box>
          </Zoom>
        )}
      </Box>
    </Box>
  );
}

const SelectionCard = ({ label, value, onChange, schedules, getSubjectCount }) => (
  <FormControl fullWidth variant="outlined">
    <InputLabel sx={{ bgcolor: "#fffef7", px: 1, color: "#666" }}>
      {label}
    </InputLabel>
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      sx={{
        borderRadius: 3,
        bgcolor: "#ffffff",
        height: 64,
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "rgba(0,0,0,0.1)",
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: "#f4c522",
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: "#9e0807",
        },
      }}
    >
      <MenuItem value="">
        <em>Select a schedule</em>
      </MenuItem>
      {schedules.map((schedule) => (
        <MenuItem key={schedule.schedule_id} value={schedule.schedule_id}>
          <Box sx={{ display: "flex", flexDirection: "column", marginLeft: 1 }}>
            <Typography variant="body1" fontWeight={600}>{schedule.schedule_name || "Untitled Schedule"}</Typography>
            <Typography variant="caption" color="text.secondary">
              {getSubjectCount(schedule)} subjects
            </Typography>
          </Box>
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

const CodeHeader = ({ selectedSchedule1, selectedSchedule2, schedules, onClear }) => (
  <Box sx={{
    bgcolor: "#fff6db",
    color: "#fff",
    p: 1.5,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
    zIndex: 10
  }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Button
        onClick={onClear}
        startIcon={<CloseIcon />}
        sx={{
          color: "#9e0807",
          textTransform: "none",
          "&:hover": { bgcolor: "rgba(129, 38, 38, 0.1)" }
        }}
      >
        Exit Comparison
      </Button>
      <Divider orientation="vertical" flexItem sx={{ bgcolor: "rgba(255,255,255,0.3)" }} />
      <Typography variant="body2" sx={{ color: "#9e0807", opacity: 0.9 }}>
        Comparing <b>2</b> Schedules
      </Typography>
    </Box>
  </Box>
);