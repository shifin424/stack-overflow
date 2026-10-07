import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import ProfileForm from "@/components/forms/ProfileForm";
import ROUTES from "@/constants/routes";
import { getUser } from "@/lib/actions/user.action";

const EditProfile = async () => {
  const session = await auth();
  if (!session?.user?.id) return redirect(ROUTES.SIGN_IN);

  const { success, data } = await getUser({ userId: session.user.id });
  if (!success || !data) return notFound();

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Edit Profile</h1>
      <ProfileForm user={data.user} />
    </>
  );
};

export default EditProfile;
