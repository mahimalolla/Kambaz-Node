import * as modulesDao from "./dao.js";

export default function ModuleRoutes(app) {
  
  // Get all modules for a specific course (handled in CourseRoutes)
  // app.get("/api/courses/:courseId/modules", ...) 
  
  // Get module by ID
  app.get("/api/modules/:moduleId", async (req, res) => {
    const { moduleId } = req.params;
    try {
      const module = await modulesDao.findModuleById(moduleId);
      if (module) {
        res.json(module);
      } else {
        res.status(404).json({ message: `Module with ID ${moduleId} not found` });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create new module for a course (handled in CourseRoutes)
  // app.post("/api/courses/:courseId/modules", ...)

  // Update module
  app.put("/api/modules/:moduleId", async (req, res) => {
    const { moduleId } = req.params;
    const moduleUpdates = req.body;
    try {
      const result = await modulesDao.updateModule(moduleId, moduleUpdates);
      if (result.matchedCount > 0) {
        // Get the updated module to return it
        const updatedModule = await modulesDao.findModuleById(moduleId);
        res.json(updatedModule);
      } else {
        res.status(404).json({ message: `Unable to update Module with ID ${moduleId}` });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete module
  app.delete("/api/modules/:moduleId", async (req, res) => {
    const { moduleId } = req.params;
    try {
      const result = await modulesDao.deleteModule(moduleId);
      if (result.deletedCount > 0) {
        res.json({ message: `Module with ID ${moduleId} deleted successfully` });
      } else {
        res.status(404).json({ message: `Unable to delete Module with ID ${moduleId}` });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all modules (for admin purposes)
  app.get("/api/modules", async (req, res) => {
    try {
      const modules = await modulesDao.findAllModules();
      res.json(modules);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}
