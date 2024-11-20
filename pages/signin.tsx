import { useSearchParams } from "next/navigation";

const SignIn = () => {
  const searchParams = useSearchParams();

  const error = searchParams.get("error");
  console.log(error);
  if (error === "OAuthAccountNotLinked")
    return (
      <div>
        <h1>Sign In</h1>
      </div>
    );
};

export default SignIn;
