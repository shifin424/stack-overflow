import Link from "next/link";

import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/routes";

const NotFound = () => (
  <div className="mt-24 flex flex-col items-center gap-4 text-center">
    <h2 className="h2-bold text-dark200_light900">Nothing here</h2>
    <p className="body-regular text-dark500_light700">The page you&apos;re looking for doesn&apos;t exist or was removed.</p>
    <Button nativeButton={false} render={<Link href={ROUTES.HOME} />} className="primary-gradient !text-light-900">
      Back home
    </Button>
  </div>
);

export default NotFound;
