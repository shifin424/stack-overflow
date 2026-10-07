import { Skeleton } from "@/components/ui/skeleton";

const shade = "background-light800_dark300";

export const PageHeadingSkeleton = () => (
  <div className="flex w-full items-center justify-between">
    <Skeleton className={`h-10 w-48 ${shade}`} />
    <Skeleton className={`h-[46px] w-36 ${shade}`} />
  </div>
);

export const SearchSkeleton = () => <Skeleton className={`mt-11 h-14 w-full rounded-[10px] ${shade}`} />;

export const QuestionCardSkeleton = () => (
  <div className="card-wrapper rounded-[10px] p-9 sm:px-11">
    <Skeleton className={`h-6 w-3/4 ${shade}`} />
    <div className="mt-4 flex gap-2">
      <Skeleton className={`h-7 w-20 ${shade}`} />
      <Skeleton className={`h-7 w-24 ${shade}`} />
    </div>
    <div className="mt-6 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Skeleton className={`size-5 rounded-full ${shade}`} />
        <Skeleton className={`h-4 w-40 ${shade}`} />
      </div>
      <Skeleton className={`h-4 w-48 ${shade}`} />
    </div>
  </div>
);

export const QuestionListSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="mt-10 flex w-full flex-col gap-6">
    {Array.from({ length: count }, (_, i) => (
      <QuestionCardSkeleton key={i} />
    ))}
  </div>
);

export const CardGridSkeleton = ({ count = 8, cardClassName = "xs:w-[230px] h-[250px] w-full" }: { count?: number; cardClassName?: string }) => (
  <div className="mt-12 flex flex-wrap gap-5">
    {Array.from({ length: count }, (_, i) => (
      <Skeleton key={i} className={`rounded-2xl ${cardClassName} ${shade}`} />
    ))}
  </div>
);

export const ListPageSkeleton = () => (
  <>
    <PageHeadingSkeleton />
    <SearchSkeleton />
    <QuestionListSkeleton />
  </>
);
