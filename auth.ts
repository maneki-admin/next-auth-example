import type { NextAuthConfig } from "next-auth"
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

import TorusUtils from "@toruslabs/torus.js";
import NodeDetailManager from "@toruslabs/fetch-node-details";
import { TORUS_SAPPHIRE_NETWORK } from "@toruslabs/constants";

const nodeManager = new NodeDetailManager({ network: TORUS_SAPPHIRE_NETWORK.SAPPHIRE_DEVNET });
const clientId = "BDdYKQcryiNGmRvziwdPo7PtONNJ1hA3foDqDhpZbu_iFyDOuFc9oE-b4N8Foh7amPdGFwSugpypY_Rn3htVMsA";

const torus = new TorusUtils({
  network: "sapphire_devnet",
  clientId,
});

export const config = {
  theme: {
    logo: "https://next-auth.js.org/img/logo/logo-sm.png",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  basePath: "/auth",
  callbacks: {
    async authorized({ request, auth }) {
      return true
    },
    async jwt({ token, user, account, trigger, session }) {
      // 0xecf830Da5A17e5F5F76fB60E7034397A756d7f47

      if (account) {
        const verifier = "kien-google";
        const verifierId = token.email as string;
        const verifierDetails = { verifier: verifier, verifierId: verifierId };
        const { torusNodeEndpoints, torusIndexes, torusNodePub } = await nodeManager.getNodeDetails(verifierDetails);

        const idToken = account.id_token as string;
        token.keyData = await torus.retrieveShares(torusNodeEndpoints, torusIndexes, verifier, {
          verifier_id: verifierId
        }, idToken);
      }

      if (trigger === "update") token.name = session.user.name
      if (user) { // User is available during sign-in
        token.id = user.id
      }
      console.log(token.keyData.finalKeyData, 'Final key data')
      return token
    },
    async session({ session, token }) {
      return session;
    },
  },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)
