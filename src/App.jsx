import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
// import useInactivityLogout from './utils/useInactivityLogout';
import useDynamicFavicon from './utils/useDynamicFavicon';
import { Toaster } from 'react-hot-toast';
import SessionExpiredModal from './components/ui/SessionExpiredModal';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ResetPassword from './pages/ResetPassword';
import PrivacyPolicy from './pages/PrivacyPolicy';
import DeleteAccount from './pages/DeleteAccount';

// ========== Static Portal Components ==========

// Student Portal
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import StudentFees from './pages/student/StudentFees';
import StudentAttendance from './pages/student/StudentAttendance';
import SubmitGrievance from './pages/student/SubmitGrievance';
import StudentOnlineStudy from './pages/student/StudentOnlineStudy';
import StudentTimeTable from './pages/student/StudentTimeTable';
import StudentRequisition from './pages/student/StudentRequisition';
import StudentLibraryBooks from './pages/student/StudentLibraryBooks';
import StudentSyllabus from './pages/student/StudentSyllabus';
import StudentAssignments from './pages/student/StudentAssignments';
import StudentHolidays from './pages/student/StudentHolidays';
import StudentLeave from './pages/student/StudentLeave';
import StudentForms from './pages/student/StudentForms';
import StudentCards from './pages/student/StudentCards';
import StudentStorePurchases from './pages/student/StudentStorePurchases';
import StudentMarksheets from './pages/student/StudentMarksheets';
import StudentTrackVehicle from './pages/student/TrackVehicle';

// Teacher Portal
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherProfile from './pages/teacher/TeacherProfile';
import TeacherSelfAttendance from './pages/teacher/TeacherSelfAttendance';
import TakeAttendance from './pages/teacher/TakeAttendance';
import CreateRequisition from './pages/teacher/TeacherRequisition';
import TeacherTimeTable from './pages/teacher/TeacherTimeTable';
import TeacherGrievance from './pages/teacher/TeacherGrievance';
import TeacherAssignments from './pages/teacher/TeacherAssignments';
import TeacherHolidays from './pages/teacher/TeacherHolidays';
import TeacherLeave from './pages/teacher/TeacherLeave';
import TeacherPayslips from './pages/teacher/TeacherPayslips';
import TeacherStorePurchases from './pages/teacher/TeacherStorePurchases';
import TeacherStudents from './pages/teacher/TeacherStudents';
import TeacherMarksEntry from './pages/teacher/TeacherMarksEntry';
import TeacherStudentManagement from './pages/teacher/TeacherStudentManagement';
import TeacherLessonPlan from './pages/teacher/TeacherLessonPlan';
import TeacherSyllabusManagement from './pages/teacher/TeacherSyllabusManagement';
import AdminLeaveApproval from './pages/admin/AdminLeaveApproval';
import AdminForms from './pages/admin/AdminForms';
import AdminCards from './pages/admin/AdminCards';

// Accounts Portal
import AccountsDashboard from './pages/accounts/AccountsDashboard';
import FeeManagement from './pages/accounts/FeeCollect';
import ExpenseManagement from './pages/accounts/ExpenseManagement';
import AccountsReports from './pages/accounts/AccountsReports';
import AccountsRequisition from './pages/accounts/AccountsRequisition';
import SalaryManagement from './pages/accounts/SalaryManagement';
import AccountsAnalytics from './pages/accounts/AccountsAnalytics';

