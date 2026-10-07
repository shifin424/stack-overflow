import UserCard from "@/components/cards/UserCard";
import DataRenderer from "@/components/DataRenderer";
import CommonFilter from "@/components/filters/CommonFilter";
import Pagination from "@/components/Pagination";
import LocalSearch from "@/components/search/LocalSearch";
import { getUsers } from "@/lib/actions/user.action";

const userFilters = [
  { name: "Top Contributors", value: "popular" },
  { name: "New Users", value: "newest" },
  { name: "Old Users", value: "oldest" },
];

const Community = async ({ searchParams }: RouteParams) => {
  const { page, pageSize, query, filter } = await searchParams;

  const { success, data, error } = await getUsers({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 12,
    query: query || "",
    filter: filter || "",
  });

  return (
    <div>
      <h1 className="h1-bold text-dark100_light900">All Users</h1>

      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch imgSrc="/icons/search.svg" placeholder="Search by name or username..." otherClasses="flex-1" />
        <CommonFilter filters={userFilters} defaultValue="popular" otherClasses="min-h-[56px] sm:min-w-[210px]" />
      </div>

      <DataRenderer
        success={success}
        error={error}
        data={data?.items}
        empty={{ title: "No users found", message: "Try a different search." }}
        render={(users) => (
          <div className="mt-12 flex flex-wrap gap-5">
            {users.map((user) => (
              <UserCard key={user._id} {...user} />
            ))}
          </div>
        )}
      />

      <Pagination page={Number(page) || 1} isNext={data?.isNext ?? false} />
    </div>
  );
};

export default Community;
