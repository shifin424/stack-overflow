import { Session } from "next-auth";
import { ZodError, ZodSchema } from "zod";

import { auth } from "@/auth";

import { UnauthorizedError, ValidationError } from "../http-errors";
import dbConnect from "../mongoose";

type ActionOptions<T> = {
  params?: T;
  schema?: ZodSchema<T>;
  authorize?: boolean;
};

/**
 * Shared prelude for every server action: validates the input, optionally requires a
 * signed-in user, and opens the database connection. Returns an Error instead of
 * throwing so callers can hand it to `handleError`.
 */
async function action<T>({ params, schema, authorize = false }: ActionOptions<T>) {
  if (schema && params !== undefined) {
    try {
      schema.parse(params);
    } catch (error) {
      if (error instanceof ZodError) {
        return new ValidationError(
          error.flatten().fieldErrors as Record<string, string[]>
        );
      }
      return new Error("Schema validation failed");
    }
  }

  let session: Session | null = null;

  if (authorize) {
    session = await auth();
    if (!session?.user?.id) return new UnauthorizedError();
  }

  await dbConnect();

  return { params, session };
}

export default action;
