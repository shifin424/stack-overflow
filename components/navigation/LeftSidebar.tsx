import React from 'react';
import NavLinks from './navbar/NavLinks';
import { Button } from '../ui/button';
import Link from 'next/link';
import ROUTES from '@/constants/routes';
import Image from 'next/image';
import { auth } from '@/auth';
import LogoutButton from './LogoutButton';

const LeftSidebar = async () => {
    const session = await auth();
    const userId = session?.user?.id;

    return (
<section className='custom-scrollbar background-light900_dark200 light-border sticky left-0 top-0 h-screen flex flex-col justify-between overflow-y-auto border-r p-6 pt-36 shadow-light-300 dark:shadow-none max-sm:hidden lg:w-[266px]'>
    <div className='flex flex-1 flex-col gap-6'>
        <NavLinks userId={userId} />
    </div>

    <div className='flex flex-col gap-3'>
        {userId ? (
            <LogoutButton />
        ) : (
            <>
        <Button
            nativeButton={false}
            render={<Link href={ROUTES.SIGN_IN} />}
            className='small-medium btn-secondary min-h-[41px] w-full rounded-lg px-4 py-3 shadow-none'
        >
            <Image
                src="/icons/account.svg"
                alt='Account'
                width={20}
                height={20}
                className='invert-colors lg:hidden'
                />
                <span className='primary-text-gradient max-lg:hidden'>Sign In</span>
        </Button>

        <Button
            nativeButton={false}
            render={<Link href={ROUTES.SIGN_UP} />}
            className='small-medium light-border-2 btn-tertiary text-dark400_light900 min-h-[41px] w-full border rounded-lg px-4 py-3 shadow-none'
        >
            <Image
                src="/icons/sign-up.svg"
                alt='Account'
                width={20}
                height={20}
                className='invert-colors lg:hidden'
                />
                <span className='max-lg:hidden'>Sign Up</span>
        </Button>
            </>
        )}
    </div>

</section>
    );
};

export default LeftSidebar;
