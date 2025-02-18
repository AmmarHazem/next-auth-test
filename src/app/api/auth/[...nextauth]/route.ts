import NextAuth, { Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import CredentialsProvider from "next-auth/providers/credentials";
import { createCipheriv, randomBytes } from "crypto";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID!,
      clientSecret: process.env.APPLE_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { email, password } = loginSchema.parse(credentials);
          // TODO: Replace this with your actual user authentication logic
          if (email === "test@example.com" && password === "password123") {
            return {
              id: "1",
              email,
              name: "Test User",
            };
          }
          return null;
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt(params) {
      const { token, user, account } = params;
      console.log("JWT === ", params);
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          userId: user.id,
        };
      }
      return token;
    },
    async session(params) {
      const { session } = params;
      console.log("--------");
      console.log("SESSION === ", params);
      console.log("--------");
      return { ...session, jwt: encryptSession(session) };
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

function encryptSession(session: Session): string {
  const text = JSON.stringify(session);
  const algorithm = "aes-256-cbc";
  const key = Buffer.from(process.env.NEXTAUTH_SECRET!, "utf-8").slice(0, 32);
  const iv = randomBytes(16);
  const cipher = createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

// function decryptSession(text: string): Session | null {
//   try {
//     const algorithm = "aes-256-cbc";
//     const key = Buffer.from(process.env.NEXTAUTH_SECRET!, "utf-8").slice(0, 32);
//     const [ivHex, encryptedText] = text.split(":");
//     const iv = Buffer.from(ivHex, "hex");
//     const decipher = createDecipheriv(algorithm, key, iv);
//     let decrypted = decipher.update(encryptedText, "hex", "utf8");
//     decrypted += decipher.final("utf8");
//     return JSON.parse(decrypted);
//   } catch (e) {
//     console.log("--- decryptSession error", e);
//     return null;
//   }
// }

export { handler as GET, handler as POST };
