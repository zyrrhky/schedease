import React, { useMemo, useState, useCallback } from "react";
import { Container, Box, Typography, Snackbar, Alert } from "@mui/material";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ImportData from "./components/ImportData";
import Schedule from "./components/Schedule";
import SubjectList from "./components/SubjectList";
import DataForm from "./components/DataForm";
import useSubjects from "./hooks/useSubjects";
import useSchedules from "./hooks/useSchedules";
import useFilters from "./hooks/useFilters";
import SetFilter from "./components/SetFilter";
import "./App.css";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { subjects: dataList, addMany: handleAddMany, save: handleSaveEdited, remove: handleDeleteData } = useSubjects([]);
  const { schedules: scheduleList, saveSchedule: handleSaveSchedule, deleteSchedule: handleDeleteSchedule, removeSubjectFromSchedules } = useSchedules([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const {
    breakBetweenMinutes,
    setBreakBetweenMinutes,
    excludeDays,
    toggleExcludeDay,
    classTypes,
    toggleClassType,
    filterSubjects,
  } = useFilters({});

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

  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");
  const [snackSeverity, setSnackSeverity] = useState("success");

  const handleImportParsed = useCallback(
    (parsedArray = []) => {
      const filtered = filterSubjects(parsedArray || []);
      if ((filtered || []).length > 0) {
        handleAddMany(filtered);
        setSnackMsg(`Successfully added ${filtered.length} subject(s) matching the filter`);
        setSnackSeverity("success");
      } else {
        // clearer message when nothing matched
        setSnackMsg("No subjects matched the active filters.");
        setSnackSeverity("warning");
      }
      setSnackOpen(true);
    },
    [filterSubjects, handleAddMany]
  );

  const handleClearAll = useCallback(() => {
    if (!Array.isArray(dataList) || dataList.length === 0) {
      setSnackMsg("No subjects to delete");
      setSnackSeverity("info");
      setSnackOpen(true);
      return;
    }
    dataList.forEach((d) => {
      const id = d.data_id ?? null;
      if (id != null) {
        handleDeleteData(id);
        removeSubjectFromSchedules(id);
      }
    });
    setSnackMsg(`Deleted ${dataList.length} subject(s)`);
    setSnackSeverity("success");
    setSnackOpen(true);
  }, [dataList, handleDeleteData, removeSubjectFromSchedules]);

  return (
    <Box className="App" sx={{ minHeight: "100vh", bgcolor: "#f2e5ae" }}>
      <Header onMenu={() => setSidebarOpen(true)} cartCount={scheduleList.length} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onNavigate={() => setSidebarOpen(false)} />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <SetFilter
            breakBetweenMinutes={breakBetweenMinutes}
            setBreakBetweenMinutes={setBreakBetweenMinutes}
            excludeDays={excludeDays}
            toggleExcludeDay={toggleExcludeDay}
            classTypes={classTypes}
            toggleClassType={toggleClassType}
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          <ImportData onCreateMany={handleImportParsed} />
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
            <SubjectList
              dataList={dataList}
              onEdit={handleEditOpen}
              onDelete={handleDeleteDataWrapper}
              onGenerate={() => console.log("Generate Schedule clicked")}
              onClear={handleClearAll}
              totalImported={dataList.length}
              filtersActive={Boolean(breakBetweenMinutes || (excludeDays && excludeDays.length) || (classTypes && classTypes.length))}
            />
          </Box>
        </Box>
      </Container>

      <DataForm open={editOpen} initial={editing} onClose={() => setEditOpen(false)} onSave={handleSaveEditedWrapper} />

      <Snackbar
        open={snackOpen}
        autoHideDuration={5000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackOpen(false)}
          severity={snackSeverity}
          variant="filled"
          sx={{ width: "100%", fontSize: "1.05rem", py: 1.5, px: 3, fontWeight: 700 }}
        >
          {snackMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
      

/*import React, { useMemo, useState, useCallback } from "react";
import { Container, Box, Typography, Snackbar, Alert } from "@mui/material";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ImportData from "./components/ImportData";
import Schedule from "./components/Schedule";
import SubjectList from "./components/SubjectList";
import DataForm from "./components/DataForm";
import useSubjects from "./hooks/useSubjects";
import useSchedules from "./hooks/useSchedules";
import useFilters from "./hooks/useFilters";
import SetFilter from "./components/SetFilter";
import "./App.css";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { subjects: dataList, addMany: handleAddMany, save: handleSaveEdited, remove: handleDeleteData } = useSubjects([]);
  const { schedules: scheduleList, saveSchedule: handleSaveSchedule, deleteSchedule: handleDeleteSchedule, removeSubjectFromSchedules } = useSchedules([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const {
    breakBetweenMinutes,
    setBreakBetweenMinutes,
    excludeDays,
    toggleExcludeDay,
    classTypes,
    toggleClassType,
    filterSubjects,
  } = useFilters({});

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

  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");

  const handleImportParsed = useCallback(
    (parsedArray = []) => {
      const filtered = filterSubjects(parsedArray || []);
      if ((filtered || []).length > 0) {
        handleAddMany(filtered);
      }
      setSnackMsg(`Successfully added ${filtered.length} subject(s) matching the filter`);
      setSnackOpen(true);
    },
    [filterSubjects, handleAddMany]
  );

  // new: clear all subjects
  const handleClearAll = useCallback(() => {
    if (!Array.isArray(dataList) || dataList.length === 0) {
      setSnackMsg("No subjects to delete");
      setSnackOpen(true);
      return;
    }
    // delete each subject and remove from schedules
    dataList.forEach((d) => {
      const id = d.data_id ?? null;
      if (id != null) {
        handleDeleteData(id);
        removeSubjectFromSchedules(id);
      }
    });
    setSnackMsg(`Deleted ${dataList.length} subject(s)`);
    setSnackOpen(true);
  }, [dataList, handleDeleteData, removeSubjectFromSchedules]);

  return (
    <Box className="App" sx={{ minHeight: "100vh", bgcolor: "#f2e5ae" }}>
      <Header onMenu={() => setSidebarOpen(true)} cartCount={scheduleList.length} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onNavigate={() => setSidebarOpen(false)} />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <SetFilter
            breakBetweenMinutes={breakBetweenMinutes}
            setBreakBetweenMinutes={setBreakBetweenMinutes}
            excludeDays={excludeDays}
            toggleExcludeDay={toggleExcludeDay}
            classTypes={classTypes}
            toggleClassType={toggleClassType}
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          <ImportData onCreateMany={handleImportParsed}/>
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
            
            <SubjectList
              dataList={dataList}
              onEdit={handleEditOpen}
              onDelete={handleDeleteDataWrapper}
              onGenerate={() => console.log("Generate Schedule clicked")}
              onClear={handleClearAll}
            />
          </Box>
        </Box>
      </Container>

      <DataForm open={editOpen} initial={editing} onClose={() => setEditOpen(false)} onSave={handleSaveEditedWrapper} />

      <Snackbar
        open={snackOpen}
        autoHideDuration={5000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%", fontSize: "1.05rem", py: 1.5, px: 3, fontWeight: 700 }}
        >
          {snackMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}*/

/* WORKING
import React, { useMemo, useState, useCallback } from "react";
import { Container, Box, Typography, Snackbar, Alert } from "@mui/material";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ImportData from "./components/ImportData";
import Schedule from "./components/Schedule";
import SubjectList from "./components/SubjectList";
import DataForm from "./components/DataForm";
import useSubjects from "./hooks/useSubjects";
import useSchedules from "./hooks/useSchedules";
import useFilters from "./hooks/useFilters";
import SetFilter from "./components/SetFilter";
import "./App.css";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { subjects: dataList, addMany: handleAddMany, save: handleSaveEdited, remove: handleDeleteData } = useSubjects([]);
  const { schedules: scheduleList, saveSchedule: handleSaveSchedule, deleteSchedule: handleDeleteSchedule, removeSubjectFromSchedules } = useSchedules([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // filters (lifted)
  const {
    breakBetweenMinutes,
    setBreakBetweenMinutes,
    excludeDays,
    toggleExcludeDay,
    classTypes,
    toggleClassType,
    filterSubjects,
  } = useFilters({});

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

  // snackbar state for import result
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");

  // Import handler receives parsed mapped records from ImportData
  const handleImportParsed = useCallback(
    (parsedArray = []) => {
      // require breakBetweenMinutes set (filterSubjects already enforces numeric)
      const filtered = filterSubjects(parsedArray || []);
      if ((filtered || []).length > 0) {
        handleAddMany(filtered);
      }
      setSnackMsg(`Successfully added ${filtered.length} subject(s) matching the filter`);
      setSnackOpen(true);
    },
    [filterSubjects, handleAddMany]
  );

  return (
    <Box className="App" sx={{ minHeight: "100vh", bgcolor: "#f2e5ae" }}>
      <Header onMenu={() => setSidebarOpen(true)} cartCount={scheduleList.length} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onNavigate={() => setSidebarOpen(false)} />

      <Container maxWidth="xl" sx={{ py: 4 }}>
       
        <Box sx={{ mb: 4 }}>
          <SetFilter
            breakBetweenMinutes={breakBetweenMinutes}
            setBreakBetweenMinutes={setBreakBetweenMinutes}
            excludeDays={excludeDays}
            toggleExcludeDay={toggleExcludeDay}
            classTypes={classTypes}
            toggleClassType={toggleClassType}
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          <ImportData onCreateMany={handleImportParsed} disableImport={String(breakBetweenMinutes).trim() === ""} />
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

            <SubjectList dataList={dataList} onEdit={handleEditOpen} onDelete={handleDeleteDataWrapper} onGenerate={() => console.log("Generate Schedule clicked")} />
          </Box>
        </Box>
      </Container>

      <DataForm open={editOpen} initial={editing} onClose={() => setEditOpen(false)} onSave={handleSaveEditedWrapper} />

      <Snackbar open={snackOpen} autoHideDuration={3500} onClose={() => setSnackOpen(false)}>
        <Alert onClose={() => setSnackOpen(false)} severity="success" sx={{ width: "100%" }}>
          {snackMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}*/

/*import React, { useMemo, useState, useCallback } from "react";
import { Container, Box, Typography } from "@mui/material";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ImportData from "./components/ImportData";
import Schedule from "./components/Schedule";
import SubjectList from "./components/SubjectList";
import DataForm from "./components/DataForm";
import useSubjects from "./hooks/useSubjects";
import useSchedules from "./hooks/useSchedules";
import "./App.css";

export default function App() {
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
*/