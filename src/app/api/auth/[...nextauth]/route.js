import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "../../../lib/dbconnect"; // your MongoDB connection utility
import User from "../../../models/User"; // your user model
import bcrypt from "bcryptjs";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "Enter your email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter both email and password.");
        }

        await dbConnect();

        const user = await User.findOne({ email: credentials.email }).select("+password");
        if (!user) {
          throw new Error("No user found with this email.");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          throw new Error("Incorrect password.");
        }

        return {
          id: user._id,
          name: user.username,
          email: user.email,
        };
      }
    })
  ],
  pages: {
    signIn: "/", // your login page
    error: "/auth/error", // optional: error redirect
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
   async jwt({ token, user }) {
  if (user) token.user = user; // includes { id, name, email }
  return token;
},
async session({ session, token }) {
  session.user = token.user;
  return session;
    },
  }
});

export { handler as GET, handler as POST };
