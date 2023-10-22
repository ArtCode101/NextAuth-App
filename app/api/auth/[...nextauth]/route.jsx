import NextAuth from "next-auth/next";
import prisma from '../../../libs/prismadb'
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import bcrypt from 'bcrypt';

export const authOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET,
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: {label : "Email",type : "text",placeholder: "jsmith"},
                password: {label: "Password",type: "password"},
                username: {label: "Username",type:"text",placeholder: "John Smith"}
            },
            async authorize(credentials){
                
                console.log(`Hello ${JSON.stringify(credentials)}`);
                //check email and password
                if (!credentials.email || !credentials.password){
                    throw new Error('Please enter an email and password')
                }
                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email
                    }
                })
                console.log(`user ${JSON.stringify(user)}`);
                if (!user || !user?.hashedPassword){
                    throw new Error('No user found')
                }
                const passwordMatch = await bcrypt.compare(credentials.password, user.hashedPassword);
                console.log(`passwordMatch ${passwordMatch}`);
                if(!passwordMatch){
                    throw new Error('Incorrect password')
                }
                console.log(`user2 ${JSON.stringify(user)}`);
                return user;

            }
        })
    ],
    secret: process.env.SECRET,
    session: {
        strategy: "jwt",
    },
    debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }