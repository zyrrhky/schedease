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
  Typography
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import StorageIcon from "@mui/icons-material/Storage";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";

export default function Sidebar({ open = false, onClose = () => {}, onNavigate = () => {} }) {
  const items = [
    { key: "data", label: "Import Data", icon: <StorageIcon /> },
    { key: "schedule", label: "Saved Schedule", icon: <CalendarTodayIcon /> },
    { key: "compare", label: "Compare Schedule", icon: <CompareArrowsIcon /> }
  ];

  return (
    <Drawer anchor="left" open={!!open} onClose={onClose}>
      <Box sx={{ width: 280, p: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Menu</Typography>
          <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
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
      </Box>
    </Drawer>
  );
}
