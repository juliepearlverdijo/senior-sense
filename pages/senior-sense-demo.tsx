import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import SeniorSenseDemo from "../components/SeniorSenseDemo";
import AuthWrapper from "@/components/AuthWrapper";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";

export default function SeniorSenseDemoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    console.log(session);
    if (status === "unauthenticated") {
      router.push("/");
    }

    if (session && !session.user.profileComplete) {
      router.push("/profile-completion");
    }
  }, [status, router, session]);

  if (status === "loading") {
    return (
      <div className="flex h-full items-center justify-center">Loading...</div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <AuthWrapper>
      <SeniorSenseDemo />
    </AuthWrapper>
  );
}
