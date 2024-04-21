import { handlers } from "auth"
export const { GET, POST } = handlers

export const config = {
    experimental: {
        runtime: 'nodejs'
    }
};
