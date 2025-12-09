import React, { useState } from "react";
import {
  Paper,
  Box,
  Typography,
  Grid,
  Avatar,
  Divider,
  Stack,
  ToggleButton,
  Tooltip,
  IconButton,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  FilterList as FilterIcon,
  AccessTime as TimeIcon,
  EventBusy as ExcludeIcon,
  School as ClassIcon,
  CleaningServices as ClearFilterIcon,
  Public as OnlineIcon,
  Groups as F2FIcon,
  SwapHoriz as HybridIcon,
  NavigateNext as NavigateIcon,
} from "@mui/icons-material";

const CIT = {
  gold: "#f4c522",
  goldLight: "#f4c522",
  maroon: "#9e0807",
  paper: "#ffffff",
};

export default function SetFilter({
  breakBetweenMinutes,
  setBreakBetweenMinutes,
  excludeDays = [],
  toggleExcludeDay,
  classTypes = [],
  toggleClassType,
  onNavigateToImport, // New prop to handle navigation
}) {
  const dayOptions = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayFull = {
    Mon: "Monday",
    Tue: "Tuesday",
    Wed: "Wednesday",
    Thu: "Thursday",
    Fri: "Friday",
    Sat: "Saturday",
  };

  const classOptions = [
    { value: "f2f", label: "Face to Face", icon: <F2FIcon fontSize="small" /> },
    { value: "online", label: "Online", icon: <OnlineIcon fontSize="small" /> },
    { value: "hybrid", label: "Hybrid", icon: <HybridIcon fontSize="small" /> },
  ];

  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleDayToggle = (d) => toggleExcludeDay(dayFull[d]);
  const handleClassToggle = (v) => toggleClassType(v);

  const handleClearAll = () => {
    // Remove break between classes feature
    dayOptions.forEach((d) => excludeDays.includes(dayFull[d]) && toggleExcludeDay(dayFull[d]));
    classOptions.forEach((c) => classTypes.includes(c.value) && toggleClassType(c.value));
    
    setSnackbarMessage("All filters have been cleared");
    setSnackbarOpen(true);
  };

  const handleSetFilter = () => {
    if (onNavigateToImport) {
      setLoading(true);
      setSnackbarMessage("Redirecting to Import Data...");
      setSnackbarOpen(true);
      
      // Simulate loading state before navigation
      setTimeout(() => {
        setLoading(false);
        onNavigateToImport();
      }, 2000);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <Paper
        elevation={2}
        sx={{
          mb: 3,
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.05)",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Box
          sx={{
            background: `linear-gradient(90deg, ${CIT.goldLight} 0%, ${CIT.gold} 100%)`,
            p: { xs: 2, md: 3 },
            pb: 4,
          }}
        >
          {/* Capsule Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "rgba(255,255,255,0.45)",
              backdropFilter: "blur(4px)",
              borderRadius: 50,
              px: { xs: 2, md: 3 },
              py: 1.5,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar
                sx={{
                  bgcolor: CIT.maroon,
                  width: 52,
                  height: 52,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                }}
              >
                <FilterIcon sx={{ color: CIT.goldLight, fontSize: 30 }} />
              </Avatar>

              <Box>
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: "1.65rem",
                    color: CIT.maroon,
                  }}
                >
                  Set Filters
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    color: CIT.maroon,
                    opacity: 0.8,
                    fontWeight: 500,
                    fontSize: "1rem", // Increased from 0.8rem
                    lineHeight: 1.2,
                  }}
                >
                  Narrow down subjects and schedules
                </Typography>
              </Box>
            </Box>

            <Tooltip title="Clear Filters">
              <IconButton
                onClick={handleClearAll}
                sx={{
                  color: CIT.maroon,
                  "&:hover": { background: "rgba(122,19,21,0.15)" },
                }}
              >
                <ClearFilterIcon sx={{ fontSize: 24 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ 
          p: { xs: 2, md: 3 }, 
          background: "#fffef7",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}>
          {/* Increased font sizes for header texts */}
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700, 
              color: CIT.maroon, 
              fontSize: "1.25rem",
              mb: 3,
              textAlign: "center"
            }}
          >
            Apply Filters to Refine Your Schedule
          </Typography>

          <Box sx={{ 
            display: "flex", 
            gap: 6, 
            alignItems: "flex-start", 
            flexWrap: { xs: "wrap", md: "nowrap" },
            mb: 4,
          }}>
            {/* Exclude Days */}
            <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 0" }, minWidth: 0 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <ExcludeIcon sx={{ color: CIT.maroon, fontSize: 24 }} />
                <Typography sx={{ 
                  fontWeight: 700, 
                  color: "black", 
                  fontSize: "1.1rem" // Increased from 0.95rem
                }}>
                  Exclude Days
                </Typography>
              </Box>
              <Box sx={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(3, 1fr)", 
                gap: 1.5,
                mb: 1.5,
              }}>
                {dayOptions.map((d) => {
                  const checked = excludeDays.includes(dayFull[d]);
                  return (
                    <ToggleButton
                      key={d}
                      selected={checked}
                      onClick={() => handleDayToggle(d)}
                      value={d}
                      size="medium"
                      sx={{
                        px: 1,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: "uppercase",
                        fontSize: "0.9rem", // Increased from 0.75rem
                        fontWeight: 700,
                        color: checked ? "#fff" : "rgba(0,0,0,0.85)",
                        background: checked ? 
                          `linear-gradient(135deg, ${CIT.maroon} 0%, #7a0506 100%)` : 
                          "rgba(255,255,255,0.8)",
                        border: checked ? 
                          `2px solid ${CIT.maroon}` : 
                          "2px solid rgba(0,0,0,0.15)",
                        "&:hover": { 
                          background: checked ? 
                            `linear-gradient(135deg, #7a0506 0%, ${CIT.maroon} 100%)` : 
                            "rgba(244, 197, 34, 0.1)",
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                        },
                        transition: "all 0.2s ease",
                      }}
                    >
                      {d}
                    </ToggleButton>
                  );
                })}
              </Box>
              <Typography sx={{ 
                color: CIT.goldLight, 
                fontSize: "0.85rem", // Increased from 0.7rem
                mt: 1,
                fontWeight: 500,
              }}>
                Select days to exclude from your schedule
              </Typography>
            </Box>

            {/* Class Types */}
            <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 0" }, minWidth: 0 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <ClassIcon sx={{ color: CIT.maroon, fontSize: 24 }} />
                <Typography sx={{ 
                  fontWeight: 700, 
                  color: "black", 
                  fontSize: "1.1rem" // Increased from 0.95rem
                }}>
                  Class Types
                </Typography>
              </Box>
              <Box sx={{ 
                display: "flex", 
                flexDirection: "column", 
                gap: 1.5,
                mb: 1.5,
              }}>
                {classOptions.map((opt) => {
                  const active = classTypes.includes(opt.value);
                  return (
                    <ToggleButton
                      key={opt.value}
                      selected={active}
                      onClick={() => handleClassToggle(opt.value)}
                      size="medium"
                      sx={{
                        px: 2,
                        py: 1.5,
                        borderRadius: 2,
                        textTransform: "none",
                        fontSize: "0.95rem", // Increased from 0.8rem
                        fontWeight: 700,
                        gap: 1,
                        justifyContent: "flex-start",
                        color: active ? "#fff" : "rgba(0,0,0,0.85)",
                        background: active ? 
                          `linear-gradient(135deg, ${CIT.gold} 0%, #e6b400 100%)` : 
                          "rgba(255,255,255,0.8)",
                        border: active ? 
                          `2px solid ${CIT.gold}` : 
                          "2px solid rgba(0,0,0,0.15)",
                        "&:hover": { 
                          background: active ? 
                            `linear-gradient(135deg, #e6b400 0%, ${CIT.gold} 100%)` : 
                            "rgba(244, 197, 34, 0.1)",
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                        },
                        transition: "all 0.2s ease",
                      }}
                    >
                      {opt.icon}
                      {opt.label}
                    </ToggleButton>
                  );
                })}
              </Box>
              <Typography sx={{ 
                color: CIT.goldLight, 
                fontSize: "0.85rem", // Increased from 0.7rem
                mt: 1,
                fontWeight: 500,
              }}>
                Choose your preferred delivery types (multi-select)
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ 
            mt: "auto", 
            pt: 4, 
            display: "flex", 
            justifyContent: "center", 
            gap: 3,
            flexWrap: "wrap",
          }}>
            <Button
              variant="outlined"
              onClick={handleClearAll}
              startIcon={<ClearFilterIcon />}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 3,
                textTransform: "none",
                fontWeight: 700,
                fontSize: "1rem",
                borderColor: CIT.maroon,
                color: CIT.maroon,
                borderWidth: 2,
                "&:hover": {
                  borderWidth: 2,
                  borderColor: "#7a0506",
                  backgroundColor: "rgba(158, 8, 7, 0.05)",
                },
                minWidth: 160,
              }}
            >
              Clear Filters
            </Button>

            <Button
              variant="contained"
              onClick={handleSetFilter}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <NavigateIcon />}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 3,
                textTransform: "none",
                fontWeight: 700,
                fontSize: "1rem",
                background: `linear-gradient(135deg, ${CIT.maroon} 0%, #7a0506 100%)`,
                "&:hover": {
                  background: `linear-gradient(135deg, #7a0506 0%, ${CIT.maroon} 100%)`,
                  boxShadow: "0 4px 12px rgba(158, 8, 7, 0.3)",
                },
                "&:disabled": {
                  background: "rgba(0,0,0,0.12)",
                },
                minWidth: 160,
              }}
            >
              {loading ? "Redirecting..." : "Set Filter & Import"}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="info"
          sx={{ 
            width: "100%",
            fontSize: "1rem",
            fontWeight: 600,
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}