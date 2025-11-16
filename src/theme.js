// src/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#9e0807" },        // Maroon (Primary)
    secondary: { main: "#f4c522" },      // Gold (replaced old #ebaa32)
    background: { 
      default: "#fff6db",                // Warm Light Gold background
      paper: "#fffef7",                  // Gold-tinted white for papers
    },
    text: {
      primary: "#000000",                // Black
      secondary: "#9e0807",              // Maroon
    },
    warning: {
      main: "#f4c522",                   // Gold for warnings/accents
    },
  },
  typography: {
    fontFamily: "'Poppins', 'Helvetica', 'Arial', sans-serif",
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
});

export default theme;
