import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Otp from "./pages/Otp";
import Calendar from "./pages/Calendar";
import DayPulse from "./pages/DayPulse";

import Notes from "./pages/Notes";
import Tasks from "./pages/Tasks";
import Achievements from "./pages/Achievements";
import Notifications from "./pages/Notifications";
import Community from "./pages/Community"; // 🟢
import Layout from "./components/layout/Layout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes (No Layout) */}
        <Route path="/" element={<Login />} />
        <Route path="/otp" element={<Otp />} />

        {/* Protected app Routes (With Premium Layout) */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/community" element={<Community />} /> {/* 🟢 */}
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/day-pulse" element={<DayPulse />} />
          <Route path="/notes" element={<Notes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
