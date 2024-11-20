import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CognitoProvider from "next-auth/providers/cognito";
import EmailProvider from "next-auth/providers/email";
import { JWT } from "next-auth/jwt";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/database";
import { encrypt } from "@/lib/utils";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
};

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: any;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    account: any;
  }
}

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
    }),
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID as string,
      clientSecret: process.env.COGNITO_CLIENT_SECRET as string,
      issuer: process.env.COGNITO_ISSUER,
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: 465,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  adapter: PrismaAdapter(prisma),
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      session.user.profileComplete = currentUser?.profileComplete || false;
      return session;
    },
    async signIn({ user, account, profile, email, credentials }) {
      // Check if the email already exists in the database
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email || "" },
      });

      if (existingUser) {
        // If the user exists but the account is not already linked
        const existingAccount = await prisma.account.findFirst({
          where: {
            userId: existingUser.id,
            provider: account?.provider,
          },
        });

        if (existingAccount) {
          // The account is already linked, proceed with sign-in
          return true;
        } else {
          await prisma.account.create({
            data: {
              userId: existingUser.id,
              provider: account?.provider || "",
              providerAccountId: account?.providerAccountId || "",
              type: account?.type || "",
              access_token: account?.access_token,
              token_type: account?.token_type,
              expires_at: account?.expires_at,
            },
          });
          return true;
        }
      } else {
        // If the user doesn't exist, create a new user and link the account
        const newUser = await prisma.user.create({
          data: {
            email: user.email,
            name: user.name,
            image: user.image,
          },
        });

        // Link the account (Google, Facebook, etc.)
        await prisma.account.create({
          data: {
            userId: newUser.id,
            provider: account?.provider || "",
            providerAccountId: account?.providerAccountId || "",
            type: account?.type || "",
            access_token: account?.access_token,
            token_type: account?.token_type,
            expires_at: account?.expires_at,
          },
        });

        return true; // Proceed with sign-in
      }
    },
  },
  session: {
    maxAge: 24 * 60 * 60, // 24 hours in seconds
    strategy: "jwt",
  },
  // pages: {
  //   signIn: "/signin",
  //   error: "/error",
  // },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
});
