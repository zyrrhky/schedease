// src/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#9e0807" },        // Deep Red
    secondary: { main: "#f6b492" },      // Warm Peach
    background: { default: "#f2e5ae" },  // Pale Yellow background
    text: {
      primary: "#000000",
      secondary: "#9e0807",
    },
  },
  typography: {
    fontFamily: "'Poppins', 'Helvetica', 'Arial', sans-serif",
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
});

export default theme;
