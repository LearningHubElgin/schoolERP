const { sequelize } = require('../config/database');

const ActivityLogs = require('./ActivityLogs');
const Announcements = require('./Announcements');
const Assignments = require('./Assignments');
const AssignmentSubmissions = require('./AssignmentSubmissions');
const BonafideCertificates = require('./BonafideCertificates');
const CharacterCertificates = require('./CharacterCertificates');
const Classes = require('./Classes');
const ClassNotes = require('./ClassNotes');
const ClassSections = require('./ClassSections');
const ClassStreams = require('./ClassStreams');
const ClassSubjects = require('./ClassSubjects');
const CombinationSubjects = require('./CombinationSubjects');
const DaywiseAttendanceTeachers = require('./DaywiseAttendanceTeachers');
const Enquiries = require('./Enquiries');
const Events = require('./Events');
const ExamTerms = require('./ExamTerms');
const Expenses = require('./Expenses');
const FeeAdmission = require('./FeeAdmission');
const FeeColumnTypes = require('./FeeColumnTypes');
const FeeColumnValues = require('./FeeColumnValues');
const FeeRecords = require('./FeeRecords');
const FeeStructures = require('./FeeStructures');
const Forms = require('./Forms');
const Grievances = require('./Grievances');
const Holidays = require('./Holidays');
const LessonPlans = require('./LessonPlans');
const LessonPlanComments = require('./LessonPlanComments');
const LibraryBooks = require('./LibraryBooks');
const LibraryIssuedBooks = require('./LibraryIssuedBooks');
const MarksheetTemplates = require('./MarksheetTemplates');
const MarksAssignments = require('./MarksAssignments');
const NonTeachingStaff = require('./NonTeachingStaff');
const NonTeachingStaffAttendance = require('./NonTeachingStaffAttendance');
const NonTeachingStaffCards = require('./NonTeachingStaffCards');
const NonTeachingStaffShifts = require('./NonTeachingStaffShifts');
const Notices = require('./Notices');
const OnlineStudyVideos = require('./OnlineStudyVideos');
const PasswordResetTokens = require('./PasswordResetTokens');
const Quotations = require('./Quotations');
const Requisitions = require('./Requisitions');
const Schools = require('./Schools');
const SchoolSettings = require('./SchoolSettings');
const SchoolWeeklySchedule = require('./SchoolWeeklySchedule');
const SchoolWorkingDays = require('./SchoolWorkingDays');
const Sections = require('./Sections');
const Stores = require('./Stores');
const StoreBills = require('./StoreBills');
const StoreGrievances = require('./StoreGrievances');
const StoreInventory = require('./StoreInventory');
const StoreRequisitions = require('./StoreRequisitions');
const StoreTransactions = require('./StoreTransactions');
const Streams = require('./Streams');
const StreamCombinations = require('./StreamCombinations');
const Students = require('./Students');
const StudentsAttendance = require('./StudentsAttendance');
const StudentApplications = require('./StudentApplications');
const StudentCards = require('./StudentCards');
const StudentFeeDiscounts = require('./StudentFeeDiscounts');
const StudentGrievances = require('./StudentGrievances');
const StudentLeaves = require('./StudentLeaves');
const StudentMarks = require('./StudentMarks');
const StudentRequisition = require('./StudentRequisition');
const StudyNotes = require('./StudyNotes');
const StudyPlaylists = require('./StudyPlaylists');
const Subjects = require('./Subjects');
const Syllabus = require('./Syllabus');
const Teachers = require('./Teachers');
const TeachersRequisition = require('./TeachersRequisition');
const TeacherAttendance = require('./TeacherAttendance');
const TeacherClasses = require('./TeacherClasses');
const TeacherFullDetails = require('./TeacherFullDetails');
const TeacherGrievance = require('./TeacherGrievance');
const TeacherLeaves = require('./TeacherLeaves');
const TeacherPayslips = require('./TeacherPayslips');
const Tenders = require('./Tenders');
const Timetable = require('./Timetable');
const TimetableElectiveStudents = require('./TimetableElectiveStudents');
const TimetableView = require('./TimetableView');
const TimeSlots = require('./TimeSlots');
const Transactions = require('./Transactions');
const TransferCertificates = require('./TransferCertificates');
const TransportAssignments = require('./TransportAssignments');
const TransportDrivers = require('./TransportDrivers');
const TransportDriverAttendance = require('./TransportDriverAttendance');
const TransportVehicles = require('./TransportVehicles');
const Users = require('./Users');
const Vendors = require('./Vendors');
const VisitorApprovals = require('./VisitorApprovals');

// Base Model Exports
module.exports = {
    sequelize,
    ActivityLogs,
    Announcements,
    Assignments,
    AssignmentSubmissions,
    BonafideCertificates,
    CharacterCertificates,
    Classes,
    ClassNotes,
    ClassSections,
    ClassStreams,
    ClassSubjects,
    CombinationSubjects,
    DaywiseAttendanceTeachers,
    Enquiries,
    Events,
    ExamTerms,
    Expenses,
    FeeAdmission,
    FeeColumnTypes,
    FeeColumnValues,
    FeeRecords,
    FeeStructures,
    Forms,
    Grievances,
    Holidays,
    LessonPlans,
    LessonPlanComments,
    LibraryBooks,
    LibraryIssuedBooks,
    MarksheetTemplates,
    MarksAssignments,
    NonTeachingStaff,
    NonTeachingStaffAttendance,
    NonTeachingStaffCards,
    NonTeachingStaffShifts,
    Notices,
    OnlineStudyVideos,
    PasswordResetTokens,
    Quotations,
    Requisitions,
    Schools,
    SchoolSettings,
    SchoolWeeklySchedule,
    SchoolWorkingDays,
    Sections,
    Stores,
    StoreBills,
    StoreGrievances,
    StoreInventory,
    StoreRequisitions,
    StoreTransactions,
    Streams,
    StreamCombinations,
    Students,
    StudentsAttendance,
    StudentApplications,
    StudentCards,
    StudentFeeDiscounts,
    StudentGrievances,
    StudentLeaves,
    StudentMarks,
    StudentRequisition,
    StudyNotes,
    StudyPlaylists,
    Subjects,
    Syllabus,
    Teachers,
    TeachersRequisition,
    TeacherAttendance,
    TeacherClasses,
    TeacherFullDetails,
    TeacherGrievance,
    TeacherLeaves,
    TeacherPayslips,
    Tenders,
    Timetable,
    TimetableElectiveStudents,
    TimetableView,
    TimeSlots,
    Transactions,
    TransferCertificates,
    TransportAssignments,
    TransportDrivers,
    TransportDriverAttendance,
    TransportVehicles,
    Users,
    Vendors,
    VisitorApprovals,
    // Singular Aliases
    User: Users,
    School: Schools,
    Student: Students,
    Teacher: Teachers,
    FeeRecord: FeeRecords,
    StudentFeeDiscount: StudentFeeDiscounts,
    ActivityLog: ActivityLogs
};
