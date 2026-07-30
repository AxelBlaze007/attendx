import { app } from "./app";

const PORT = Number(process.env.PORT) || 4000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 AttendX API server running on http://localhost:${PORT}`);
  });
}

export default app;
