"use server";

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { AuthError } from "next-auth";

import { signIn } from "@/auth";
import Account from "@/database/account.model";
import User from "@/database/user.model";

import action from "./action";
import handleError from "../handlers/error";
import { NotFoundError, RequestError } from "../http-errors";
import { SignInSchema, SignUpSchema } from "../validations";

export async function signUpWithCredentials(params: AuthCredentials): Promise<ActionResponse> {
  const validated = await action({ params, schema: SignUpSchema });
  if (validated instanceof Error) return handleError(validated) as ErrorResponse;

  const { name, username, email, password } = validated.params!;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (await User.exists({ email }).session(session)) {
      throw new RequestError(409, "An account with this email already exists");
    }
    if (await User.exists({ username }).session(session)) {
      throw new RequestError(409, "Username is already taken");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [newUser] = await User.create([{ name, username, email }], { session });
    await Account.create(
      [
        {
          userId: newUser._id,
          name,
          provider: "credentials",
          providerAccountId: email,
          password: hashedPassword,
        },
      ],
      { session }
    );

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }

  return signInUser(email, password);
}

export async function signInWithCredentials(
  params: Pick<AuthCredentials, "email" | "password">
): Promise<ActionResponse> {
  const validated = await action({ params, schema: SignInSchema });
  if (validated instanceof Error) return handleError(validated) as ErrorResponse;

  const { email, password } = validated.params!;

  try {
    const account = await Account.findOne({ provider: "credentials", providerAccountId: email });
    if (!account) throw new NotFoundError("Account");
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }

  return signInUser(email, password);
}

async function signInUser(email: string, password: string): Promise<ActionResponse> {
  try {
    await signIn("credentials", { email, password, redirect: false });
    return { success: true };
  } catch (error) {
    // NextAuth reports bad credentials as an AuthError; anything else (e.g. a redirect) must propagate.
    if (error instanceof AuthError) {
      return handleError(new RequestError(401, "Invalid email or password")) as ErrorResponse;
    }
    throw error;
  }
}
