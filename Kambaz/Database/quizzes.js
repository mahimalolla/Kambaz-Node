// Database/quizzes.js
export default [
  {
    _id: "quiz1",
    title: "Introduction to React Quiz",
    description: "Test your knowledge of React fundamentals",
    courseId: "RS101", // Web Development course
    quizType: "Graded Quiz",
    points: 10,
    assignmentGroup: "Quizzes",
    shuffleAnswers: true,
    timeLimit: 20,
    multipleAttempts: false,
    attemptLimit: 1,
    showCorrectAnswers: "Immediately",
    accessCode: "",
    oneQuestionAtATime: false,
    webcamRequired: false,
    lockQuestionsAfterAnswering: false,
    due: "2025-06-30",
    dueTime: "23:59",
    availableFrom: "2025-06-01",
    availableFromTime: "00:00",
    availableUntil: "2025-06-30",
    availableUntilTime: "23:59",
    published: true,
    questions: [
      {
        _id: "q1",
        type: "multiple-choice",
        title: "Question 1",
        points: 2,
        question: "What is JSX?",
        choices: [
          "A JavaScript extension syntax",
          "A CSS framework", 
          "A database query language",
          "A server-side technology"
        ],
        correctAnswer: 0
      },
      {
        _id: "q2",
        type: "true-false", 
        title: "Question 2",
        points: 2,
        question: "React components must start with a capital letter.",
        correctAnswer: "true"
      },
      {
        _id: "q3",
        type: "fill-blank",
        title: "Question 3",
        points: 3,
        question: "The _____ hook is used to manage state in functional components.",
        possibleAnswers: ["useState", "use state", "usestate"]
      },
      {
        _id: "q4",
        type: "multiple-choice",
        title: "Question 4", 
        points: 3,
        question: "Which method is used to render a React component?",
        choices: [
          "ReactDOM.render()",
          "React.render()",
          "component.render()",
          "render.component()"
        ],
        correctAnswer: 0
      }
    ],
    createdAt: "2025-06-01T10:00:00Z",
    updatedAt: "2025-06-01T10:00:00Z"
  },
  {
    _id: "quiz2",
    title: "JavaScript Fundamentals",
    description: "Basic JavaScript concepts and syntax",
    courseId: "RS101", // Web Development course
    quizType: "Practice Quiz", 
    points: 15,
    assignmentGroup: "Quizzes",
    shuffleAnswers: true,
    timeLimit: 30,
    multipleAttempts: true,
    attemptLimit: 3,
    showCorrectAnswers: "After Last Attempt",
    accessCode: "",
    oneQuestionAtATime: true,
    webcamRequired: false,
    lockQuestionsAfterAnswering: true,
    due: "2025-07-15",
    dueTime: "23:59", 
    availableFrom: "2025-06-15",
    availableFromTime: "00:00",
    availableUntil: "2025-07-15",
    availableUntilTime: "23:59",
    published: true, // Changed to published for testing
    questions: [
      {
        _id: "q5",
        type: "multiple-choice",
        title: "Question 1",
        points: 3,
        question: "Which of the following is NOT a JavaScript data type?",
        choices: ["String", "Boolean", "Float", "Object"],
        correctAnswer: 2
      },
      {
        _id: "q6", 
        type: "true-false",
        title: "Question 2",
        points: 2,
        question: "JavaScript is a compiled language.",
        correctAnswer: "false"
      },
      {
        _id: "q7",
        type: "fill-blank",
        title: "Question 3", 
        points: 4,
        question: "The _____ operator is used to check both value and type equality in JavaScript.",
        possibleAnswers: ["===", "strict equality", "triple equals"]
      },
      {
        _id: "q8",
        type: "multiple-choice",
        title: "Question 4",
        points: 3,
        question: "What does 'DOM' stand for?",
        choices: [
          "Document Object Model",
          "Data Object Management", 
          "Dynamic Object Manipulation",
          "Document Oriented Modeling"
        ],
        correctAnswer: 0
      },
      {
        _id: "q9",
        type: "true-false",
        title: "Question 5",
        points: 3,
        question: "Variables declared with 'let' are function-scoped.",
        correctAnswer: "false"
      }
    ],
    createdAt: "2025-06-01T14:30:00Z",
    updatedAt: "2025-06-01T14:30:00Z"
  },
  {
    _id: "quiz3", 
    title: "Database Design Fundamentals",
    description: "Basic concepts of relational database design",
    courseId: "RS103", // Database Design course
    quizType: "Graded Quiz",
    points: 12,
    assignmentGroup: "Quizzes", 
    shuffleAnswers: false,
    timeLimit: 25,
    multipleAttempts: false,
    attemptLimit: 1,
    showCorrectAnswers: "After Due Date",
    accessCode: "",
    oneQuestionAtATime: false,
    webcamRequired: false,
    lockQuestionsAfterAnswering: false,
    due: "2025-08-01",
    dueTime: "23:59",
    availableFrom: "2025-07-01", 
    availableFromTime: "00:00",
    availableUntil: "2025-08-01",
    availableUntilTime: "23:59",
    published: true,
    questions: [
      {
        _id: "q10",
        type: "multiple-choice", 
        title: "Question 1",
        points: 3,
        question: "What does SQL stand for?",
        choices: ["Structured Query Language", "Simple Query Language", "Standard Query Language", "System Query Language"],
        correctAnswer: 0
      },
      {
        _id: "q11",
        type: "true-false",
        title: "Question 2", 
        points: 2,
        question: "A primary key can contain NULL values.",
        correctAnswer: "false"
      },
      {
        _id: "q12",
        type: "fill-blank",
        title: "Question 3",
        points: 3, 
        question: "The process of eliminating redundant data from a database is called _____.",
        possibleAnswers: ["normalization", "normalisation", "normal form"]
      },
      {
        _id: "q13",
        type: "multiple-choice",
        title: "Question 4",
        points: 4,
        question: "Which normal form eliminates transitive dependencies?",
        choices: ["1NF", "2NF", "3NF", "BCNF"],
        correctAnswer: 2
      }
    ],
    createdAt: "2025-06-01T16:00:00Z",
    updatedAt: "2025-06-01T16:00:00Z"
  },
  {
    _id: "quiz4",
    title: "Software Engineering Principles - DRAFT",
    description: "Understanding SDLC and design patterns",
    courseId: "RS102", // Software Engineering course
    quizType: "Graded Quiz",
    points: 20,
    assignmentGroup: "Quizzes",
    shuffleAnswers: true,
    timeLimit: 45,
    multipleAttempts: true,
    attemptLimit: 2,
    showCorrectAnswers: "Never",
    accessCode: "SE2024",
    oneQuestionAtATime: true,
    webcamRequired: true,
    lockQuestionsAfterAnswering: true,
    due: "2025-12-01",
    dueTime: "23:59",
    availableFrom: "2025-11-01",
    availableFromTime: "00:00",
    availableUntil: "2025-12-01",
    availableUntilTime: "23:59",
    published: false, // Unpublished draft quiz
    questions: [
      {
        _id: "q14",
        type: "multiple-choice",
        title: "Question 1",
        points: 5,
        question: "Which design pattern ensures a class has only one instance?",
        choices: ["Factory", "Singleton", "Observer", "Strategy"],
        correctAnswer: 1
      },
      {
        _id: "q15",
        type: "true-false",
        title: "Question 2",
        points: 3,
        question: "Agile methodology emphasizes comprehensive documentation over working software.",
        correctAnswer: "false"
      },
      {
        _id: "q16",
        type: "fill-blank",
        title: "Question 3",
        points: 4,
        question: "The _____ phase comes after the design phase in the traditional SDLC.",
        possibleAnswers: ["implementation", "coding", "development"]
      },
      {
        _id: "q17",
        type: "multiple-choice",
        title: "Question 4",
        points: 4,
        question: "What does SOLID stand for in software engineering?",
        choices: [
          "A set of programming principles",
          "A testing framework",
          "A database design pattern",
          "A project management methodology"
        ],
        correctAnswer: 0
      },
      {
        _id: "q18",
        type: "true-false",
        title: "Question 5",
        points: 4,
        question: "Unit testing should be performed before integration testing.",
        correctAnswer: "true"
      }
    ],
    createdAt: "2025-06-01T18:00:00Z",
    updatedAt: "2025-06-01T18:00:00Z"
  }
];
