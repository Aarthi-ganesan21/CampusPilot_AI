import { Router, Response } from "express";
import { getCollection, saveCollection, updateRecordInCollection, deleteRecordFromCollection } from "../db_store";
import { AuthenticatedRequest, authorize } from "../middleware/authMiddleware";

const router = Router();

/**
 * GET /api/erp/sync
 * Bulk sync all collections (requires auth)
 */
router.get("/sync", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required." });
      return;
    }

    const collections = [
      "users",
      "students",
      "faculty",
      "departments",
      "subjects",
      "classes",
      "attendance",
      "assignments",
      "assignmentSubmissions",
      "internalMarks",
      "semesterMarks",
      "results",
      "notifications",
      "documents",
      "placements",
      "hostel",
      "fees",
      "library",
      "events",
    ];

    const payload: any = {};
    for (const name of collections) {
      try {
        payload[name] = await getCollection(name as any);
      } catch {
        payload[name] = [];
      }
    }

    res.json(payload);
  } catch (error: any) {
    console.error("Sync error:", error);
    res.status(500).json({ error: "Sync failed." });
  }
});

/**
 * GET /api/erp/:collection
 * Fetch a collection (requires auth)
 */
router.get("/:collection", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required." });
      return;
    }

    const { collection } = req.params;
    const list = await getCollection(collection as any);
    res.json(list);
  } catch (error: any) {
    console.error(`Fetch collection ${req.params.collection} error:`, error);
    res.status(500).json({ error: "Failed to fetch collection." });
  }
});

/**
 * POST /api/erp/:collection
 * Create or replace collection (requires auth)
 */
router.post("/:collection", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required." });
      return;
    }

    const { collection } = req.params;
    const data = req.body;

    if (Array.isArray(data)) {
      await saveCollection(collection as any, data);
      res.json({ success: true, message: `Collection ${collection} saved successfully.` });
    } else {
      const recordId = data.id || "rec_" + Date.now() + "_" + Math.random().toString(36).substring(2, 5);
      const record = await updateRecordInCollection(collection as any, recordId, data);
      res.json({ success: true, record });
    }
  } catch (error: any) {
    console.error(`Save collection ${req.params.collection} error:`, error);
    res.status(500).json({ error: "Failed to save collection." });
  }
});

/**
 * PUT /api/erp/:collection/:id
 * Update a record (requires auth)
 */
router.put("/:collection/:id", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required." });
      return;
    }

    const { collection, id } = req.params;
    const updatedFields = req.body;

    const record = await updateRecordInCollection(collection as any, id, updatedFields);
    res.json({ success: true, record });
  } catch (error: any) {
    console.error(`Update record ${req.params.collection}/${req.params.id} error:`, error);
    res.status(500).json({ error: "Failed to update record." });
  }
});

/**
 * DELETE /api/erp/:collection/:id
 * Delete a record (requires auth)
 */
router.delete("/:collection/:id", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required." });
      return;
    }

    const { collection, id } = req.params;

    const deleted = await deleteRecordFromCollection(collection as any, id);
    if (deleted) {
      res.json({ success: true, message: "Record deleted successfully." });
    } else {
      res.status(404).json({ error: "Record not found." });
    }
  } catch (error: any) {
    console.error(`Delete record ${req.params.collection}/${req.params.id} error:`, error);
    res.status(500).json({ error: "Failed to delete record." });
  }
});

export default router;
