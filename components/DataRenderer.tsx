import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

import { Button } from "@/components/ui/button";

interface Props<T> {
  success: boolean;
  error?: { message: string; details?: Record<string, string[]> };
  data: T[] | null | undefined;
  empty: { title: string; message: string; button?: { text: string; href: string } };
  render: (data: T[]) => ReactNode;
}

const State = ({
  title,
  message,
  variant,
  button,
}: {
  title: string;
  message: string;
  variant: "empty" | "error";
  button?: { text: string; href: string };
}) => (
  <div className="mt-16 flex w-full flex-col items-center justify-center sm:mt-20">
    <Image
      src={`/images/light-${variant === "error" ? "error" : "illustration"}.png`}
      alt={title}
      width={270}
      height={200}
      className="block object-contain dark:hidden"
    />
    <Image
      src={`/images/dark-${variant === "error" ? "error" : "illustration"}.png`}
      alt={title}
      width={270}
      height={200}
      className="hidden object-contain dark:block"
    />

    <h2 className="h2-bold text-dark200_light900 mt-8 text-center">{title}</h2>
    <p className="body-regular text-dark500_light700 my-3.5 max-w-md text-center">{message}</p>

    {button && (
      <Button
        nativeButton={false}
        render={<Link href={button.href} />}
        className="paragraph-medium mt-5 min-h-[46px] rounded-lg bg-primary-500 px-4 py-3 text-light-900 hover:bg-primary-500"
      >
        {button.text}
      </Button>
    )}
  </div>
);

const DataRenderer = <T,>({ success, error, data, empty, render }: Props<T>) => {
  if (!success) {
    return (
      <State
        variant="error"
        title="Something went wrong"
        message={error?.message ?? "We couldn't load this right now. Please try again."}
      />
    );
  }

  if (!data || data.length === 0) {
    return <State variant="empty" {...empty} />;
  }

  return <>{render(data)}</>;
};

export default DataRenderer;
