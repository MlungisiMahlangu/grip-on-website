import { z } from "zod";

// Zod's JIT parser uses `new Function`, which strict CSP blocks in the browser.
z.config({ jitless: true });

export { z };
