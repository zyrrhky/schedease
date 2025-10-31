import React, { useState, useMemo } from "react";
import { Paper, Stack, Typography, TextField, Button, Box } from "@mui/material";
import { parsePlain, normalizeRecord } from "../utils/parse";

export default function ImportData({ onCreateMany }) {
  const [text, setText] = useState("");
  const disabled = useMemo(() => !text.trim(), [text]);

  const handleImport = () => {
    const rows = parsePlain(text);
    if (!rows.length) return;
    const mapped = rows.map(normalizeRecord);
    onCreateMany?.(mapped);
    setText("");
  };

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
        p: 3,
        borderRadius: 3,
        backgroundColor: "#fff",
        boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
      }}
    >
      <Stack spacing={2}>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "#9e0807",
              mb: 0.75,
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Import Subjects
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "#444",
              fontFamily: "'Inter', sans-serif",
              mb: 1,
              lineHeight: 1.6,
            }}
          >
            Go to <b>AIMS → Subject Offering</b>, search for the subject, then copy and paste
            the rows below.
            <br />
            Follow this column order exactly:
          </Typography>

          <Box
            sx={{
              backgroundColor: "#f9f6ec",
              borderRadius: 2,
              border: "1px solid #e0d8b0",
              py: 1.2,
              px: 1.5,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: "0.9rem",
              color: "#2b2b2b",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "nowrap",
              whiteSpace: "nowrap",
              overflow: "hidden",
              gap: "8px",
            }}
          >
            {headers.map((h, i) => (
              <Box
                key={i}
                sx={{
                  flex: i === 3 ? "1.4" : i === 6 ? "1.5" : "1",
                  textAlign: "left",
                }}
              >
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
          placeholder="Paste your data here..."
          fullWidth
          sx={{
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            backgroundColor: "#fafafa",
            borderRadius: 2,
            "& .MuiInputBase-root": {
              alignItems: "flex-start",
            },
          }}
        />

        <Box display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            disabled={disabled}
            onClick={handleImport}
            sx={{
              bgcolor: "#9e0807",
              "&:hover": { bgcolor: "#7c0605" },
              px: 3,
              py: 1,
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Import
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
