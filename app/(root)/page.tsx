import QuestionCard from '@/components/cards/QuestionCard';
import DataRenderer from '@/components/DataRenderer';
import CommonFilter from '@/components/filters/CommonFilter';
import HomeFilter from '@/components/filters/HomeFilter';
import { homeFilters } from '@/constants/filters';
import Pagination from '@/components/Pagination';
import LocalSearch from '@/components/search/LocalSearch';
import { Button } from '@/components/ui/button';
import ROUTES from '@/constants/routes';
import { getQuestions } from '@/lib/actions/question.action';
import Link from 'next/link';

const Home = async ({ searchParams }: RouteParams) => {
  const { page, pageSize, query, filter } = await searchParams;

  const { success, data, error } = await getQuestions({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query: query || "",
    filter: filter || "",
  });

  return (
    <>
      <section className='flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center'>
        <h1 className='h1-bold text-dark100_light900'>All Questions</h1>
        <Button
          className='primary-gradient min-h-[46px] px-4 py-3 !text-light-900'
          nativeButton={false}
          render={<Link href={ROUTES.ASK_QUESTION} />}
        >
          Ask a Question
        </Button>
      </section>

      <section className='mt-11'>
        <LocalSearch
          imgSrc="/icons/search.svg"
          placeholder="Search questions..."
          otherClasses="flex-1"
        />
      </section>

      <HomeFilter />
      <CommonFilter filters={homeFilters} placeholder='Sort questions' containerClasses='mt-10 sm:hidden' />

      <DataRenderer
        success={success}
        error={error}
        data={data?.items}
        empty={{
          title: "No questions found",
          message: query || filter
            ? "Nothing matches your search. Try different keywords or filters."
            : "Be the first to break the silence and ask a question.",
          button: { text: "Ask a Question", href: ROUTES.ASK_QUESTION },
        }}
        render={(questions) => (
          <div className='mt-10 flex w-full flex-col gap-6'>
            {questions.map((question) => (
              <QuestionCard key={question._id} question={question} />
            ))}
          </div>
        )}
      />

      <Pagination page={Number(page) || 1} isNext={data?.isNext ?? false} />
    </>
  );
};

export default Home;