// Admin Portal
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import AdminFeeManagement from './pages/admin/FeeManagement';
import AdminFeeTransactions from './pages/admin/AdminFeeTransactions';
import AdminStudentFeeSetup from './pages/admin/AdminStudentFeeSetup';
import RequisitionApproval from './pages/admin/RequisitionApproval';
import GrievanceManagement from './pages/admin/GrievanceManagement';
import StudentManagement from './pages/admin/StudentManagement';
import TeacherManagement from './pages/admin/TeacherManagement';
import AdminTeacherTimeTable from './pages/admin/AdminTeacherTimeTable';
import AdminStudentTimeTable from './pages/admin/AdminStudentTimeTable';
import ManageAcademic from './pages/admin/ManageAcademic';
import AdminEventsNotices from './pages/admin/AdminEventsNotices';
import ClassConfiguration from './pages/admin/ClassConfiguration';
import SyllabusManagement from './pages/admin/SyllabusManagement';
import AdminPayslips from './pages/admin/AdminPayslips';
import AdminTeacherAttendance from './pages/admin/AdminTeacherAttendance';
import AdminSchoolSettings from './pages/admin/AdminSchoolSettings';
import AdminMarksManagement from './pages/admin/AdminMarksManagement';
import MarksheetTemplateEditor from './pages/admin/MarksheetTemplateEditor';
import AdminElectiveGroups from './pages/admin/AdminElectiveGroups';
import AdminHolidayManagement from './pages/admin/AdminHolidayManagement';
import AdminStudentAttendanceConfig from './pages/admin/AdminStudentAttendanceConfig';
import StudentAttendanceReport from './pages/admin/StudentAttendanceReport';
import ActivityLogs from './pages/admin/ActivityLogs';
import AdminVisitorApproval from './pages/admin/AdminVisitorApproval';
import AdminVisitorAppointments from './pages/admin/AdminVisitorAppointments';
import AdminTransport from './pages/admin/AdminTransport';
import AdminAssignStudentToVehical from './pages/admin/AdminAssignStudentToVehical';
import DriverDetails from './pages/admin/DriverDetails';
import DriverAttendance from './pages/admin/DriverAttendance';
import TrackVehicle from './pages/admin/TrackVehicle';
import AdminNonTeachingStaffAttendance from './pages/admin/AdminNonTeachingStaffAttendance';
import AdminNonTeachingStaffAssignWork from './pages/admin/AdminNonTeachingStaffAssignWork';
import AdminNonTeachingStaffList from './pages/admin/AdminNonTeachingStaffList';
import AdminNonTeachingStaffIdCard from './pages/admin/AdminNonTeachingStaffIdCard';
import AdminNonTeachingStaffShiftTime from './pages/admin/AdminNonTeachingStaffShiftTime';
import AdminBonafideCertificate from './pages/admin/AdminBonafideCertificate';
import AdminCharacterCertificate from './pages/admin/AdminCharacterCertificate';
import AdminTransferCertificate from './pages/admin/AdminTransferCertificate';
import AdminEnquiryManagement from './pages/admin/AdminEnquiryManagement';
import TeacherPermissions from './pages/admin/TeacherPermissions';
import AdminActivityLog from './pages/admin/AdminActivityLog';
import AdminLessonPlanDashboard from './pages/admin/AdminLessonPlanDashboard';
import AdminAdmissionReport from './pages/admin/AdminAdmissionReport';
import PassoutStudents from './pages/admin/PassoutStudents';

// Admission Portal
import AdmissionDashboard from './pages/admission/AdmissionDashboard';
import ApplicationsList from './pages/admission/ApplicationsList';
import ApplicationDetails from './pages/admission/ApplicationDetails';
import NewApplication from './pages/admission/NewApplication';
import AdmissionReports from './pages/admission/AdmissionReports';

// Library Portal
import LibraryDashboard from './pages/library/LibraryDashboard';
import BookCatalog from './pages/library/BookCatalog';
import IssueBook from './pages/library/IssueBook';
import ReturnBook from './pages/library/ReturnBook';
import IssuedBooks from './pages/library/IssuedBooks';
import OnlineStudy from './pages/library/OnlineStudy';
import AddBook from './pages/library/AddBook';
import ReturnBookHistory from './pages/library/ReturnBookHistory';

// Store Manager Portal
import StoreDashboard from './pages/store/StoreDashboard';
import StoreInventoryOverview from './pages/store/StoreInventoryOverview';
import StoreReportsOverview from './pages/store/StoreReportsOverview';
import StoreGrievance from './pages/store/StoreGrievance';
import StoreRequisition from './pages/store/StoreRequisition';
import IndividualStoreDashboard from './pages/store/IndividualStoreDashboard';
import StorePOS from './pages/store/StorePOS';
import StoreInventory from './pages/store/StoreInventory';
import StoreReports from './pages/store/StoreReports';
import StoreTransactions from './pages/store/StoreTransactions';

// Security Guard Portal
import SecurityDashboard from './pages/securityGuard/SecurityDashboard';
import NewVisitor from './pages/securityGuard/NewVisitor';
import VisitorsLog from './pages/securityGuard/VisitorsLog';
import AppointmentsList from './pages/securityGuard/AppointmentsList';

