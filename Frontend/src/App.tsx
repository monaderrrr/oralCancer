import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ChatbotWidget } from './components/chatbot/ChatbotWidget';
// Public Pages
import { LandingPage } from './pages/LandingPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { AwarenessPage } from './pages/AwarenessPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { SymptomsPage } from './pages/SymptomsPage';
import { UploadPage } from './pages/UploadPage';
import { ResultsPage } from './pages/ResultsPage';
// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { SignUpPage } from './pages/auth/SignUpPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { VerifyCodePage } from './pages/auth/VerifyCodePage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from "./pages/auth/VerifyEmailPage";
// Patient Pages
import { DashboardPage as PatientDashboard } from './pages/patient/DashboardPage';
import { ChatListPage as PatientChatList } from './pages/patient/ChatListPage';
import { ChatPage as PatientChat } from './pages/patient/ChatPage';
import { NotificationsPage as PatientNotifications } from './pages/patient/NotificationsPage';
import { SettingsPage as PatientSettings } from './pages/patient/SettingsPage';
import { ReportsPage as PatientReports } from './pages/patient/ReportsPage';
import { ScanReportDetailPage } from './pages/patient/ScanReportDetailPage';
import { ScanHistoryPage as PatientScanHistory } from './pages/patient/ScanHistoryPage';
import { MedicalHistoryPage } from './pages/patient/MedicalHistoryPage';
import { BookHospitalPage } from './pages/patient/BookHospitalPage';
import { DoctorDetailsPage } from "./pages/patient/DoctorDetailsPage";
import { HospitalDetailsPage } from "./pages/patient/HospitalDetailsPage";
import { DoctorsListPage } from "./pages/patient/DoctorList";
import { BookAppointmentPage } from './pages/patient/BookAppointmentPage';
import { InvoiceDetailsPage } from './pages/patient/InvoiceDetailsPage';
import { InvoicesListPage } from './pages/patient/InvoicesListPage';
// New Patient Pages
import { EducationPage } from './pages/patient/EducationPage';
import { RiskAssessmentPage } from './pages/patient/RiskAssessmentPage';
import { RecommendationsPage } from './pages/patient/RecommendationsPage';
import { RiskReportPage } from './pages/patient/RiskReportPage';
import { ProgressPage } from './pages/patient/ProgressPage';
import { FamilyPage } from './pages/patient/FamilyPage';
import { CommunityPage } from './pages/patient/CommunityPage';
import { SymptomCheckerPage } from './pages/patient/SymptomCheckerPage';
import { GoalsPage } from './pages/patient/GoalsPage';
// Doctor Pages
import { DashboardPage as DoctorDashboard } from './pages/doctor/DashboardPage';
import { MessagesListPage } from './pages/doctor/MessagesListPage';
import { MessagesChatPage } from './pages/doctor/MessagesChatPage';
import { UploadDocumentsPage } from './pages/doctor/UploadDocumentsPage';
import { UploadProofPage } from './pages/doctor/UploadProofPage';
import { PendingVerificationPage } from './pages/doctor/PendingVerificationPage';
import { DoctorVerificationUploadPage } from './pages/doctor/DoctorVerificationUploadPage';
import { NotificationsPage as DoctorNotifications } from './pages/doctor/NotificationsPage';
import { SettingsPage as DoctorSettings } from './pages/doctor/SettingsPage';
import { PatientsListPage } from './pages/doctor/PatientsListPage';
import { ScanReviewPage } from './pages/doctor/ScanReviewPage';
import { DoctorProvider } from './contexts/DoctorContext';
// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <DoctorProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/awareness" element={<AwarenessPage />} />
              <Route path="/symptoms" element={<SymptomsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/results" element={<ResultsPage />} />

              {/* Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/verify-code" element={<VerifyCodePage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-email/:emailToken" element={<VerifyEmailPage />} />

              <Route path="/doctor-details/:id" element={<DoctorDetailsPage />} />
              <Route path="/hospital-details/:id" element={<HospitalDetailsPage />} />

              <Route path="/patient/dashboard" element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <PatientDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/patient/notifications" element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <PatientNotifications />
                </ProtectedRoute>
              } />
              
              <Route path="/patient/settings" element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <PatientSettings />
                </ProtectedRoute>
              } />

              <Route path="/patient/medical-history" element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <MedicalHistoryPage />
                </ProtectedRoute>
              } />

              <Route path="/patient/recommendations" element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <RecommendationsPage />
                </ProtectedRoute>
              } />

              <Route path="/patient/education" element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <EducationPage />
                </ProtectedRoute>
              } />

              <Route path="/patient/risk-assessment" element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <RiskAssessmentPage />
                </ProtectedRoute>
              } />

              <Route path="/patient/risk-report" element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <RiskReportPage />
                </ProtectedRoute>
              } />

              <Route path="/patient/progress" element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <ProgressPage />
                </ProtectedRoute>
              } />

              <Route path="/patient/family" element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <FamilyPage />
                </ProtectedRoute>
              } />

              <Route path="/patient/community" element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <CommunityPage />
                </ProtectedRoute>
              } />

              <Route path="/doctor/community" element={
                <ProtectedRoute allowedRoles={["doctor"]}>
                  <CommunityPage />
                </ProtectedRoute>
              } />

              <Route path="/patient/symptom-checker" element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <SymptomCheckerPage />
                </ProtectedRoute>
              } />

              <Route path="/patient/goals" element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <GoalsPage />
                </ProtectedRoute>
              } />

              <Route path="/patient/doctors" element={
  <ProtectedRoute allowedRoles={["patient"]}>
    <DoctorsListPage />
  </ProtectedRoute>
} />

              <Route path="/patient/book-appointment/:doctorId" element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <BookAppointmentPage />
                </ProtectedRoute>
              } />

              <Route path="/patient/invoice/:invoiceId" element={
                <ProtectedRoute allowedRoles={["patient", "doctor"]}>
                  <InvoiceDetailsPage />
                </ProtectedRoute>
              } />

              <Route path="/patient/invoices" element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <InvoicesListPage />
                </ProtectedRoute>
              } />

              <Route path="/patient/hospitals" element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <BookHospitalPage />
                </ProtectedRoute>
              } />

              <Route path="/patient/reports/:id" element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <ScanReportDetailPage />
                </ProtectedRoute>
              } />

              <Route path="/patient/scans/:id" element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <ScanReportDetailPage />
                </ProtectedRoute>
              } />

              <Route path="/patient/reports" element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <PatientReports />
                </ProtectedRoute>
              } />

              <Route path="/patient/scan-history" element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <PatientScanHistory />
                </ProtectedRoute>
              } />

              <Route path="/patient/upload" element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <UploadPage />
                </ProtectedRoute>
              } />

              <Route path="/patient/results" element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <ResultsPage />
                </ProtectedRoute>
              } />

              <Route path="/patient/chat" element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <PatientChatList />
                </ProtectedRoute>
              } />

              <Route path="/patient/chat/:conversationId" element={
  <ProtectedRoute allowedRoles={["patient"]}>
    <PatientChat />
  </ProtectedRoute>
} />

              {/* Doctor Routes */}
              <Route path="/doctor/dashboard" element={
                <ProtectedRoute allowedRoles={["doctor"]}>
                  <DoctorDashboard />
                </ProtectedRoute>
              } />

              <Route path="/doctor/notifications" element={
                <ProtectedRoute allowedRoles={["doctor"]}>
                  <DoctorNotifications />
                </ProtectedRoute>
              } />

              <Route path="/doctor/settings" element={
                <ProtectedRoute allowedRoles={["doctor"]}>
                  <DoctorSettings />
                </ProtectedRoute>
              } />

              <Route path="/doctor/messages" element={
                <ProtectedRoute allowedRoles={["doctor"]}>
                  <MessagesListPage />
                </ProtectedRoute>
              } />

              <Route path="/doctor/messages/:conversationId" element={
  <ProtectedRoute allowedRoles={["doctor"]}>
    <MessagesChatPage />
  </ProtectedRoute>
} />

              <Route path="/doctor/upload-documents" element={
                <ProtectedRoute allowedRoles={["doctor"]}>
                  <UploadDocumentsPage />
                </ProtectedRoute>
              } />

              <Route path="/doctor/upload-proof" element={
                <ProtectedRoute allowedRoles={["doctor"]}>
                  <UploadProofPage />
                </ProtectedRoute>
              } />

              <Route path="/doctor/verification-upload" element={<DoctorVerificationUploadPage />} />

              <Route path="/doctor/pending-verification" element={<PendingVerificationPage />} />
              <Route path="/doctor/pending-approval" element={<PendingVerificationPage />} />

              <Route path="/doctor/patients" element={
                <ProtectedRoute allowedRoles={["doctor"]}>
                  <PatientsListPage />
                </ProtectedRoute>
              } />

              <Route path="/doctor/scans" element={
                <ProtectedRoute allowedRoles={["doctor"]}>
                  <ScanReviewPage />
                </ProtectedRoute>
              } />

              <Route path="/doctor/scans/:id" element={
                <ProtectedRoute allowedRoles={["doctor"]}>
                  <ScanReviewPage />
                </ProtectedRoute>
              } />

              <Route path="/doctor/shared-scans/:patientId" element={
                <ProtectedRoute allowedRoles={["doctor"]}>
                  <ScanReviewPage />
                </ProtectedRoute>
              } />


              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Global Chatbot */}
            <ChatbotWidget />
          </Layout>
        </Router>
      </DoctorProvider>
    </AuthProvider>
  );
}

export { App };
