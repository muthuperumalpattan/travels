import { Router } from "express";
import { addUser, deleteUser, editUser, getUserById, listUsers } from "../controllers/userController";
import { requireAuth, requirePermission } from "../middleware/auth";

const router = Router();

router.use(requireAuth, requirePermission("users:manage"));

router.get("/", listUsers);
router.post("/", addUser);
router.get("/:id", getUserById);
router.put("/:id", editUser);
router.delete("/:id", deleteUser);

export default router;