// Non-Teaching Staff Portal
import NonTeachingStaffDashboard from './pages/nonTeachingStaff/NonTeachingStaffDashboard';
import NonTeachingStaffSelfAttendance from './pages/nonTeachingStaff/NonTeachingStaffSelfAttendance';
import NonTeachingStaffProfile from './pages/nonTeachingStaff/NonTeachingStaffProfile';
import NonTeachingStaffAssignWork from './pages/nonTeachingStaff/NonTeachingStaffAssignWork';
import NonTeachingStaffIdCard from './pages/nonTeachingStaff/NonTeachingStaffIdCard';
import NonTeachingStaffShiftTime from './pages/nonTeachingStaff/NonTeachingStaffShiftTime';

// Transport Portal
import DriverTravel from './pages/transport/DriverTravel';
import DriverProfile from './pages/transport/DriverProfile';
import DriverSelfAttendance from './pages/transport/DriverSelfAttendance';

// Super Admin Portal
import SuperAdminDashboard from './pages/superAdmin/SuperAdminDashboard';
import AddSchool from './pages/superAdmin/AddSchool';
import ViewSchools from './pages/superAdmin/ViewSchools';

// Helper components
const DynamicFaviconRenderer = () => {
  useDynamicFavicon();
  return null;
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    const roleRedirects = {
      student: '/student/dashboard',
      teacher: '/teacher/dashboard',
      accountant: '/accounts/dashboard',
      admin: '/admin/dashboard',
      admission: '/admission/dashboard',
      librarian: '/library/dashboard',
      storemanager: '/store/dashboard',
      security: '/security/dashboard',
      driver: '/transport/my-travel',
      nonteachingstaff: '/nonTeachingStaff/dashboard'
    };
    return <Navigate to={roleRedirects[userRole] || '/'} replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <DynamicFaviconRenderer />
        <Routes>
          {/* Default Route shows the Landing Page */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/delete-account" element={<DeleteAccount />} />

          {/* Student Portal */}
          <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><Layout role="student" /></ProtectedRoute>}>
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="fees" element={<StudentFees />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="timetable" element={<StudentTimeTable />} />
            <Route path="online-study" element={<StudentOnlineStudy />} />
            <Route path="requisition" element={<StudentRequisition />} />
            <Route path="library" element={<StudentLibraryBooks />} />
            <Route path="grievance" element={<SubmitGrievance />} />
            <Route path="syllabus" element={<StudentSyllabus />} />
            <Route path="assignments" element={<StudentAssignments />} />
            <Route path="holidays" element={<StudentHolidays />} />
            <Route path="leave" element={<StudentLeave />} />
            <Route path="forms" element={<StudentForms />} />
            <Route path="cards" element={<StudentCards />} />
            <Route path="store-purchases" element={<StudentStorePurchases />} />
            <Route path="marksheets" element={<StudentMarksheets />} />
            <Route path="track-vehicle" element={<StudentTrackVehicle />} />
          </Route>

          {/* Teacher Portal */}
          <Route path="/teacher" element={<ProtectedRoute allowedRoles={['teacher']}><Layout role="teacher" /></ProtectedRoute>}>
            <Route index element={<Navigate to="/teacher/dashboard" replace />} />
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="profile" element={<TeacherProfile />} />
            <Route path="self-attendance" element={<TeacherSelfAttendance />} />
            <Route path="attendance" element={<TakeAttendance />} />
            <Route path="students" element={<TeacherStudents />} />
            <Route path="requisition" element={<CreateRequisition />} />
            <Route path="timetable" element={<TeacherTimeTable />} />
            <Route path="grievance" element={<TeacherGrievance />} />
            <Route path="assignments" element={<TeacherAssignments />} />
            <Route path="holidays" element={<TeacherHolidays />} />
            <Route path="leave" element={<TeacherLeave />} />
            <Route path="payslips" element={<TeacherPayslips />} />
            <Route path="store-purchases" element={<TeacherStorePurchases />} />
            <Route path="marks-entry" element={<TeacherMarksEntry />} />
            <Route path="manage-students" element={<TeacherStudentManagement />} />
            <Route path="lesson-plans" element={<TeacherLessonPlan />} />
            <Route path="syllabus" element={<TeacherSyllabusManagement />} />
          </Route>

          {/* Accounts Portal */}
          <Route path="/accounts" element={<ProtectedRoute allowedRoles={['accountant']}><Layout role="accounts" /></ProtectedRoute>}>
            <Route index element={<Navigate to="/accounts/dashboard" replace />} />
            <Route path="dashboard" element={<AccountsDashboard />} />
            <Route path="fees" element={<FeeManagement />} />
            <Route path="fee-transactions" element={<AdminFeeTransactions />} />
            <Route path="fee-student-setup" element={<AdminStudentFeeSetup />} />
            <Route path="expenses" element={<ExpenseManagement />} />
            <Route path="reports" element={<AccountsReports />} />
            <Route path="analytics" element={<AccountsAnalytics />} />
            <Route path="requisitions" element={<AccountsRequisition />} />
            <Route path="payslips" element={<SalaryManagement />} />
          </Route>

          {/* Admin Portal */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Layout role="admin" /></ProtectedRoute>}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="fees" element={<AdminFeeManagement />} />
            <Route path="fee-transactions" element={<AdminFeeTransactions />} />
            <Route path="fee-student-setup" element={<AdminStudentFeeSetup />} />
            <Route path="requisitions" element={<RequisitionApproval />} />
            <Route path="grievances" element={<GrievanceManagement />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="student-joining-report" element={<AdminAdmissionReport />} />
            <Route path="teachers" element={<TeacherManagement />} />
            <Route path="teacher-permissions" element={<TeacherPermissions />} />
            <Route path="activity-log" element={<AdminActivityLog />} />
            <Route path="nonteaching-staff-attendance" element={<AdminNonTeachingStaffAttendance />} />
            <Route path="nonteaching-staff-assign-work" element={<AdminNonTeachingStaffAssignWork />} />
            <Route path="nonteaching-staff-list" element={<AdminNonTeachingStaffList />} />
            <Route path="nonteaching-staff-cards" element={<AdminNonTeachingStaffIdCard />} />
            <Route path="nonteaching-staff-shift-time" element={<AdminNonTeachingStaffShiftTime />} />
            <Route path="teacher-timetable" element={<AdminTeacherTimeTable />} />
            <Route path="student-timetable" element={<AdminStudentTimeTable />} />
            <Route path="academic" element={<ManageAcademic />} />
            <Route path="events-notices" element={<AdminEventsNotices />} />
            <Route path="class-config" element={<ClassConfiguration />} />
            <Route path="syllabus" element={<SyllabusManagement />} />
            <Route path="leaves" element={<AdminLeaveApproval />} />
            <Route path="forms" element={<AdminForms />} />
            <Route path="cards" element={<AdminCards />} />
            <Route path="payslips" element={<AdminPayslips />} />
            <Route path="attendance-dashboard" element={<AdminTeacherAttendance />} />
            <Route path="school-settings" element={<AdminSchoolSettings />} />
            <Route path="marks" element={<AdminMarksManagement />} />
            <Route path="marksheet-templates" element={<MarksheetTemplateEditor />} />
            <Route path="elective-groups" element={<AdminElectiveGroups />} />
            <Route path="holidays" element={<AdminHolidayManagement />} />
            <Route path="student-attendance-config" element={<AdminStudentAttendanceConfig />} />
            <Route path="student-attendance-report" element={<StudentAttendanceReport />} />
            <Route path="visitor-approval" element={<AdminVisitorApproval />} />
            <Route path="visitor-appointments" element={<AdminVisitorAppointments />} />
            <Route path="transport" element={<AdminTransport />} />
            <Route path="drivers" element={<DriverDetails />} />
            <Route path="assign-student-vehical" element={<AdminAssignStudentToVehical />} />
            <Route path="driver-attendance" element={<DriverAttendance />} />
            <Route path="track-vehicle" element={<TrackVehicle />} />
            <Route path="bonafide-certificate" element={<AdminBonafideCertificate />} />
            <Route path="character-certificate" element={<AdminCharacterCertificate />} />
            <Route path="transfer-certificate" element={<AdminTransferCertificate />} />
            <Route path="enquiries" element={<AdminEnquiryManagement />} />
            <Route path="syllabus-progress" element={<AdminLessonPlanDashboard />} />
            <Route path="passout-students" element={<PassoutStudents />} />
            <Route path="activity-logs" element={<ActivityLogs />} />

          </Route>

          {/* Admission Portal */}
          <Route path="/admission" element={<ProtectedRoute allowedRoles={['admission']}><Layout role="admission" /></ProtectedRoute>}>
            <Route index element={<Navigate to="/admission/dashboard" replace />} />
            <Route path="dashboard" element={<AdmissionDashboard />} />
            <Route path="applications" element={<ApplicationsList />} />
            <Route path="applications/:id" element={<ApplicationDetails />} />
            <Route path="new-application" element={<NewApplication />} />
            <Route path="reports" element={<AdmissionReports />} />
          </Route>

          {/* Library Portal */}
          <Route path="/library" element={<ProtectedRoute allowedRoles={['librarian']}><Layout role="library" /></ProtectedRoute>}>
            <Route index element={<Navigate to="/library/dashboard" replace />} />
            <Route path="dashboard" element={<LibraryDashboard />} />
            <Route path="catalog" element={<BookCatalog />} />
            <Route path="issue" element={<IssueBook />} />
            <Route path="return" element={<ReturnBook />} />
            <Route path="issued" element={<IssuedBooks />} />
            <Route path="history" element={<ReturnBookHistory />} />
            <Route path="add-book" element={<AddBook />} />
            <Route path="online-study" element={<OnlineStudy />} />
          </Route>

          {/* Store Manager Portal */}
          <Route path="/store" element={<ProtectedRoute allowedRoles={['storemanager']}><Layout role="storemanager" /></ProtectedRoute>}>
            <Route index element={<Navigate to="/store/dashboard" replace />} />
            <Route path="dashboard" element={<StoreDashboard />} />
            <Route path="inventory-overview" element={<StoreInventoryOverview />} />
            <Route path="reports-overview" element={<StoreReportsOverview />} />
            <Route path="grievances" element={<StoreGrievance />} />
            <Route path="requisitions" element={<StoreRequisition />} />
            <Route path=":storeSlug/dashboard" element={<IndividualStoreDashboard />} />
            <Route path=":storeSlug/pos" element={<StorePOS />} />
            <Route path=":storeSlug/inventory" element={<StoreInventory />} />
            <Route path=":storeSlug/reports" element={<StoreReports />} />
            <Route path=":storeSlug/transactions" element={<StoreTransactions />} />
          </Route>

          {/* Security Guard Portal */}
          <Route path="/security" element={<ProtectedRoute allowedRoles={['security']}><Layout role="security" /></ProtectedRoute>}>
            <Route index element={<Navigate to="/security/dashboard" replace />} />
            <Route path="dashboard" element={<SecurityDashboard />} />
            <Route path="new-visitor" element={<NewVisitor />} />
            <Route path="visitors-log" element={<VisitorsLog />} />
            <Route path="appointments" element={<AppointmentsList />} />
          </Route>

          {/* Non-Teaching Staff Portal */}
          <Route path="/nonTeachingStaff" element={<ProtectedRoute allowedRoles={['nonteachingstaff']}><Layout role="nonteachingstaff" /></ProtectedRoute>}>
            <Route index element={<Navigate to="/nonTeachingStaff/dashboard" replace />} />
            <Route path="dashboard" element={<NonTeachingStaffDashboard />} />
            <Route path="attendance" element={<NonTeachingStaffSelfAttendance />} />
            <Route path="profile" element={<NonTeachingStaffProfile />} />
            <Route path="id-card" element={<NonTeachingStaffIdCard />} />
            <Route path="assigned-work" element={<NonTeachingStaffAssignWork />} />
            <Route path="shift-time" element={<NonTeachingStaffShiftTime />} />
          </Route>

          {/* Transport Portal */}
          <Route path="/transport" element={<ProtectedRoute allowedRoles={['driver']}><Layout role="driver" /></ProtectedRoute>}>
            <Route index element={<Navigate to="/transport/my-travel" replace />} />
            <Route path="my-travel" element={<DriverTravel />} />
            <Route path="self-attendance" element={<DriverSelfAttendance />} />
            <Route path="profile" element={<DriverProfile />} />
          </Route>

          {/* Super Admin Portal */}
          <Route path="/superadmin" element={<ProtectedRoute allowedRoles={['superadmin']}><Layout role="superadmin" /></ProtectedRoute>}>
            <Route index element={<Navigate to="/superadmin/dashboard" replace />} />
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="add-school" element={<AddSchool />} />
            <Route path="view-schools" element={<ViewSchools />} />
            <Route path="activity-logs" element={<ActivityLogs />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <SessionExpiredModal />
    </Router>
  );
}

export default App;