import { z } from "zod";
import { collectPlaces, mutateAppData, readAppData, rememberPlaces } from "../store/appStore";

export const placeInputSchema = z.object({
  name: z.string().trim().min(1, "Place name is required").max(80, "Place name is too long"),
});

export async function listPlaces(): Promise<string[]> {
  const data = await readAppData();
  return collectPlaces(data);
}

export async function addPlace(name: string): Promise<string[]> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw Object.assign(new Error("Place name is required"), { status: 400 });
  }
  return mutateAppData((data) => {
    rememberPlaces(data, trimmed);
    return collectPlaces(data);
  });
}
