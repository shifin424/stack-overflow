import ROUTES from '@/constants/routes';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import TagCard from '../cards/TagCard';
import { getHotQuestions } from '@/lib/actions/question.action';
import { getPopularTags } from '@/lib/actions/tag.action';

const RightSidebar = async () => {
    const [hot, popular] = await Promise.all([getHotQuestions(), getPopularTags()]);

    return (
<section className='pt-36 custom-scrollbar background-light900_dark200 light-border sticky right-0 top-0 flex h-screen w-[350px] flex-col gap-6 overflow-y-auto border-l p-6 shadow-light-300 dark:shadow-none max-xl:hidden'>
    <div>
        <h3 className='h3-bold text-dark200_light900'>Top Questions</h3>
    <div className='mt-7 flex w-full flex-col gap-[30px]'>
        {hot.success && hot.data?.length ? (
          hot.data.map(( { _id,title }) => (
            <Link
                key={_id}
                href={ROUTES.QUESTION(_id)}
                className='flex items-center justify-between gap-7' >
            <p className='body-medium text-dark500_light700 line-clamp-2'>
                {title}
            </p>
        <Image
            src="/icons/chevron-right.svg"
            alt='Chevron'
            width={20}
            height={20}
            className='invert-colors'
        />

            </Link>
          ))
        ) : (
            <p className='body-regular text-dark500_light700'>
                {hot.success ? "No questions yet." : "Couldn't load top questions."}
            </p>
        )}
    </div>
    </div>

    <div className='mt-16'>
        <h3 className='h3-bold text-dark200_light900'>Popular Tags</h3>
        <div className='mt-7 flex flex-col gap-4'>
            {popular.success && popular.data?.length ? (
                popular.data.map(( { _id, name, questions}) => (
                    <TagCard
                      key={_id}
                      _id={_id}
                      name={name}
                      questions={questions}
                      showCount
                      compact
                    />
                ))
            ) : (
                <p className='body-regular text-dark500_light700'>
                    {popular.success ? "No tags yet." : "Couldn't load popular tags."}
                </p>
            )}
        </div>
    </div>

</section>
    );
};

export default RightSidebar;
