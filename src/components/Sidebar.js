import React from "react";
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Divider,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import StorageIcon from "@mui/icons-material/Storage";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";

export default function Sidebar({ open = false, onClose = () => {}, onNavigate = () => {} }) {
  const navigate = useNavigate();

  const items = [
    { key: "data", label: "Import Data", icon: <StorageIcon /> },
    { key: "schedule", label: "Saved Schedule", icon: <CalendarTodayIcon /> },
    { key: "compare", label: "Compare Schedule", icon: <CompareArrowsIcon /> },
  ];

  return (
    <Drawer anchor="left" open={!!open} onClose={onClose}>
      <Box sx={{ width: 280, p: 1, height: "100%", display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Menu
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 1 }} />

        <List>
          {items.map((it) => (
            <ListItem
              button
              key={it.key}
              onClick={() => {
                onNavigate?.(it.key);
                onClose?.();
              }}
            >
              <ListItemIcon>{it.icon}</ListItemIcon>
              <ListItemText primary={it.label} />
            </ListItem>
          ))}
        </List>

        <Box sx={{ mt: "auto" }}>
          <Divider sx={{ mb: 1 }} />
          <ListItem
            button
            onClick={() => {
              // clear auth and go to login
              localStorage.removeItem("token");
              navigate("/login", { replace: true });
              onClose?.();
            }}
          >
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </Box>
      </Box>
    </Drawer>
  );
}
