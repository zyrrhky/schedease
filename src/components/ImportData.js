import React, { useState, useMemo } from "react";
import {
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  Box,
  Avatar,
} from "@mui/material";
import { SystemUpdateAlt as ImportIcon } from "@mui/icons-material";
import { parsePlain, normalizeRecord } from "../utils/parse";

const COLORS = {
  navy: "#1A2A40",
  blueAccent: "#275EFE",
  softBlue: "#AEC6FF",
  iceWhite: "#F6F8FF",
  paper: "#FFFFFF",
};

export default function ImportData({ onCreateMany, disableImport = false }) {
  const [text, setText] = useState("");
  const disabled = useMemo(() => !text.trim() || disableImport, [text, disableImport]);

  const handleImport = () => {
    const rows = parsePlain(text);
    if (!rows.length) return;
    const mapped = rows.map(normalizeRecord);
    onCreateMany?.(mapped);
    setText("");
  };

  const handleClear = () => setText("");

  const headers = [
    "#",
    "Offering Dept",
    "Subject",
    "Subject Title",
    "Credited Units",
    "Section",
    "Schedule",
    "Room",
    "Total Slots",
    "Enrolled",
    "Assessed",
    "Is Closed",
  ];

  return (
    <Paper
      sx={{
        mb: 3,
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.05)",
        backgroundColor: COLORS.paper,
      }}
      elevation={2}
    >
      {/* TOP CAPSULE HEADER - capsule now full-width */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${COLORS.softBlue} 0%, ${COLORS.blueAccent} 100%)`,
          p: { xs: 2, md: 3 },
          pb: 4.5,
        }}
      >
        <Box
          sx={{
            // Make the white capsule stretch to available width,
            // while keeping comfortable horizontal padding inside the gradient area.
            width: "100%",
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            background: COLORS.iceWhite,
            borderRadius: 40,
            px: { xs: 2, md: 3 },
            py: 1.25,
            boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
            border: "1px solid rgba(255,255,255,0.4)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: COLORS.navy,
                width: 56,
                height: 56,
                boxShadow: "0 3px 8px rgba(0,0,0,0.18)",
              }}
            >
              <ImportIcon sx={{ color: COLORS.softBlue, fontSize: 28 }} />
            </Avatar>

            <Box>
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: "1.55rem",
                  color: COLORS.navy,
                  letterSpacing: "0.5px",
                }}
              >
                Import Subjects
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  color: COLORS.navy,
                  opacity: 0.75,
                  fontSize: "0.85rem",
                }}
              >
                Paste AIMS rows here and import instantly
              </Typography>
            </Box>
          </Box>

          {/* optional right-side space or controls — kept empty to match your screenshot */}
          <Box sx={{ flex: 1 }} />
        </Box>
      </Box>

      {/* BODY */}
      <Box sx={{ p: { xs: 2, md: 3 }, backgroundColor: COLORS.paper }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="body2" sx={{ color: "#333", mb: 1.25, lineHeight: 1.6 }}>
              Go to <b>AIMS → Subject Offering</b>, search the subject, then copy & paste the rows. Use this exact column order:
            </Typography>

            <Box
              sx={{
                backgroundColor: COLORS.iceWhite,
                borderRadius: 2,
                border: "1px solid rgba(0,0,0,0.08)",
                py: 1.2,
                px: 1.5,
                fontFamily: "'JetBrains Mono','Fira Code', monospace",
                fontSize: "0.9rem",
                color: "#1A1A1A",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                whiteSpace: "nowrap",
                overflow: "hidden",
                gap: "8px",
              }}
            >
              {headers.map((h, i) => (
                <Box key={i} sx={{ flex: i === 3 ? "1.4" : i === 6 ? "1.5" : "1", textAlign: "left" }}>
                  {h}
                </Box>
              ))}
            </Box>
          </Box>

          <TextField
            multiline
            minRows={8}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste rows here..."
            fullWidth
            sx={{
              fontFamily: "'JetBrains Mono','Fira Code', monospace",
              backgroundColor: "#fafafa",
              borderRadius: 2,
              "& .MuiInputBase-root": { alignItems: "flex-start", minHeight: 160 },
            }}
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button
              variant="outlined"
              onClick={handleClear}
              sx={{
                borderColor: COLORS.navy,
                color: COLORS.navy,
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                px: 2.5,
              }}
            >
              Clear
            </Button>

            <Button
              variant="contained"
              disabled={disabled}
              onClick={handleImport}
              sx={{
                bgcolor: COLORS.navy,
                "&:hover": { bgcolor: "#122033" },
                px: 3,
                py: 1,
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 2,
              }}
            >
              Import
            </Button>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
}
