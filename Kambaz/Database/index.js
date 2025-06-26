// ================================
// USERS DATA
// ================================
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

// ================================
// COURSES DATA
// ================================
export let coursesData = [
  {
    _id: "RS101",
    name: "React and Single Page Applications",
    number: "CS5610",
    startDate: "2023-01-10",
    endDate: "2023-05-15",
    department: "D123",
    credits: 4,
    description: "This course provides students with hands-on experience developing single-page applications using React and related technologies."
  },
  {
    _id: "RS102", 
    name: "Node.js and Express",
    number: "CS5500",
    startDate: "2023-01-10",
    endDate: "2023-05-15",
    department: "D123",
    credits: 3,
    description: "Learn server-side development with Node.js, Express framework, and database integration."
  },
  {
    _id: "RS103",
    name: "Database Management",
    number: "CS3200",
    startDate: "2023-01-10", 
    endDate: "2023-05-15",
    department: "D134",
    credits: 4,
    description: "Introduction to database concepts, SQL, and database design principles."
  },
  {
    _id: "RS104",
    name: "JavaScript Fundamentals",
    number: "CS2500",
    startDate: "2023-01-10",
    endDate: "2023-05-15", 
    department: "D123",
    credits: 3,
    description: "Learn the fundamentals of JavaScript programming including ES6+ features."
  },
  {
    _id: "RS105",
    name: "Web Development Basics",
    number: "CS1100", 
    startDate: "2023-01-10",
    endDate: "2023-05-15",
    department: "D123",
    credits: 2,
    description: "Introduction to HTML, CSS, and basic web development concepts."
  },
  {
    _id: "RS106",
    name: "Machine Learning",
    number: "CS6140",
    startDate: "2023-01-10",
    endDate: "2023-05-15",
    department: "D134", 
    credits: 4,
    description: "Introduction to machine learning algorithms and applications."
  },
  {
    _id: "course-cs5610",
    name: "Web Development",
    number: "CS5610",
    startDate: "2023-01-10",
    endDate: "2023-05-15", 
    department: "D123",
    credits: 4,
    description: "Full stack web development with modern frameworks and technologies."
  }
];

// ================================
// MODULES DATA  
// ================================
export let modulesData = [
  {
    _id: "M101",
    name: "Introduction to React",
    description: "Learn the basics of React components and JSX",
    course: "RS101",
    lessons: [
      {
        _id: "L101",
        name: "What is React?",
        description: "Overview of React library",
        module: "M101"
      },
      {
        _id: "L102", 
        name: "Creating Components",
        description: "How to create React components",
        module: "M101"
      }
    ]
  },
  {
    _id: "M102",
    name: "State Management",
    description: "Managing component state in React",
    course: "RS101",
    lessons: [
      {
        _id: "L201",
        name: "useState Hook",
        description: "Using the useState hook for state management",
        module: "M102"
      },
      {
        _id: "L202",
        name: "useEffect Hook", 
        description: "Side effects and lifecycle with useEffect",
        module: "M102"
      }
    ]
  },
  {
    _id: "M103",
    name: "Express Fundamentals",
    description: "Building web servers with Express",
    course: "RS102",
    lessons: [
      {
        _id: "L301",
        name: "Setting up Express",
        description: "Creating your first Express server",
        module: "M103"
      },
      {
        _id: "L302",
        name: "Routing",
        description: "Handling different routes in Express", 
        module: "M103"
      }
    ]
  },
  {
    _id: "M104",
    name: "Database Connections",
    description: "Connecting Node.js to databases",
    course: "RS102",
    lessons: [
      {
        _id: "L401",
        name: "MongoDB with Mongoose",
        description: "Using Mongoose ODM with MongoDB",
        module: "M104"
      }
    ]
  },
  {
    _id: "M105",
    name: "SQL Basics", 
    description: "Introduction to SQL queries",
    course: "RS103",
    lessons: [
      {
        _id: "L501",
        name: "SELECT Statements",
        description: "Basic data retrieval with SELECT",
        module: "M105"
      },
      {
        _id: "L502",
        name: "JOINs",
        description: "Combining data from multiple tables",
        module: "M105"
      }
    ]
  }
];

// ================================
// ASSIGNMENTS DATA
// ================================
export let assignmentsData = [
  {
    _id: "A101",
    title: "React Component Lab",
    course: "RS101",
    availableDate: "2023-05-13",
    dueDate: "2023-05-20", 
    points: 100,
    description: "Create a React application with multiple components"
  },
  {
    _id: "A102",
    title: "State Management Exercise",
    course: "RS101",
    availableDate: "2023-05-20",
    dueDate: "2023-05-27",
    points: 100,
    description: "Build an interactive React app using hooks"
  },
  {
    _id: "A103", 
    title: "Express Server Setup",
    course: "RS102",
    availableDate: "2023-05-13",
    dueDate: "2023-05-20",
    points: 100,
    description: "Create a RESTful API with Express"
  },
  {
    _id: "A104",
    title: "Database Integration",
    course: "RS102", 
    availableDate: "2023-05-20",
    dueDate: "2023-05-27",
    points: 100,
    description: "Connect your Express app to MongoDB"
  },
  {
    _id: "A105",
    title: "SQL Query Practice",
    course: "RS103",
    availableDate: "2023-05-13",
    dueDate: "2023-05-20",
    points: 100,
    description: "Complete a series of SQL exercises"
  }
];

// ================================
// ENROLLMENTS DATA
// ================================
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
  { _id: "13", user: "122", course: "course-cs5610" }, // Bob enrolled in Web Dev
  { _id: "14", user: "121", course: "course-cs5610" }, // Alice teaches Web Dev
  { _id: "15", user: "123", course: "course-cs5610" }, // Charlie teaches Web Dev
];

// ================================
// QUIZ DATA STRUCTURES (NEW!)
// ================================
export let quizzes = [];
export let quizAttempts = [];

// ================================
// LEGACY EXPORTS FOR COMPATIBILITY
// ================================
export const courses = coursesData;
export const modules = modulesData;
export const assignments = assignmentsData;

// ================================
// USER CRUD OPERATIONS
// ================================
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

// ================================
// COURSE CRUD OPERATIONS
// ================================
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

// ================================
// MODULE CRUD OPERATIONS
// ================================
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

// ================================
// ASSIGNMENT CRUD OPERATIONS
// ================================
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

// ================================
// ENROLLMENT CRUD OPERATIONS
// ================================
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

export default {
  users,
  enrollments,
  coursesData,
  modulesData, 
  assignmentsData,
  courses,
  modules,
  assignments,
  quizzes,        // ← Quiz data that the DAO needs
  quizAttempts    // ← Quiz attempts data that the DAO needs
};
