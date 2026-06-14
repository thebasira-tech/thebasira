// src/server/seed/runMockMarketData.ts
import { seedMockMarketData } from "./seedMockMarketData";

seedMockMarketData(120, 317)
  .then((result) => {
    console.log("✅ Done:", result);
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });