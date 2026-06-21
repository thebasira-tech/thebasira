import { seedInflation } from "./seedInflation";

seedInflation()
  .then((result) => {
    console.log("✅ Done:", result);
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });