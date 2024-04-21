import { OpenloginSessionManager } from "@toruslabs/openlogin-session-manager";
import log from "loglevel";

// import { StartPageError } from "@/errors/startError";
// import { userModule } from "@/store";

const DEFAULT_SESSION_URL = "https://session.web3auth.io";

const REGIONAL_SESSION_URLS = ["https://session-us.web3auth.io", "https://session-sg.web3auth.io"];

export const fetchDataFromStorageServer = async <T>(identifier: string, sessionNamespace?: string, backOff = false): Promise<T> => {
  const maxRetries = 20;
  const initialDelayMs = 1000;
  const maxDelayMs = 30000;

  let retries = 0;

  const retry = async (): Promise<T> => {
    try {
      let sessionServerBaseUrl = DEFAULT_SESSION_URL;
      // if the session server url is set to default session url,
      // and the request failed, then we will try to use regional session urls
      // if we get a response from the regional session urls,
      // we will set the storage server url to the regional session url.
      if (retries > 0 && sessionServerBaseUrl === DEFAULT_SESSION_URL) {
        sessionServerBaseUrl = REGIONAL_SESSION_URLS[retries % 2];
      }
      const configManager = new OpenloginSessionManager<T>({
        sessionId: identifier,
        sessionNamespace,
        sessionServerBaseUrl,
      });

      const data = await configManager.authorizeSession();
      // if (data) userModule.setStorageServerUrl(sessionServerBaseUrl);
      return data;
    } catch (error: unknown) {
      if (retries < maxRetries && backOff) {
        retries += 1;
        const delay = Math.min(initialDelayMs * retries, maxDelayMs);
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, delay));
        return retry();
      }
      log.error("fetch data from storage server error", error);
      throw error;
    }
  };

  return retry();
};
