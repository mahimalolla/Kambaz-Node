export default [
  {
    _id: "quiz1",
    title: "Introduction to React Quiz",
    description: "Test your knowledge of React fundamentals",
    courseId: "RS101", 
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
    courseId: "RS101", // Replace with your actual course ID
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
    published: false, // Unpublished quiz
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
    title: "CSS Basics - Unpublished",
    description: "Fundamentals of CSS styling",
    courseId: "RS101",
    quizType: "Graded Quiz",
    points: 8,
    assignmentGroup: "Quizzes", 
    shuffleAnswers: false,
    timeLimit: 15,
    multipleAttempts: false,
    attemptLimit: 1,
    showCorrectAnswers: "Never",
    accessCode: "CSS123",
    oneQuestionAtATime: false,
    webcamRequired: false,
    lockQuestionsAfterAnswering: false,
    due: "2025-08-01",
    dueTime: "23:59",
    availableFrom: "2025-07-01", 
    availableFromTime: "00:00",
    availableUntil: "2025-08-01",
    availableUntilTime: "23:59",
    published: false, // This one is unpublished for testing
    questions: [
      {
        _id: "q10",
        type: "multiple-choice", 
        title: "Question 1",
        points: 2,
        question: "Which CSS property is used to change text color?",
        choices: ["color", "text-color", "font-color", "foreground-color"],
        correctAnswer: 0
      },
      {
        _id: "q11",
        type: "true-false",
        title: "Question 2", 
        points: 2,
        question: "CSS stands for Cascading Style Sheets.",
        correctAnswer: "true"
      },
      {
        _id: "q12",
        type: "fill-blank",
        title: "Question 3",
        points: 4, 
        question: "The _____ property is used to set the background color of an element.",
        possibleAnswers: ["background-color", "background", "bg-color"]
      }
    ],
    createdAt: "2025-06-01T16:00:00Z",
    updatedAt: "2025-06-01T16:00:00Z"
  }
];
