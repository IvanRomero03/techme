"use server";
import { api } from "techme/trpc/server";

export const asd = async (formData: FormData) => {
  if (formData.get("texto")?.toString()?.length != undefined) {
    await api.tabla.crear({
      name: formData.get("texto")?.toString() ?? "11",
    });
  }
};
