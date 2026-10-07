"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { formUrlQuery } from "@/lib/url";

interface Props {
  page: number;
  isNext: boolean;
}

const Pagination = ({ page, isNext }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (page === 1 && !isNext) return null;

  const goTo = (nextPage: number) => {
    router.push(
      formUrlQuery({ params: searchParams.toString(), key: "page", value: nextPage.toString() })
    );
  };

  return (
    <div className="mt-10 flex w-full items-center justify-center gap-2">
      <Button
        variant="outline"
        disabled={page <= 1}
        onClick={() => goTo(page - 1)}
        className="light-border-2 btn-secondary min-h-[36px] border"
      >
        <span className="body-medium text-dark200_light800">Prev</span>
      </Button>

      <div className="flex items-center justify-center rounded-md bg-primary-500 px-3.5 py-2">
        <p className="body-semibold text-light-900">{page}</p>
      </div>

      <Button
        variant="outline"
        disabled={!isNext}
        onClick={() => goTo(page + 1)}
        className="light-border-2 btn-secondary min-h-[36px] border"
      >
        <span className="body-medium text-dark200_light800">Next</span>
      </Button>
    </div>
  );
};

export default Pagination;
