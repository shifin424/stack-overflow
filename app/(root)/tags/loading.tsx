import { CardGridSkeleton, PageHeadingSkeleton, SearchSkeleton } from "@/components/skeletons";

const Loading = () => (
  <>
    <PageHeadingSkeleton />
    <SearchSkeleton />
    <CardGridSkeleton />
  </>
);

export default Loading;
