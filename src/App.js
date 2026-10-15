import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./common/ProtectedRoute";

import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import VerifyCodePage from "./pages/VerifyCodePage";
import TechnicianRegisterWizard from "./pages/TechnicianRegisterWizard";

import OpenRequestsPage from "./pages/OpenRequestsPage";
import RequestOpenDetailPage from "./pages/RequestOpenDetailPage";
import MyRequestsHistoryPage from "./pages/MyRequestsHistoryPage";
import EndRequestPage from "./pages/EndRequestPage";
import SettleRequestPage from "./pages/SettleRequestPage";
import MyRequestDetailPage from "./pages/MyRequestDetailPage";

import NotificationsPage from "./pages/NotificationsPage";
import NotificationDetailPage from "./pages/NotificationDetailPage";

import AccountMenuPage from "./pages/AccountMenuPage";
import PersonalInfoPage from "./pages/PersonalInfoPage";
import ChatSupportPage from "./pages/ChatSupportPage";
import HomeButtonComponent from "./pages/HomeButtonComponent";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* عمومی — قبل از ورود */}
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify-code" element={<VerifyCodePage />} />
        <Route path="/register" element={<TechnicianRegisterWizard />} />

        {/* بعد از ورود — همه پشت ProtectedRoute */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/requests/open"
          element={
            <ProtectedRoute>
              <OpenRequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests/open/:id"
          element={
            <ProtectedRoute>
              <RequestOpenDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/requests/history"
          element={
            <ProtectedRoute>
              <MyRequestsHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests/history/:id"
          element={
            <ProtectedRoute>
              <MyRequestDetailPage />
            </ProtectedRoute>
          }
        />

        <Route path="/requests/history/:id/end" element={<ProtectedRoute><EndRequestPage /></ProtectedRoute>} />
        <Route path="/requests/history/:id/settle" element={<ProtectedRoute><SettleRequestPage /></ProtectedRoute>} />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications/:id"
          element={
            <ProtectedRoute>
              <NotificationDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/setting"
          element={
            <ProtectedRoute>
              <AccountMenuPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <PersonalInfoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatSupportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <TechnicianRegisterWizard editMode />
            </ProtectedRoute>
          }
        />
      </Routes>
      <HomeButtonComponent />
    </BrowserRouter>
  );
}

export default App;
