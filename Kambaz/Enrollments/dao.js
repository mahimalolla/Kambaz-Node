import Database from "../Database/index.js";
import { v4 as uuidv4 } from "uuid";

// Enroll a user in a course
export function enrollUserInCourse(userId, courseId) {
  const { enrollments } = Database;
  
  // Check if user is already enrolled
  const existingEnrollment = enrollments.find(
    (enrollment) => enrollment.user === userId && enrollment.course === courseId
  );
  
  if (existingEnrollment) {
    return existingEnrollment; // Already enrolled
  }
  
  const newEnrollment = {
    _id: uuidv4(),
    user: userId,
    course: courseId
  };
  
  enrollments.push(newEnrollment);
  return newEnrollment;
}

// Unenroll a user from a course
export function unenrollUserFromCourse(userId, courseId) {
  const { enrollments } = Database;
  const enrollmentIndex = enrollments.findIndex(
    (enrollment) => enrollment.user === userId && enrollment.course === courseId
  );
  
  if (enrollmentIndex !== -1) {
    const removedEnrollment = enrollments.splice(enrollmentIndex, 1)[0];
    return removedEnrollment;
  }
  
  return null; // Enrollment not found
}

// Find all enrollments for a specific user
export function findEnrollmentsForUser(userId) {
  const { enrollments } = Database;
  return enrollments.filter((enrollment) => enrollment.user === userId);
}

// Find all enrollments for a specific course
export function findEnrollmentsForCourse(courseId) {
  const { enrollments } = Database;
  return enrollments.filter((enrollment) => enrollment.course === courseId);
}

// Check if a user is enrolled in a specific course
export function isUserEnrolledInCourse(userId, courseId) {
  const { enrollments } = Database;
  return enrollments.some(
    (enrollment) => enrollment.user === userId && enrollment.course === courseId
  );
}

// Get all enrollments (for admin purposes)
export function findAllEnrollments() {
  const { enrollments } = Database;
  return enrollments;
}

// Find enrollment by ID
export function findEnrollmentById(enrollmentId) {
  const { enrollments } = Database;
  return enrollments.find((enrollment) => enrollment._id === enrollmentId);
}

// Delete enrollment by ID
export function deleteEnrollment(enrollmentId) {
  const { enrollments } = Database;
  const enrollmentIndex = enrollments.findIndex(
    (enrollment) => enrollment._id === enrollmentId
  );
  
  if (enrollmentIndex !== -1) {
    const removedEnrollment = enrollments.splice(enrollmentIndex, 1)[0];
    return removedEnrollment;
  }
  
  return null; // Enrollment not found
}

// Get users enrolled in a course (with user details)
export function getUsersEnrolledInCourse(courseId) {
  const { enrollments, users } = Database;
  const courseEnrollments = enrollments.filter(
    (enrollment) => enrollment.course === courseId
  );
  
  return courseEnrollments.map((enrollment) => {
    const user = users.find((u) => u._id === enrollment.user);
    return {
      ...enrollment,
      userDetails: user
    };
  });
}

// Get courses a user is enrolled in (with course details)
export function getCoursesForUser(userId) {
  const { enrollments, courses } = Database;
  const userEnrollments = enrollments.filter(
    (enrollment) => enrollment.user === userId
  );
  
  return userEnrollments.map((enrollment) => {
    const course = courses.find((c) => c._id === enrollment.course);
    return {
      ...enrollment,
      courseDetails: course
    };
  });
}
