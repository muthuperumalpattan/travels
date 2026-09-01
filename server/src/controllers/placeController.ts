import { Response } from "express";
import { AuthedRequest } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { addPlace, listPlaces, placeInputSchema } from "../services/placeService";

export const getPlaces = asyncHandler(async (_req: AuthedRequest, res: Response) => {
  res.json({ success: true, data: await listPlaces() });
});

export const createPlace = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const { name } = placeInputSchema.parse(req.body);
  const places = await addPlace(name);
  res.status(201).json({ success: true, data: places, message: "Place added" });
});
