import * as assignmentsDao from "./dao.js";

export default function AssignmentRoutes(app) {
  
  // Get assignment by ID
  app.get("/api/assignments/:assignmentId", async (req, res) => {
    const { assignmentId } = req.params;
    try {
      const assignment = await assignmentsDao.findAssignmentById(assignmentId);
      if (assignment) {
        res.json(assignment);
      } else {
        res.status(404).json({ message: `Assignment with ID ${assignmentId} not found` });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update assignment
  app.put("/api/assignments/:assignmentId", async (req, res) => {
    const { assignmentId } = req.params;
    const assignmentUpdates = req.body;
    try {
      const result = await assignmentsDao.updateAssignment(assignmentId, assignmentUpdates);
      if (result.matchedCount > 0) {
        const updatedAssignment = await assignmentsDao.findAssignmentById(assignmentId);
        res.json(updatedAssignment);
      } else {
        res.status(404).json({ message: `Unable to update Assignment with ID ${assignmentId}` });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete assignment
  app.delete("/api/assignments/:assignmentId", async (req, res) => {
    const { assignmentId } = req.params;
    try {
      const result = await assignmentsDao.deleteAssignment(assignmentId);
      if (result.deletedCount > 0) {
        res.json({ message: `Assignment with ID ${assignmentId} deleted successfully` });
      } else {
        res.status(404).json({ message: `Unable to delete Assignment with ID ${assignmentId}` });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all assignments (for admin)
  app.get("/api/assignments", async (req, res) => {
    try {
      const assignments = await assignmentsDao.findAllAssignments();
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}
