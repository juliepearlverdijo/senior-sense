import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useAnalytics } from "@/lib/useAnalytics";

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    if (status === "authenticated") {
      trackEvent("user_login", { email: session?.user?.email });
    }
  }, [status, session, trackEvent]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  return <>{children}</>;
};

export default AuthWrapper;
