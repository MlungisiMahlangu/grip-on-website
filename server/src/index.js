// Local dev entry — imports app and starts listening.
// Vercel uses api/index.js instead (imports app without listening).

import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
