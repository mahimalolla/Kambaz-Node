import model from "./model.js";
import { v4 as uuidv4 } from "uuid";

export function findAllCourses() {
  return model.find();
}

export function findCourseById(courseId) {
  return model.findById(courseId);
}

export function createCourse(course) {
  const newCourse = { ...course, _id: uuidv4() };
  return model.create(newCourse);
}

export function updateCourse(courseId, courseUpdates) {
  return model.updateOne({ _id: courseId }, { $set: courseUpdates });
}

export function deleteCourse(courseId) {
  return model.deleteOne({ _id: courseId });
}

// This function will be moved to enrollments DAO later
export function findCoursesForEnrolledUser(userId) {
  // This will be handled by enrollments DAO
  // For now, return empty array - we'll implement this with enrollments
  return [];
}
