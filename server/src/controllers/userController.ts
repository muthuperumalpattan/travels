import { Response } from "express";
import { AuthedRequest } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import {
  createUser,
  getUser,
  getUsers,
  removeUser,
  updateUser,
  userInputSchema,
} from "../services/userService";

export const listUsers = asyncHandler(async (_req: AuthedRequest, res: Response) => {
  res.json({ success: true, data: await getUsers() });
});

export const getUserById = asyncHandler(async (req: AuthedRequest, res: Response) => {
  res.json({ success: true, data: await getUser(req.params.id) });
});

export const addUser = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const input = userInputSchema.parse(req.body);
  const user = await createUser(input);
  res.status(201).json({ success: true, data: user, message: "User added successfully" });
});

export const editUser = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const input = userInputSchema.parse(req.body);
  const user = await updateUser(req.params.id, input);
  res.json({ success: true, data: user, message: "Updated successfully" });
});

export const deleteUser = asyncHandler(async (req: AuthedRequest, res: Response) => {
  await removeUser(req.params.id, req.user!.id);
  res.json({ success: true, data: null, message: "Deleted successfully" });
});
