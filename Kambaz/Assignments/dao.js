import model from "./model.js";
import { v4 as uuidv4 } from "uuid";

// Find assignments for a specific course
export function findAssignmentsForCourse(courseId) {
  return model.find({ course: courseId });
}

// Find assignment by ID
export function findAssignmentById(assignmentId) {
  return model.findById(assignmentId);
}

// Create new assignment
export function createAssignment(assignment) {
  const newAssignment = { ...assignment, _id: uuidv4() };
  return model.create(newAssignment);
}

// Update assignment
export function updateAssignment(assignmentId, assignmentUpdates) {
  return model.updateOne({ _id: assignmentId }, { $set: assignmentUpdates });
}

// Delete assignment
export function deleteAssignment(assignmentId) {
  return model.deleteOne({ _id: assignmentId });
}

// Get all assignments (for admin)
export function findAllAssignments() {
  return model.find();
}
