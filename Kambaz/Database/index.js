import courses from "./courses.json";
import modules from "./modules.json"; 
import assignments from "./assignments.json";

// Add the iron_man account and update existing users
export let users = [
  {
    _id: "121",
    username: "alice_johnson",
    password: "password123",
    firstName: "Alice",
    lastName: "Johnson", 
    email: "alice.johnson@northeastern.edu",
    dob: "1985-08-15",
    role: "FACULTY",
    loginTime: undefined,
    lastActivity: undefined
  },
  {
    _id: "122",
    username: "bob_smith", 
    password: "password123",
    firstName: "Bob",
    lastName: "Smith",
    email: "bob.smith@northeastern.edu",
    dob: "1999-03-22", 
    role: "STUDENT",
    loginTime: undefined,
    lastActivity: undefined
  },
  {
    _id: "123",
    username: "charlie_wilson",
    password: "password123",
    firstName: "Charlie", 
    lastName: "Wilson",
    email: "charlie.wilson@northeastern.edu",
    dob: "1988-11-05",
    role: "FACULTY",
    loginTime: undefined,
    lastActivity: undefined
  },
  {
    _id: "124", 
    username: "diana_prince",
    password: "password123",
    firstName: "Diana",
    lastName: "Prince",
    email: "diana.prince@northeastern.edu",
    dob: "2000-07-12",
    role: "STUDENT",
    loginTime: undefined,
    lastActivity: undefined
  },
  {
    _id: "125",
    username: "iron_man",
    password: "stark123",
    firstName: "Tony",
    lastName: "Stark",
    email: "tony.stark@northeastern.edu",
    dob: "1970-05-29",
    role: "STUDENT",
    loginTime: undefined,
    lastActivity: undefined
  },
  {
    _id: "126",
    username: "alice",
    password: "123",
    firstName: "Alice",
    lastName: "Wonderland",
    email: "alice.wonderland@northeastern.edu",
    dob: "1995-03-15",
    role: "STUDENT",
    loginTime: undefined,
    lastActivity: undefined
  }
];

export let enrollments = [
  { _id: "1", user: "122", course: "RS101" }, // Bob enrolled in React
  { _id: "2", user: "122", course: "RS102" }, // Bob enrolled in Node  
  { _id: "3", user: "124", course: "RS101" }, // Diana enrolled in React
  { _id: "4", user: "124", course: "RS103" }, // Diana enrolled in Database
  { _id: "5", user: "121", course: "RS101" }, // Alice teaches React
  { _id: "6", user: "121", course: "RS102" }, // Alice teaches Node
  { _id: "7", user: "121", course: "RS103" }, // Alice teaches Database
  { _id: "8", user: "123", course: "RS101" }, // Charlie teaches React
  { _id: "9", user: "123", course: "RS102" }, // Charlie teaches Node
  { _id: "10", user: "125", course: "RS101" }, // Iron Man enrolled in React
  { _id: "11", user: "125", course: "RS106" }, // Iron Man enrolled in ML
  { _id: "12", user: "126", course: "RS102" }, // Alice W enrolled in Software Engineering
];

// 👈 ADD THESE QUIZ DATA STRUCTURES
export let quizzes = [];
export let quizAttempts = [];

// Make the imported data mutable for CRUD operations
export let coursesData = [...courses];
export let modulesData = [...modules];
export let assignmentsData = [...assignments];

// Export the original data as well for reference
export { courses, modules, assignments };

// User CRUD Operations - REQUIRED FOR AUTHENTICATION
export const findUserByCredentials = (username, password) => {
  return users.find(user => user.username === username && user.password === password);
};

export const findUserById = (id) => {
  return users.find(user => user._id === id);
};

export const findUserByUsername = (username) => {
  return users.find(user => user.username === username);
};

export const updateUser = (userId, updates) => {
  const userIndex = users.findIndex(user => user._id === userId);
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...updates };
    return users[userIndex];
  }
  return null;
};

export const createUser = (userData) => {
  const newUser = {
    _id: Date.now().toString(),
    ...userData
  };
  users.push(newUser);
  return newUser;
};

// Course CRUD Operations
export const getCoursesByUser = (userId) => {
  const userEnrollments = enrollments.filter(enrollment => enrollment.user === userId);
  return coursesData.filter(course => 
    userEnrollments.some(enrollment => enrollment.course === course._id)
  );
};

