import { NextResponse } from "next/server";

import { auth } from "@/auth";
import ROUTES from "@/constants/routes";

const AUTH_PAGES = [ROUTES.SIGN_IN, ROUTES.SIGN_UP];

/**
 * Optimistic redirects only: signed-out users are sent to sign-in, signed-in users are
 * kept off the auth pages. Real authorization happens inside each server action.
 */
export const proxy = auth((req) => {
  const { pathname, search } = req.nextUrl;
  const isSignedIn = !!req.auth;

  if (isSignedIn && AUTH_PAGES.includes(pathname)) {
    return NextResponse.redirect(new URL(ROUTES.HOME, req.nextUrl));
  }

  if (!isSignedIn && !AUTH_PAGES.includes(pathname)) {
    const signIn = new URL(ROUTES.SIGN_IN, req.nextUrl);
    signIn.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(signIn);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/sign-in",
    "/sign-up",
    "/ask-question",
    "/collection",
    "/profile/edit",
    "/question/:id/edit",
  ],
};
