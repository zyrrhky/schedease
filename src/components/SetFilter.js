import React from "react";
import {
  Paper,
  Box,
  Typography,
  TextField,
  Grid,
  Avatar,
  Divider,
  Stack,
  ToggleButton,
  Tooltip,
  IconButton,
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
} from "@mui/icons-material";

const CIT = {
  gold: "#F2B501",
  goldLight: "#F3CD4E",
  maroon: "#7A1315",
  paper: "#FFFDF8",
};

export default function SetFilter({
  breakBetweenMinutes,
  setBreakBetweenMinutes,
  excludeDays = [],
  toggleExcludeDay,
  classTypes = [],
  toggleClassType,
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

  const handleDayToggle = (d) => toggleExcludeDay(dayFull[d]);
  const handleClassToggle = (v) => toggleClassType(v);

  const handleClearAll = () => {
    setBreakBetweenMinutes("");
    dayOptions.forEach((d) => excludeDays.includes(dayFull[d]) && toggleExcludeDay(dayFull[d]));
    classOptions.forEach((c) => classTypes.includes(c.value) && toggleClassType(c.value));
  };

  return (
    <Paper
      elevation={2}
      sx={{
        mb: 3,
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.05)",
      }}
    >
      {/* 🔶 TOP SECTION — Gold background (NOT white) */}
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
                  fontSize: "0.8rem",
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

      {/* 🔶 LOWER SECTION — White content area */}
      <Box sx={{ p: { xs: 2, md: 3 }, background: CIT.paper }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Stack spacing={1.25}>
              <Box display="flex" alignItems="center" gap={1}>
                <TimeIcon sx={{ color: CIT.maroon }} />
                <Typography sx={{ fontWeight: 700, color: CIT.maroon }}>
                  Break Between Classes
                </Typography>
              </Box>

              <TextField
                label="Minutes"
                type="number"
                value={breakBetweenMinutes ?? ""}
                onChange={(e) =>
                  setBreakBetweenMinutes(e.target.value === "" ? "" : Number(e.target.value))
                }
                fullWidth
                size="small"
                helperText="Minimum minutes between classes"
                sx={{
                  "& .MuiFormHelperText-root": {
                    color: CIT.goldLight,
                    fontSize: "0.75rem",
                  },
                }}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1.25}>
              <Box display="flex" alignItems="center" gap={1}>
                <ExcludeIcon sx={{ color: CIT.maroon }} />
                <Typography sx={{ fontWeight: 700, color: CIT.maroon }}>Exclude Days</Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {dayOptions.map((d) => {
                  const checked = excludeDays.includes(dayFull[d]);
                  return (
                    <ToggleButton
                      key={d}
                      selected={checked}
                      onClick={() => handleDayToggle(d)}
                      value={d}
                      sx={{
                        px: 2,
                        borderRadius: 2,
                        color: checked ? CIT.maroon : "rgba(0,0,0,0.75)",
                        background: checked ? `${CIT.gold}33` : "transparent",
                        "&:hover": { background: checked ? `${CIT.gold}44` : "rgba(0,0,0,0.04)" },
                      }}
                    >
                      {d}
                    </ToggleButton>
                  );
                })}
              </Box>

              <Typography sx={{ color: CIT.goldLight, fontSize: "0.75rem" }}>
                Select days to exclude classes.
              </Typography>
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Stack spacing={1.25}>
              <Box display="flex" alignItems="center" gap={1}>
                <ClassIcon sx={{ color: CIT.maroon }} />
                <Typography sx={{ fontWeight: 700, color: CIT.maroon }}>Class Types</Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {classOptions.map((opt) => {
                  const active = classTypes.includes(opt.value);
                  return (
                    <ToggleButton
                      key={opt.value}
                      selected={active}
                      onClick={() => handleClassToggle(opt.value)}
                      sx={{
                        px: 2,
                        borderRadius: 2,
                        textTransform: "none",
                        color: active ? CIT.maroon : "rgba(0,0,0,0.85)",
                        background: active ? `${CIT.gold}33` : "transparent",
                        "&:hover": { background: active ? `${CIT.gold}44` : "rgba(0,0,0,0.04)" },
                      }}
                    >
                      {opt.icon}
                      {opt.label}
                    </ToggleButton>
                  );
                })}
              </Box>

              <Typography sx={{ color: CIT.goldLight, fontSize: "0.75rem" }}>
                Choose preferred delivery types (multi-select).
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}
