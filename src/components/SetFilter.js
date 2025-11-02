// ...existing code...
import React from "react";
import {
  Paper,
  Box,
  Typography,
  TextField,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Grid,
  Divider,
  Avatar,
} from "@mui/material";
import {
  FilterList as FilterIcon,
  AccessTime as TimeIcon,
  EventBusy as ExcludeIcon,
  School as ClassIcon,
} from "@mui/icons-material";

export default function SetFilter({
  breakBetweenMinutes,
  setBreakBetweenMinutes,
  excludeDays = [],
  toggleExcludeDay,
  classTypes = [],
  toggleClassType,
}) {
  const dayOptions = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const classOptions = [
    { value: "f2f", label: "Face to Face" },
    { value: "online", label: "Online" },
    { value: "hybrid", label: "Hybrid" },
  ];

  return (
    <Paper
      elevation={3} // Higher elevation for a more prominent card feel
      sx={{
        mb: 3,
        p: 4, // Increased padding for spaciousness
        borderRadius: 3, // Rounded corners for a modern look
        backgroundColor: "#ffffff", // Clean white background
        border: "1px solid #e8e8e8", // Subtle border
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", // Custom shadow for depth
      }}
    >
      {/* Header with Icon */}
      <Box display="flex" alignItems="center" mb={2}>
        <Avatar sx={{ bgcolor: "#ebaa32ff", mr: 2 }}>
          <FilterIcon />
        </Avatar>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#333" }}>
          Set Filter
        </Typography>
      </Box>
      <Divider sx={{ mb: 3 }} />

      {/* Main Content in a Vertical Stack for Better Structure */}
      <Box>
        {/* Break Between Classes Section */}
        <Box mb={4}>
          <Box display="flex" alignItems="center" mb={2}>
            <TimeIcon sx={{ mr: 1, color: "#d29119ff" }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#555" }}>
              Break Between Classes
            </Typography>
          </Box>
          <TextField
            label="Minutes"
            type="number"
            value={breakBetweenMinutes}
            onChange={(e) => setBreakBetweenMinutes(e.target.value)}
            fullWidth
            inputProps={{ min: 0 }}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Box>

        {/* Exclude Days Section */}
        <Box mb={4}>
          <Box display="flex" alignItems="center" mb={2}>
            <ExcludeIcon sx={{ mr: 1, color: "#d29119ff" }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#555" }}>
              Exclude Days
            </Typography>
          </Box>
          <FormGroup>
            <Grid container spacing={1}>
              {dayOptions.map((d) => (
                <Grid item xs={6} sm={4} key={d}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={excludeDays.includes(d)}
                        onChange={() => toggleExcludeDay(d)}
                        sx={{
                          color: "#d29119ff",
                          "&.Mui-checked": {
                            color: "#d29119ff",
                          },
                        }}
                      />
                    }
                    label={d}
                    sx={{
                      "& .MuiFormControlLabel-label": {
                        fontSize: "0.9rem",
                      },
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </FormGroup>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Select day(s) to exclude meeting on those days.
          </Typography>
        </Box>

        {/* Class Types Section */}
        <Box>
          <Box display="flex" alignItems="center" mb={2}>
            <ClassIcon sx={{ mr: 1, color: "#d29119ff" }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#555" }}>
              Class Types
            </Typography>
          </Box>
          <FormGroup>
            <Grid container spacing={1}>
              {classOptions.map((c) => (
                <Grid item xs={12} sm={4} key={c.value}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={classTypes.includes(c.value)}
                        onChange={() => toggleClassType(c.value)}
                        sx={{
                          color: "#d29119ff",
                          "&.Mui-checked": {
                            color: "#d29119ff",
                          },
                        }}
                      />
                    }
                    label={c.label}
                    sx={{
                      "& .MuiFormControlLabel-label": {
                        fontSize: "0.9rem",
                      },
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </FormGroup>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Select your preferred class type; leave unchecked to accept any.
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}


/*
import React from "react";
import {
  Paper,
  Box,
  Typography,
  TextField,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Grid,
} from "@mui/material";

export default function SetFilter({
  breakBetweenMinutes,
  setBreakBetweenMinutes,
  excludeDays = [],
  toggleExcludeDay,
  classTypes = [],
  toggleClassType,
}) {
  const dayOptions = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const classOptions = [
    { value: "f2f", label: "Face to Face" },
    { value: "online", label: "Online" },
    { value: "hybrid", label: "Hybrid" },
  ];

  return (
    <Paper
      elevation={1}
      sx={{
        mb: 2,
        p: 2,
        borderRadius: 3,
        backgroundColor: "#fff",
      }}
    >
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
        Set Filter
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Break between classes (minutes) — required"
            type="number"
            value={breakBetweenMinutes}
            onChange={(e) => setBreakBetweenMinutes(e.target.value)}
            fullWidth
            inputProps={{ min: 0 }}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Exclude day(s) (optional)</FormLabel>
            <FormGroup>
              {dayOptions.map((d) => (
                <FormControlLabel
                  key={d}
                  control={
                    <Checkbox
                      checked={excludeDays.includes(d)}
                      onChange={() => toggleExcludeDay(d)}
                    />
                  }
                  label={d}
                />
              ))}
            </FormGroup>
            <Typography variant="caption" color="text.secondary">
              You may check multiple days to exclude subjects that meet on those days.
            </Typography>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Class type(s) (optional)</FormLabel>
            <FormGroup>
              {classOptions.map((c) => (
                <FormControlLabel
                  key={c.value}
                  control={
                    <Checkbox
                      checked={classTypes.includes(c.value)}
                      onChange={() => toggleClassType(c.value)}
                    />
                  }
                  label={c.label}
                />
              ))}
            </FormGroup>
            <Typography variant="caption" color="text.secondary">
              You may select multiple class types; leave all unchecked to accept any.
            </Typography>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
}*/