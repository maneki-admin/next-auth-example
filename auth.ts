import type {NextAuthConfig} from "next-auth"
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

import TorusUtils from "@toruslabs/torus.js";
import NodeDetailManager from "@toruslabs/fetch-node-details";
import { TORUS_SAPPHIRE_NETWORK } from "@toruslabs/constants";

const nodeManager = new NodeDetailManager({ network: TORUS_SAPPHIRE_NETWORK.SAPPHIRE_DEVNET });
const   clientId = "BDdYKQcryiNGmRvziwdPo7PtONNJ1hA3foDqDhpZbu_iFyDOuFc9oE-b4N8Foh7amPdGFwSugpypY_Rn3htVMsA";

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
      if(auth) {
      const verifier = "kien-google"; 
      const verifierId = auth.user?.email as string;
        const verifierDetails = { verifier: verifier, verifierId: verifierId };
        const { torusNodeEndpoints, torusIndexes, torusNodePub} = await nodeManager.getNodeDetails(verifierDetails);
        const address = await torus.getPublicAddress(torusNodeEndpoints, torusNodePub, verifierDetails);
        console.log(address)

        const tKey = address.finalKeyData.evmAddress.padStart(64, "0");
        console.log("tkey----", tKey)
        const [{ subkey }] = await Promise.all([import("@toruslabs/openlogin-subkey")]);

    const scopedKey = subkey(tKey, Buffer.from(clientId, "base64"));
    const privKey = tKey.padStart(64, "0");
    // const publicAddress = `0x${Buffer.from(
    //   pubToAddress(privateToPublic(getBufferFromHexKey(privKey)))
    // ).toString("hex")}`;
    // console.log(publicAddress, "public address");
      }
      
      return true
    },
    async jwt({ token, user, account, trigger, session }) {
      // 0xecf830Da5A17e5F5F76fB60E7034397A756d7f47

      // const nodeManager = new NodeDetailManager({ network: TORUS_SAPPHIRE_NETWORK.SAPPHIRE_DEVNET });
      // const torus = new TorusUtils({
      //   network: "sapphire_devnet",
      //   clientId: "BDdYKQcryiNGmRvziwdPo7PtONNJ1hA3foDqDhpZbu_iFyDOuFc9oE-b4N8Foh7amPdGFwSugpypY_Rn3htVMsA",
      // });
      // const verifier = "kien-google";
      //   const verifierId = token.email as string;
      //   const verifierDetails = { verifier: verifier, verifierId: verifierId };
      //   const { torusNodeEndpoints, torusIndexes, torusNodePub} = await nodeManager.getNodeDetails(verifierDetails);
      //   const publicAddress = await torus.getPublicAddress(torusNodeEndpoints, torusNodePub, verifierDetails);
      //   console.log("--------------public address----")
      //   console.log(publicAddress)
      //   console.log("--------------public address end----")
      // if (account) {
      //   console.log(account, "account")
      //   const idToken = account.id_token as string;
      //   token.keyData = await torus.retrieveShares(torusNodeEndpoints, torusIndexes, verifier, {
      //     verifier_id: verifierId
      //   }, idToken);
      // }

      // if (trigger === "update") token.name = session.user.name
      // if (user) { // User is available during sign-in
      //   token.id = user.id
      // }

      return token
    },
    async session({ session, token }) { 
      const loginId = session.userId;
      const sessionNamespace = "";
      // const loginConfig = await fetchDataFromStorageServer<OpenloginSessionConfig>(loginId, sessionNamespace, true);
      // console.log(loginConfig, "Login config")
      // const { options, params, actionType, sessionId } = loginConfig;
      // if (sessionId) {
      //   const sessionData = await fetchDataFromStorageServer<OpenloginSessionData>(sessionId, sessionNamespace);
      //   if (!sessionData) {
      //     console.warn("Session Id expired");
      //   } else {
      //     console.log(sessionData);
      //     const { X: oAuthKeyX, Y: oAuthKeyY, address: OAuthAddress } = getPublicFromPrivateKey(sessionData.oAuthPrivateKey as string);
      //     console.log("address");
      //     console.log(OAuthAddress)
      //   }
      // }

      return session;
    },
  },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)


