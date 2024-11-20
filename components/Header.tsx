import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { LogOut, Home } from "lucide-react";
import Image from "next/image";
import { AppDispatch } from "@/store/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/lib/useAnalytics";
import {
  emptyConversationData,
  setConversationData,
} from "@/store/features/conversation-slice";

const Header = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { trackEvent } = useAnalytics();
  const { data: session, status } = useSession();

  const handleSignOut = async () => {
    trackEvent("user_logout", { email: session?.user?.email });
    dispatch(emptyConversationData());
    await signOut({ callbackUrl: "/" });
  };

  const handleHome = () => {
    router.push("/senior-sense-demo");
  };

  return (
    <header className="flex flex-col items-center h-[270px] px-12 pt-5">
      <div className="w-full flex justify-between items-center mb-4">
        {session && (
          <p className="text-sm text-accent">{session.user?.email}</p>
        )}
        <div>
          <Button
            onClick={handleHome}
            variant="ghost"
            className="hover:bg-transparent hover:opacity-50 p-2"
          >
            <Home color="#2E4672" size={24} />
          </Button>
          <Button
            onClick={handleSignOut}
            variant="ghost"
            className="hover:bg-transparent hover:opacity-50 p-2"
          >
            <LogOut color="#2E4672" size={24} />
          </Button>
        </div>
      </div>
      <Image
        src="/logo.svg"
        alt="Senior Sense Logo"
        width={200}
        height={200}
        className="mb-2 w-20 h-auto"
      />
      <h1 className="text-2xl text-center text-accent font-semibold">
        Senior Sense Demo
      </h1>
      <h2 className="text-center lg:text-base text-sm">
        Your Caring Companion for Health and Wellness
      </h2>
    </header>
  );
};

export default Header;
