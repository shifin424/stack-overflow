"use client"

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

import ROUTES from '@/constants/routes';
import { toast } from '@/hooks/use-toast';
import { signIn } from 'next-auth/react';

const SocialAuthForm = () => {
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const buttonClass = "background-dark400_light900 body-medium text-dark200_light800 min-h-12 flex-1 rounded-2 px-4 py-3.5";

    const handleSignIn = async (provider: "github") => {
        const callback = searchParams.get("callbackUrl");
        const callbackUrl = callback?.startsWith("/") && !callback.startsWith("//") ? callback : ROUTES.HOME;

        setIsLoading(true);
        try {
          // Redirects to the provider; control only returns here if that fails.
          await signIn(provider, { callbackUrl });
        } catch (error) {
          setIsLoading(false);
          toast({
            title: "Sign-in Failed",
            description:
              error instanceof Error
                ? error.message
                : "An error occurred during sign-in",
            variant: "destructive",
          });
        }
      };


    return (
        <div className='mt-10 flex flex-wrap gap-2.5'>
            <Button className={buttonClass} disabled={isLoading} onClick={() => handleSignIn("github")}>
                {isLoading ? (
                    <Loader2 className='mr-2.5 size-5 animate-spin' />
                ) : (
                    <Image
                        src="/icons/github.svg"
                        alt='Github Logo'
                        width={20}
                        height={20}
                        className='invert-colors mr-2.5 object-contain'
                    />
                )}
            <span>{isLoading ? "Redirecting..." : "Log in with GitHub"}</span>
            </Button>
        </div>
    );
};

export default SocialAuthForm;
