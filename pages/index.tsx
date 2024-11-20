import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, LogIn, Mail } from "lucide-react";
import Image from "next/image";

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isSignUpDialogOpen, setIsSignUpDialogOpen] = useState(false);
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false);
  const [signUpErrorMessage, setSignUpErrorMessage] = useState("");
  const [signInErrorMessage, setSignInErrorMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (isValidEmail(email)) {
      setSignUpErrorMessage("");
    }
  }, [email]);

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setSignInErrorMessage("");
    try {
      const result = await signIn("google", {
        callbackUrl: "/senior-sense-demo",
      });
      if (result?.error) {
        console.error("Authentication failed:", result.error);
        setSignInErrorMessage(
          "There was an error signing in with Google. Please try again."
        );
      }
    } catch (error) {
      console.error("Authentication failed:", error);
      setSignInErrorMessage(
        "There was an error signing in with Google. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCognitoAuth = async () => {
    setIsLoading(true);
    setSignInErrorMessage("");
    try {
      const result = await signIn("cognito", {
        callbackUrl: "https://senior-sense.vercel.app/senior-sense-demo",
      });
      console.log(result);
      if (result?.error) {
        console.error("Authentication failed:", result.error);
        setSignInErrorMessage(
          "There was an error signing in with Google. Please try again."
        );
      } else {
        localStorage.setItem("isLoggedIn", "true");
      }
    } catch (error) {
      console.error("Authentication failed:", error);
      setSignInErrorMessage(
        "There was an error signing in with Google. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    setIsLoading(true);
    setSignInErrorMessage("");
    try {
      const result = await signIn("email", {
        email,
        callbackUrl: "https://senior-sense.vercel.app/senior-sense-demo",
      });
      console.log(result);
      if (result?.error) {
        console.error("Authentication failed:", result.error);
        setSignInErrorMessage(
          "There was an error signing in with Google. Please try again."
        );
      }
    } catch (error) {
      console.error("Authentication failed:", error);
      setSignInErrorMessage(
        "There was an error signing in with Google. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookAuth = async () => {
    setIsLoading(true);
    setSignInErrorMessage("");
    try {
      const result = await signIn("facebook", {
        callbackUrl: "/senior-sense-demo",
      });
      if (result?.error) {
        console.error("Authentication failed:", result.error);
        setSignInErrorMessage(
          "There was an error signing in with Google. Please try again."
        );
      }
    } catch (error) {
      console.error("Authentication failed:", error);
      setSignInErrorMessage(
        "There was an error signing in with Facebook. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpRequest = async () => {
    if (!isValidEmail(email)) {
      setSignUpErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setSignUpErrorMessage("");
    try {
      const response = await fetch("/api/request-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setEmail("");
        setIsSignUpDialogOpen(false);
        alert(
          "Your access request has been sent. Please try again after some time."
        );
        setTimeout(() => {
          router.push("/");
        }, 3000);
      } else {
        throw new Error("Failed to send request");
      }
    } catch (error) {
      console.error("Failed to send access request:", error);
      setSignUpErrorMessage(
        "There was an error sending your access request. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email: string) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (isValidEmail(e.target.value)) {
      setSignUpErrorMessage("");
    }
  };

  return (
    <>
      <div className="h-screen flex justify-center">
        <div className="w-full h-screen overflow-hidden absolute left-0 top-0 z-[2] pointer-events-none">
          <div className="border-0 bg-[url('/background.svg')] bg-center bg-no-repeat bg-cover w-full h-1/2 absolute left-0 top-0 z-[1] max-h-[400px]"></div>
          <div className="absolute left-1/2 top-[230px] w-full max-w-[590px] aspect-square rounded-full bg-white z-[2] -translate-x-1/2"></div>
        </div>
        <div className="w-full h-full border-0 relative z-[3] bg-transparent">
          <div className="flex flex-col items-center justify-center h-[230px]">
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
          </div>
          <div className="pb-12 pt-16 max-w-[614px] lg:w-3/5 w-full mx-auto flex-1">
            <Image
              src="/sign-in.svg"
              alt="Senior Sense Logo Sign In"
              width={200}
              height={200}
              className="mx-auto w-48 h-auto mb-8"
            />
            <div className="text-center text-base mb-8">
              <p className="py-10">
                Start your journey with us in no time. <br />
                Just continue with your favorite account.
              </p>
              <div className="flex flex-col gap-5 w-96 mx-auto">
                <Button
                  variant="default"
                  size="lg"
                  className="w-full flex items-center justify-center h-11"
                  onClick={handleGoogleAuth}
                >
                  <Image
                    src="/google2.svg"
                    alt="Google"
                    width={200}
                    height={200}
                    className="mr-5 w-5 h-auto"
                  />
                  Sign In with Google
                </Button>
                <Button
                  variant="default"
                  size="lg"
                  className="w-full flex items-center justify-center h-11"
                  onClick={handleFacebookAuth}
                >
                  <Image
                    src="/fb.svg"
                    alt="facebook"
                    width={200}
                    height={200}
                    className="mr-5 w-3 h-auto"
                  />
                  Sign In with Facebook
                </Button>
                <Button
                  variant="default"
                  size="lg"
                  className="w-full flex items-center justify-center h-11"
                  onClick={handleGoogleAuth}
                >
                  <Image
                    src="/apple.svg"
                    alt="apple"
                    width={200}
                    height={200}
                    className="mr-5 w-7 h-auto"
                  />
                  Sign In with Apple
                </Button>
                <Button
                  variant="default"
                  size="lg"
                  className="w-full flex items-center justify-center h-11"
                  onClick={handleCognitoAuth}
                >
                  <Image
                    src="/amazon.svg"
                    alt="amazon"
                    width={200}
                    height={200}
                    className="mr-5 w-7 h-auto"
                  />
                  Sign In with Amazon
                </Button>
                <Button
                  variant="default"
                  size="lg"
                  className="w-full flex items-center justify-center h-11"
                  onClick={handleEmailAuth}
                >
                  <Image
                    src="/email-icon.svg"
                    alt="email"
                    width={200}
                    height={200}
                    className="mr-5 w-7 h-auto"
                  />
                  Sign In with Email
                </Button>
              </div>
              {isLoading && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mx-auto mt-10"></div>
              )}
            </div>
            <div className="flex flex-col justify-center gap-y-5 mt-4 max-w-[370px] mx-auto"></div>
          </div>
        </div>
      </div>
    </>
  );
}
