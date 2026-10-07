"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ROUTES from "@/constants/routes";
import { toast } from "@/hooks/use-toast";
import { updateUser } from "@/lib/actions/user.action";
import { UpdateUserSchema } from "@/lib/validations";

const inputClass =
  "paragraph-regular background-light800_dark300 light-border-2 text-dark300_light700 no-focus min-h-12 rounded-1.5 border";

const fields = [
  { name: "name", label: "Full name", placeholder: "Your full name" },
  { name: "username", label: "Username", placeholder: "Your username" },
  { name: "portfolio", label: "Portfolio link", placeholder: "https://your-site.com" },
  { name: "location", label: "Location", placeholder: "Where are you based?" },
] as const;

const ProfileForm = ({ user }: { user: User }) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof UpdateUserSchema>>({
    resolver: zodResolver(UpdateUserSchema),
    defaultValues: {
      name: user.name,
      username: user.username,
      portfolio: user.portfolio ?? "",
      location: user.location ?? "",
      bio: user.bio ?? "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof UpdateUserSchema>) => {
    const result = await updateUser(values);

    if (!result.success) {
      return toast({
        title: "Failed to update profile",
        description: result.error?.message,
        variant: "destructive",
      });
    }

    toast({ title: "Profile updated" });
    router.push(ROUTES.PROFILE(user._id));
    router.refresh();
  };

  return (
    <Form {...form}>
      <form className="mt-9 flex w-full flex-col gap-9" onSubmit={form.handleSubmit(handleSubmit)}>
        {fields.map(({ name, label, placeholder }) => (
          <FormField
            key={name}
            control={form.control}
            name={name}
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className="paragraph-semibold text-dark400_light800">
                  {label} {(name === "name" || name === "username") && <span className="text-primary-500">*</span>}
                </FormLabel>
                <FormControl>
                  <Input placeholder={placeholder} className={inputClass} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col">
              <FormLabel className="paragraph-semibold text-dark400_light800">Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What's special about you?"
                  rows={5}
                  className="paragraph-regular background-light800_dark300 light-border-2 text-dark300_light700 no-focus rounded-1.5 border"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting} className="primary-gradient w-fit !text-light-900">
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Saving...
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProfileForm;
