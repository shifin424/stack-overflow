import joinedLabel from "@/lib/date";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import AnswerCard from "@/components/cards/AnswerCard";
import QuestionCard from "@/components/cards/QuestionCard";
import TagCard from "@/components/cards/TagCard";
import DataRenderer from "@/components/DataRenderer";
import Pagination from "@/components/Pagination";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileLink from "@/components/user/ProfileLink";
import Stats from "@/components/user/Stats";
import ROUTES from "@/constants/routes";
import {
  getUser,
  getUserAnswers,
  getUserQuestions,
  getUserStats,
  getUserTopTags,
} from "@/lib/actions/user.action";
import { formatNumber } from "@/lib/utils";

const Profile = async ({ params, searchParams }: RouteParams) => {
  const { id } = await params;
  const { page } = await searchParams;
  const pageNumber = Number(page) || 1;

  const [session, userResult] = await Promise.all([auth(), getUser({ userId: id })]);
  if (!userResult.success || !userResult.data) return notFound();

  const { user } = userResult.data;
  const isOwner = session?.user?.id === id;

  const [stats, questions, answers, topTags] = await Promise.all([
    getUserStats({ userId: id }),
    getUserQuestions({ userId: id, page: pageNumber, pageSize: 10 }),
    getUserAnswers({ userId: id, page: pageNumber, pageSize: 10 }),
    getUserTopTags({ userId: id }),
  ]);

  return (
    <>
      <section className="flex flex-col-reverse items-start justify-between sm:flex-row">
        <div className="flex flex-col items-start gap-4 lg:flex-row">
          <Avatar className="relative size-[140px] rounded-full">
            {user.image ? (
              <Image src={user.image} alt={user.name} fill sizes="140px" quality={100} className="rounded-full object-cover" />
            ) : (
              <AvatarFallback className="primary-gradient font-space-grotesk text-5xl font-bold tracking-widest text-white">
                {user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
              </AvatarFallback>
            )}
          </Avatar>

          <div className="mt-3">
            <h2 className="h2-bold text-dark100_light900">{user.name}</h2>
            <p className="paragraph-regular text-dark200_light800">@{user.username}</p>

            <div className="mt-5 flex flex-wrap items-center justify-start gap-5">
              {user.portfolio && <ProfileLink imgUrl="/icons/link.svg" href={user.portfolio} title="Portfolio" />}
              {user.location && <ProfileLink imgUrl="/icons/location.svg" title={user.location} />}
              <ProfileLink imgUrl="/icons/calendar.svg" title={joinedLabel(user.createdAt)} />
            </div>

            <p className="paragraph-regular text-dark400_light800 mt-8">
              <span className="text-primary-500 font-semibold">{formatNumber(user.reputation)}</span> reputation
            </p>
            {user.bio && <p className="paragraph-regular text-dark400_light800 mt-4 max-w-xl">{user.bio}</p>}
          </div>
        </div>

        {isOwner && (
          <div className="flex justify-end max-sm:mb-5 max-sm:w-full sm:mt-3">
            <Button
              nativeButton={false}
              render={<Link href={ROUTES.EDIT_PROFILE} />}
              className="paragraph-medium btn-secondary text-dark300_light900 min-h-12 min-w-44 px-4 py-3"
            >
              Edit Profile
            </Button>
          </div>
        )}
      </section>

      {stats.data && <Stats {...stats.data} />}

      <section className="mt-10 flex gap-10">
        <Tabs defaultValue="top-posts" className="flex-[2]">
          <TabsList className="background-light800_dark400 min-h-[42px] p-1">
            <TabsTrigger value="top-posts" className="tab">Top Posts</TabsTrigger>
            <TabsTrigger value="answers" className="tab">Answers</TabsTrigger>
          </TabsList>

          <TabsContent value="top-posts" className="mt-5 flex w-full flex-col gap-6">
            <DataRenderer
              success={questions.success}
              error={questions.error}
              data={questions.data?.items}
              empty={{ title: "No questions yet", message: "Questions asked will appear here." }}
              render={(items) => items.map((q) => <QuestionCard key={q._id} question={q} showActionBtns={isOwner} />)}
            />
            <Pagination page={pageNumber} isNext={questions.data?.isNext ?? false} />
          </TabsContent>

          <TabsContent value="answers" className="flex w-full flex-col">
            <DataRenderer
              success={answers.success}
              error={answers.error}
              data={answers.data?.items}
              empty={{ title: "No answers yet", message: "Answers posted will appear here." }}
              render={(items) =>
                items.map((a) => (
                  <AnswerCard key={a._id} {...a} containerClasses="card-wrapper rounded-[10px] px-7 py-9 sm:px-11" showReadMore showActionBtns={isOwner} />
                ))
              }
            />
            <Pagination page={pageNumber} isNext={answers.data?.isNext ?? false} />
          </TabsContent>
        </Tabs>

        <div className="flex w-full min-w-[250px] flex-1 flex-col max-lg:hidden">
          <h3 className="h3-bold text-dark200_light900">Top Tech</h3>
          <div className="mt-7 flex flex-col gap-4">
            {topTags.success && topTags.data?.length ? (
              topTags.data.map((tag) => (
                <TagCard key={tag._id} _id={tag._id} name={tag.name} questions={tag.count} showCount compact />
              ))
            ) : (
              <p className="body-regular text-dark500_light700">No tags yet.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Profile;
