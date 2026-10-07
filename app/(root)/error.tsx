"use client";

import { Button } from "@/components/ui/button";

const Error = ({ reset }: { error: Error & { digest?: string }; reset: () => void }) => (
  <div className="mt-24 flex flex-col items-center gap-4 text-center">
    <h2 className="h2-bold text-dark200_light900">Something went wrong</h2>
    <p className="body-regular text-dark500_light700">An unexpected error occurred. Please try again.</p>
    <Button onClick={reset} className="primary-gradient !text-light-900">
      Try again
    </Button>
  </div>
);

export default Error;
