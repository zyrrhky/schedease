import React from "react";
import { AppBar, Toolbar, IconButton, Typography, Badge } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

export default function Header({ onMenu, cartCount = 0 }) {
  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <IconButton size="large" edge="start" color="inherit" onClick={onMenu} aria-label="menu">
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Schedease
        </Typography>
        <Badge badgeContent={cartCount} color="secondary">
          <Typography variant="body2">Schedules</Typography>
        </Badge>
      </Toolbar>
    </AppBar>
  );
}
