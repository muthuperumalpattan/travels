import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ToastViewport } from "./components/ToastViewport";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./layouts/AppLayout";
import { LoginPage } from "./pages/Login/LoginPage";
import { DashboardPage } from "./pages/Dashboard/DashboardPage";
import { RecordTravelPage } from "./pages/RecordTravel/RecordTravelPage";
import { TravelRecordsPage } from "./pages/TravelRecords/TravelRecordsPage";
import { AddUserPage } from "./pages/Users/AddUserPage";
import { UserManagementPage } from "./pages/Users/UserManagementPage";
import { InvoicePage } from "./pages/Invoice/InvoicePage";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <ToastViewport />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route element={<ProtectedRoute permission="dashboard:view" />}>
                  <Route path="/" element={<DashboardPage />} />
                </Route>
                <Route element={<ProtectedRoute permission="travel:create" />}>
                  <Route path="/travel/new" element={<RecordTravelPage />} />
                </Route>
                <Route element={<ProtectedRoute permission="travel:edit" />}>
                  <Route path="/travel/:id/edit" element={<RecordTravelPage />} />
                </Route>
                <Route element={<ProtectedRoute permission="travel:view" />}>
                  <Route path="/travel" element={<TravelRecordsPage />} />
                  <Route path="/invoices/:id" element={<InvoicePage />} />
                </Route>
                <Route element={<ProtectedRoute permission="users:manage" />}>
                  <Route path="/users" element={<UserManagementPage />} />
                  <Route path="/users/new" element={<AddUserPage />} />
                  <Route path="/users/:id/edit" element={<AddUserPage />} />
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
