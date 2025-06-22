const express = require("express");
const cors = require("cors");
const agriRoutes = require("./routes/agri");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/agri", agriRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ AgroSathi server running on port ${PORT}`));
