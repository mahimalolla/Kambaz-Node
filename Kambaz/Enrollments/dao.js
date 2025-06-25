import model from "./model.js";
import { v4 as uuidv4 } from "uuid";

// Enroll a user in a course
export async function enrollUserInCourse(userId, courseId) {
  // Check if user is already enrolled
  const existingEnrollment = await model.findOne({
    user: userId,
    course: courseId
  });
  
  if (existingEnrollment) {
    return existingEnrollment; // Already enrolled
  }
  
  const newEnrollment = {
    _id: uuidv4(),
    user: userId,
    course: courseId,
    enrollmentDate: new Date(),
    status: "ENROLLED"
  };
  
  return await model.create(newEnrollment);
}

// Unenroll a user from a course
export async function unenrollUserFromCourse(userId, courseId) {
  const removedEnrollment = await model.findOneAndDelete({
    user: userId,
    course: courseId
  });
  
  return removedEnrollment;
}

// Find all enrollments for a specific user
export function findEnrollmentsForUser(userId) {
  return model.find({ user: userId });
}

// Find all enrollments for a specific course
export function findEnrollmentsForCourse(courseId) {
  return model.find({ course: courseId });
}

// Check if a user is enrolled in a specific course
export async function isUserEnrolledInCourse(userId, courseId) {
  const enrollment = await model.findOne({
    user: userId,
    course: courseId
  });
  return !!enrollment;
}

// Get all enrollments (for admin purposes)
export function findAllEnrollments() {
  return model.find();
}

// Find enrollment by ID
export function findEnrollmentById(enrollmentId) {
  return model.findById(enrollmentId);
}

// Delete enrollment by ID
export async function deleteEnrollment(enrollmentId) {
  const removedEnrollment = await model.findByIdAndDelete(enrollmentId);
  return removedEnrollment;
}

// Get users enrolled in a course (with user details)
export async function getUsersEnrolledInCourse(courseId) {
  const enrollments = await model.find({ course: courseId }).populate('user');
  return enrollments.map((enrollment) => ({
    ...enrollment.toObject(),
    userDetails: enrollment.user
  }));
}

// Get courses a user is enrolled in (with course details)
export async function getCoursesForUser(userId) {
  const enrollments = await model.find({ user: userId }).populate('course');
  return enrollments.map((enrollment) => ({
    ...enrollment.toObject(),
    courseDetails: enrollment.course
  }));
}

export async function findCoursesForUser(userId) {
  const enrollments = await model.find({ user: userId }).populate("course");
  console.log("Raw enrollments:", enrollments); // Debug log
  
  // Filter out any null courses before mapping
  const validEnrollments = enrollments.filter(enrollment => enrollment.course !== null);
  console.log("Valid enrollments:", validEnrollments); // Debug log
  
  return validEnrollments.map((enrollment) => enrollment.course);
}

export async function findUsersForCourse(courseId) {
  const enrollments = await model.find({ course: courseId }).populate("user");
  return enrollments.map((enrollment) => enrollment.user);
}
