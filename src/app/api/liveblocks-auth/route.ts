import { Liveblocks } from "@liveblocks/node";
import { createTRPCContext } from "techme/server/api/trpc";
import { env } from "techme/env";

const liveblocks = new Liveblocks({
  secret: env.LIVEBLOCKS_SECRET_API_KEY,
});

export async function POST(request: Request) {
  // Get the current user from your database
  //   const user = __getUserFromDB__(request);
  const ctx = await createTRPCContext({
    headers: request.headers,
  });
  if (
    !ctx.session?.user ||
    !ctx.session?.user.name ||
    ctx.session?.user.name == undefined
  ) {
    return new Response("Unauthorized", { status: 401 });
  }
  // Start an auth session inside your endpoint
  const session = liveblocks.prepareSession(
    ctx.session?.user.id,
    {
      userInfo: {
        name: ctx.session?.user.name,
      },
    }, // Optional
    // { userInfo: user.metadata }, // Optional
  );

  // Use a naming pattern to allow access to rooms with wildcards
  // Giving the user read access on their org, and write access on their group
  //   session.allow(`${user.organization}:*`, session.READ_ACCESS);
  //   session.allow(`${user.organization}:${user.group}:*`, session.FULL_ACCESS);
  session.allow("*", session.FULL_ACCESS);
  // Authorize the user and return the result
  const { status, body } = await session.authorize();
  return new Response(body, { status });
}
