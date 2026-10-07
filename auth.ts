import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcryptjs";

import ROUTES from "./constants/routes";
import Account from "./database/account.model";
import User from "./database/user.model";
import { signInWithOAuth } from "./lib/auth/oauth";
import dbConnect from "./lib/mongoose";
import { SignInSchema } from "./lib/validations";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub,
    Credentials({
      async authorize(credentials) {
        const validated = SignInSchema.safeParse(credentials);
        if (!validated.success) return null;

        const { email, password } = validated.data;
        await dbConnect();

        const account = await Account.findOne({
          provider: "credentials",
          providerAccountId: email,
        });
        if (!account?.password) return null;

        const passwordsMatch = await bcrypt.compare(password, account.password);
        if (!passwordsMatch) return null;

        const user = await User.findById(account.userId);
        if (!user) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: ROUTES.SIGN_IN },
  callbacks: {
    async signIn({ user, profile, account }) {
      if (account?.type === "credentials") return true;
      if (!account || !user) return false;

      try {
        await signInWithOAuth({
          user: {
            name: user.name!,
            email: user.email!,
            image: user.image!,
            username:
              account.provider === "github"
                ? (profile?.login as string)
                : (user.name?.toLowerCase() as string),
          },
          provider: account.provider as "github",
          providerAccountId: account.providerAccountId,
        });
        return true;
      } catch {
        return false;
      }
    },

    async jwt({ token, account, user }) {
      // `account` is only present on the sign-in request; afterwards the token is reused.
      if (!account) return token;

      if (account.type === "credentials") {
        token.sub = user.id;
        return token;
      }

      await dbConnect();
      const existingAccount = await Account.findOne({
        provider: account.provider,
        providerAccountId: account.providerAccountId,
      });

      // Never fall back to the provider's own id: it isn't one of our user ids.
      if (!existingAccount) throw new Error("Linked account not found");

      token.sub = existingAccount.userId.toString();
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.sub as string;
      return session;
    },
  },
});
