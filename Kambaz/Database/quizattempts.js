export default [
  {
    _id: "attempt1",
    quizId: "quiz1",
    userId: "122", // Bob Smith (STUDENT)
    courseId: "RS101", // Web Development
    answers: {
      q1: 0, // correct - "A JavaScript extension syntax"
      q2: "true", // correct 
      q3: "useState", // correct
      q4: 0 // correct - "ReactDOM.render()"
    },
    score: 10,
    maxScore: 10,
    percentage: 100,
    timeSpent: 15, // minutes
    attemptNumber: 1,
    submittedAt: "2025-06-02T14:30:00Z"
  },
  {
    _id: "attempt2", 
    quizId: "quiz1",
    userId: "124", // Diana Prince (STUDENT)
    courseId: "RS101", // Web Development 
    answers: {
      q1: 1, // incorrect - chose "A CSS framework"
      q2: "true", // correct
      q3: "state", // incorrect - missing "use"
      q4: 0 // correct - "ReactDOM.render()"
    },
    score: 5,
    maxScore: 10,
    percentage: 50,
    timeSpent: 18, // minutes
    attemptNumber: 1,
    submittedAt: "2025-06-02T15:45:00Z"
  },
  {
    _id: "attempt3",
    quizId: "quiz2", 
    userId: "122", // Bob Smith taking JavaScript quiz
    courseId: "RS101", // Web Development
    answers: {
      q5: 2, // correct - "Float" is not a JS data type
      q6: "false", // correct - JS is interpreted, not compiled
      q7: "===", // correct
      q8: 0, // correct - "Document Object Model"
      q9: "true" // incorrect - let is block-scoped, not function-scoped
    },
    score: 12,
    maxScore: 15,
    percentage: 80,
    timeSpent: 25, // minutes
    attemptNumber: 1,
    submittedAt: "2025-06-16T10:20:00Z"
  },
  {
    _id: "attempt4",
    quizId: "quiz2",
    userId: "122", // Bob Smith, second attempt (quiz allows multiple attempts)
    courseId: "RS101", // Web Development
    answers: {
      q5: 2, // correct
      q6: "false", // correct
      q7: "strict equality", // correct (alternative answer)
      q8: 0, // correct
      q9: "false" // correct this time
    },
    score: 15,
    maxScore: 15,
    percentage: 100,
    timeSpent: 20, // minutes - faster second attempt
    attemptNumber: 2,
    submittedAt: "2025-06-16T16:45:00Z"
  },
  {
    _id: "attempt5",
    quizId: "quiz1",
    userId: "125", // Tony Stark (STUDENT)
    courseId: "RS101", // Web Development
    answers: {
      q1: 0, // correct
      q2: "false", // incorrect
      q3: "use state", // correct (alternative spelling)
      q4: 1 // incorrect - chose "React.render()"
    },
    score: 5,
    maxScore: 10,
    percentage: 50,
    timeSpent: 22, // minutes
    attemptNumber: 1,
    submittedAt: "2025-06-03T09:15:00Z"
  },
  {
    _id: "attempt6",
    quizId: "quiz1", 
    userId: "124", // Diana Prince, second attempt (if quiz allowed multiple attempts)
    courseId: "RS101", // Web Development
    answers: {
      q1: 0, // correct this time
      q2: "true", // correct
      q3: "usestate", // correct (alternative spelling)
      q4: 0 // correct
    },
    score: 10,
    maxScore: 10,
    percentage: 100,
    timeSpent: 12, // minutes - much faster on second try
    attemptNumber: 2,
    submittedAt: "2025-06-03T11:30:00Z"
  },
  {
    _id: "attempt7",
    quizId: "quiz2",
    userId: "125", // Tony Stark trying JavaScript quiz
    courseId: "RS101", // Web Development
    answers: {
      q5: 0, // incorrect - chose "String"
      q6: "true", // incorrect - said JS is compiled
      q7: "==", // incorrect - used == instead of ===
      q8: 1, // incorrect - chose "Data Object Management" 
      q9: "true" // incorrect
    },
    score: 0,
    maxScore: 15,
    percentage: 0,
    timeSpent: 30, // minutes - took full time but got everything wrong
    attemptNumber: 1,
    submittedAt: "2025-06-17T14:00:00Z"
  },
  {
    _id: "attempt8",
    quizId: "quiz3", // Database quiz
    userId: "122", // Bob Smith taking Database Design quiz
    courseId: "RS103", // Database Design
    answers: {
      q10: 0, // correct - "Structured Query Language"
      q11: "false", // correct - primary key cannot be NULL
      q12: "normalization", // correct
      q13: 2 // correct - 3NF eliminates transitive dependencies
    },
    score: 12,
    maxScore: 12,
    percentage: 100,
    timeSpent: 20, // minutes
    attemptNumber: 1,
    submittedAt: "2025-07-10T13:45:00Z"
  },
  {
    _id: "attempt9",
    quizId: "quiz3", // Database quiz
    userId: "124", // Diana Prince taking Database Design quiz
    courseId: "RS103", // Database Design
    answers: {
      q10: 0, // correct - "Structured Query Language"
      q11: "true", // incorrect - thought primary key can be NULL
      q12: "normal form", // correct (alternative answer)
      q13: 1 // incorrect - chose 2NF instead of 3NF
    },
    score: 7,
    maxScore: 12,
    percentage: 58,
    timeSpent: 23, // minutes
    attemptNumber: 1,
    submittedAt: "2025-07-11T10:20:00Z"
  },
  {
    _id: "attempt10",
    quizId: "quiz3", // Database quiz
    userId: "125", // Tony Stark struggling with Database quiz too
    courseId: "RS103", // Database Design
    answers: {
      q10: 1, // incorrect - chose "Simple Query Language"
      q11: "true", // incorrect
      q12: "cleaning", // incorrect answer
      q13: 0 // incorrect - chose 1NF
    },
    score: 0,
    maxScore: 12,
    percentage: 0,
    timeSpent: 25, // minutes - full time, no correct answers
    attemptNumber: 1,
    submittedAt: "2025-07-12T15:30:00Z"
  }
];
