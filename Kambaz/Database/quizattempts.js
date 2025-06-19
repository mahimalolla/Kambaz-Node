export default [
  {
    _id: "attempt1",
    quizId: "quiz1",
    userId: "65f8d2a5e4b0c1234567890", // Replace with actual user ID from your users collection
    courseId: "RS101",
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
    userId: "65f8d2a5e4b0c1234567891", // Replace with actual user ID from your users collection
    courseId: "RS101", 
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
    userId: "65f8d2a5e4b0c1234567890", // Same user taking different quiz
    courseId: "RS101",
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
    userId: "65f8d2a5e4b0c1234567890", // Same user, second attempt
    courseId: "RS101",
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
    userId: "65f8d2a5e4b0c1234567892", // Different student
    courseId: "RS101",
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
    userId: "65f8d2a5e4b0c1234567893", // Another student
    courseId: "RS101",
    answers: {
      q1: 2, // incorrect - chose "A database query language"
      q2: "true", // correct
      q3: "usestate", // correct (alternative spelling)
      q4: 0 // correct
    },
    score: 7,
    maxScore: 10,
    percentage: 70,
    timeSpent: 19, // minutes
    attemptNumber: 1,
    submittedAt: "2025-06-03T11:30:00Z"
  }
];