export const getAllCourses = () => {
  return coursesData;
};

export const findCourseById = (courseId) => {
  return coursesData.find(course => course._id === courseId);
};

export const createCourse = (courseData) => {
  const newCourse = {
    _id: Date.now().toString(),
    ...courseData
  };
  coursesData.push(newCourse);
  return newCourse;
};

export const updateCourse = (courseId, updates) => {
  const courseIndex = coursesData.findIndex(course => course._id === courseId);
  if (courseIndex !== -1) {
    coursesData[courseIndex] = { ...coursesData[courseIndex], ...updates };
    return coursesData[courseIndex];
  }
  return null;
};

export const deleteCourse = (courseId) => {
  const courseIndex = coursesData.findIndex(course => course._id === courseId);
  if (courseIndex !== -1) {
    coursesData.splice(courseIndex, 1);
    // Also remove related enrollments
    enrollments = enrollments.filter(enrollment => enrollment.course !== courseId);
    return true;
  }
  return false;
};

// Module CRUD Operations
export const getModulesByCourse = (courseId) => {
  return modulesData.filter(module => module.course === courseId);
};

export const findModuleById = (moduleId) => {
  return modulesData.find(module => module._id === moduleId);
};

export const createModule = (moduleData) => {
  const newModule = {
    _id: Date.now().toString(),
    ...moduleData
  };
  modulesData.push(newModule);
  return newModule;
};

export const updateModule = (moduleId, updates) => {
  const moduleIndex = modulesData.findIndex(module => module._id === moduleId);
  if (moduleIndex !== -1) {
    modulesData[moduleIndex] = { ...modulesData[moduleIndex], ...updates };
    return modulesData[moduleIndex];
  }
  return null;
};

export const deleteModule = (moduleId) => {
  const moduleIndex = modulesData.findIndex(module => module._id === moduleId);
  if (moduleIndex !== -1) {
    modulesData.splice(moduleIndex, 1);
    return true;
  }
  return false;
};

// Assignment CRUD Operations
export const getAssignmentsByCourse = (courseId) => {
  return assignmentsData.filter(assignment => assignment.course === courseId);
};

export const findAssignmentById = (assignmentId) => {
  return assignmentsData.find(assignment => assignment._id === assignmentId);
};

export const createAssignment = (assignmentData) => {
  const newAssignment = {
    _id: Date.now().toString(),
    ...assignmentData
  };
  assignmentsData.push(newAssignment);
  return newAssignment;
};

export const updateAssignment = (assignmentId, updates) => {
  const assignmentIndex = assignmentsData.findIndex(assignment => assignment._id === assignmentId);
  if (assignmentIndex !== -1) {
    assignmentsData[assignmentIndex] = { ...assignmentsData[assignmentIndex], ...updates };
    return assignmentsData[assignmentIndex];
  }
  return null;
};

export const deleteAssignment = (assignmentId) => {
  const assignmentIndex = assignmentsData.findIndex(assignment => assignment._id === assignmentId);
  if (assignmentIndex !== -1) {
    assignmentsData.splice(assignmentIndex, 1);
    return true;
  }
  return false;
};

// Enrollment CRUD Operations
export const enrollUserInCourse = (userId, courseId) => {
  const newEnrollment = {
    _id: Date.now().toString(),
    user: userId,
    course: courseId
  };
  enrollments.push(newEnrollment);
  return newEnrollment;
};

export const unenrollUserFromCourse = (userId, courseId) => {
  const enrollmentIndex = enrollments.findIndex(
    enrollment => enrollment.user === userId && enrollment.course === courseId
  );
  if (enrollmentIndex !== -1) {
    enrollments.splice(enrollmentIndex, 1);
    return true;
  }
  return false;
};

export const isUserEnrolledInCourse = (userId, courseId) => {
  return enrollments.some(enrollment => enrollment.user === userId && enrollment.course === courseId);
};

export const getEnrollmentsByUser = (userId) => {
  return enrollments.filter(enrollment => enrollment.user === userId);
};

export const getEnrollmentsByCourse = (courseId) => {
  return enrollments.filter(enrollment => enrollment.course === courseId);
};
