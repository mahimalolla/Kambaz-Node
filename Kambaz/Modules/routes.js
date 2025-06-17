import * as modulesDao from "./dao.js";

export default function ModuleRoutes(app) {
  
  // Get all modules for a specific course (handled in CourseRoutes)
  // app.get("/api/courses/:courseId/modules", ...) 
  
  // Get module by ID
  app.get("/api/modules/:moduleId", (req, res) => {
    const { moduleId } = req.params;
    const module = modulesDao.findModuleById(moduleId);
    if (module) {
      res.json(module);
    } else {
      res.status(404).json({ message: `Module with ID ${moduleId} not found` });
    }
  });

  // Create new module for a course (handled in CourseRoutes)
  // app.post("/api/courses/:courseId/modules", ...)

  // Update module
  app.put("/api/modules/:moduleId", (req, res) => {
    const { moduleId } = req.params;
    const moduleUpdates = req.body;
    const updatedModule = modulesDao.updateModule(moduleId, moduleUpdates);
    if (updatedModule) {
      res.json(updatedModule);
    } else {
      res.status(404).json({ message: `Unable to update Module with ID ${moduleId}` });
    }
  });

  // Delete module
  app.delete("/api/modules/:moduleId", (req, res) => {
    const { moduleId } = req.params;
    const success = modulesDao.deleteModule(moduleId);
    if (success) {
      res.sendStatus(200);
    } else {
      res.status(404).json({ message: `Unable to delete Module with ID ${moduleId}` });
    }
  });
}
