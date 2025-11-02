import React, { useMemo, useState, useCallback } from "react";
import { Container, Box, Typography } from "@mui/material";
import Header from "./Header";
import Sidebar from "./Sidebar";
import ImportData from "./ImportData";
import Schedule from "./Schedule";
import SubjectList from "./SubjectList";
import DataForm from "./DataForm";
import useSubjects from "../hooks/useSubjects";
import useSchedules from "../hooks/useSchedules";

/**
 * Dashboard Component
 * Main schedule management interface (previously the main App component)
 */
export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { subjects: dataList, addMany: handleAddMany, save: handleSaveEdited, remove: handleDeleteData } = useSubjects([]);
  const { schedules: scheduleList, saveSchedule: handleSaveSchedule, deleteSchedule: handleDeleteSchedule, removeSubjectFromSchedules } = useSchedules([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const handleEditOpen = useCallback((item) => {
    setEditing(item);
    setEditOpen(true);
  }, []);

  const handleSaveEditedWrapper = useCallback((item) => {
    handleSaveEdited(item);
    setEditOpen(false);
    setEditing(null);
  }, [handleSaveEdited]);

  const handleDeleteDataWrapper = useCallback((id) => {
    handleDeleteData(id);
    removeSubjectFromSchedules(id);
  }, [handleDeleteData, removeSubjectFromSchedules]);

  const openSubjects = useMemo(() => (dataList || []).filter((d) => !d.is_closed), [dataList]);

  return (
    <Box className="App" sx={{ minHeight: "100vh", bgcolor: "#f2e5ae" }}>
      <Header onMenu={() => setSidebarOpen(true)} cartCount={scheduleList.length} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onNavigate={() => setSidebarOpen(false)} />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <ImportData onCreateMany={handleAddMany} />
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 3,
            alignItems: "flex-start",
            width: "100%",
          }}
        >
          <Box
            sx={{
              flex: 3.2,
              bgcolor: "#fdfaf0",
              borderRadius: 3,
              boxShadow: "0 1px 8px rgba(0,0,0,0.12)",
              p: 3,
              minHeight: 640,
              width: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Schedule
            </Typography>

            <Box sx={{ flex: 1 }}>
              <Schedule
                dataList={openSubjects}
                schedules={scheduleList}
                onSaveSchedule={handleSaveSchedule}
                onDeleteSchedule={handleDeleteSchedule}
              />
            </Box>
          </Box>

          <Box
            sx={{
              flex: 1,
              bgcolor: "#fdfaf0",
              borderRadius: 3,
              boxShadow: "0 1px 8px rgba(0,0,0,0.12)",
              p: 2.5,
              minHeight: 640,
              maxHeight: 640,
              overflowY: "auto",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: "#9e0807" }}>
              Subjects
            </Typography>

            <SubjectList dataList={dataList} onEdit={handleEditOpen} onDelete={handleDeleteDataWrapper} />
          </Box>
        </Box>
      </Container>

      <DataForm open={editOpen} initial={editing} onClose={() => setEditOpen(false)} onSave={handleSaveEditedWrapper} />
    </Box>
  );
}

