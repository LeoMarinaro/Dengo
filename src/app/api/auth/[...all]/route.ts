import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

// Recebe todas as chamadas de login/logout/sessão do Better Auth.
export const { GET, POST } = toNextJsHandler(auth);
