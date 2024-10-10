import { eq } from "drizzle-orm";
import { type NextRequest, type NextResponse } from "next/server";
import { env } from "techme/env";
import { appRouter, createCaller } from "techme/server/api/root";
import { createTRPCContext } from "techme/server/api/trpc";
import { projectDocuments } from "techme/server/db/schema";
import { getStorage } from "techme/server/db/storage";

export async function POST(req: NextRequest) {
  const ctx = await createTRPCContext({
    headers: req.headers,
  });
  if (!ctx.session?.user) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  const data = await req.formData();
  const file = data.get("file") as File;
  const projectId = data.get("projectId") as string;
  const name = data.get("name") as string;

  if (!file || !projectId || !name) {
    return new Response("Missing required fields", {
      status: 400,
    });
  }
  console.log(file, projectId, name);
  const storage = await getStorage();

  if (!storage) {
    return new Response("Failed to get storage", {
      status: 500,
    });
  }

  const guid = crypto.randomUUID();
  const extension = file.name.split(".").pop();
  const response = await storage
    .from("techme_documents")
    .upload(String(projectId) + guid + "." + extension, file);
  console.log(response);
  if (response.error) {
    return new Response(response.error.message, {
      status: 500,
    });
  }

  const url =
    env.SUPABASE_BASE_URL +
    "/storage/v1/object/public/techme_documents/" +
    response.data.path;
  console.log(url);
  await ctx.db.insert(projectDocuments).values({
    name: name,
    url: url,
    projectId: Number(projectId),
    uploadedBy: ctx.session.user.id,
  });

  const docId = await ctx.db
    .select()
    .from(projectDocuments)
    .where(eq(projectDocuments.url, url));

  if (!docId[0]) {
    return new Response("Failed to get document", {
      status: 500,
    });
  }
  const caller = createCaller(ctx);
  await caller.documents.postProcessDocument({ documentId: docId[0].id });
  return new Response("Document uploaded", {
    status: 200,
  });
}
