import mongoose from "mongoose";
import slugify from "slugify";

import Account from "@/database/account.model";
import User from "@/database/user.model";

import dbConnect from "../mongoose";

/** Finds a username that isn't taken yet, appending a short suffix on collision. */
const uniqueUsername = async (base: string, session: mongoose.ClientSession) => {
  const slug = slugify(base, { lower: true, strict: true, trim: true }) || "user";
  let candidate = slug;

  while (await User.exists({ username: candidate }).session(session)) {
    candidate = `${slug}${Math.floor(1000 + Math.random() * 9000)}`;
  }
  return candidate;
};

/**
 * Creates (or refreshes) the user and linked account for an OAuth sign-in and returns
 * the user id. Called straight from the NextAuth callbacks, so it is deliberately not
 * a server action and cannot be invoked from the browser.
 */
export async function signInWithOAuth({
  user,
  provider,
  providerAccountId,
}: SignInWithOAuthParams): Promise<string> {
  await dbConnect();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, username, email, image } = user;

    let existingUser = await User.findOne({ email }).session(session);

    if (!existingUser) {
      [existingUser] = await User.create(
        [{ name, username: await uniqueUsername(username, session), email, image }],
        { session }
      );
    } else {
      const updates: { name?: string; image?: string } = {};
      if (existingUser.name !== name) updates.name = name;
      if (image && existingUser.image !== image) updates.image = image;

      if (Object.keys(updates).length > 0) {
        await User.updateOne({ _id: existingUser._id }, { $set: updates }).session(session);
      }
    }

    const existingAccount = await Account.findOne({
      userId: existingUser._id,
      provider,
      providerAccountId,
    }).session(session);

    if (!existingAccount) {
      await Account.create(
        [{ userId: existingUser._id, name, image, provider, providerAccountId }],
        { session }
      );
    }

    await session.commitTransaction();
    return existingUser._id.toString();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}
