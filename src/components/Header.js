import React from "react";
import { AppBar, Toolbar, IconButton, Typography, Badge, Box } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

export default function Header({ onMenu, cartCount = 0 }) {
  return (
    <AppBar 
      position="static" 
      sx={{ 
        backgroundColor: "#9e0807",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
    >
      <Toolbar sx={{ px: { xs: 2, md: 3 }, py: 1 }}>
        <IconButton 
          size="large" 
          edge="start" 
          color="inherit" 
          onClick={onMenu} 
          aria-label="menu"
          sx={{ 
            mr: 2,
            "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" }
          }}
        >
          <MenuIcon />
        </IconButton>
        
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexGrow: 1 }}>
          {/* SchedEase Logo */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <img 
              src="/SchedEase-logo.png" 
              alt="SchedEase Logo" 
              style={{ width: "36px", height: "36px" }}
            />
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "0.5px",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              SchedEase
            </Typography>
          </Box> 
        </Box> 

        <Badge 
          badgeContent={cartCount} 
          sx={{
            "& .MuiBadge-badge": {
              backgroundColor: "#f4c522",
              color: "#000000",
              fontWeight: 700,
            }
          }}
        >
          <Typography 
              variant="h7" 
              sx={{ 
                fontWeight: 500,
                color: "#ffffff",
                letterSpacing: "0.5px",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              Import Data
            </Typography>
        </Badge>
      </Toolbar>
    </AppBar>
  );
}
