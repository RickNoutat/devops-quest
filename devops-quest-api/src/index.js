/**
 * DevOps Quest API — Point d'entrée
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const app = require("./app");

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 DevOps Quest API → http://localhost:${PORT}`);
});
