import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Login from "../modules/auth/pages/Login";
import Signup from "../modules/auth/pages/Signup";
import TaskList from "../modules/task/pages/TaskList";
import ProtectedRoute from "./ProtectedRoute";
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
                path="/tasks"
                element={
                    <ProtectedRoute>
                    <TaskList />
                    </ProtectedRoute>
                }
                />
        {/* Protected Route (we’ll secure later) */}
        <Route path="/tasks" element={<TaskList />} />

        {/* Default route */}
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
