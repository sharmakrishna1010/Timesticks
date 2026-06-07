import app from "./app.js";
import connectToDB from "./db/connectToDB.js"
import dotenv from "dotenv";
import dns from 'node:dns';
import "./services/cronService.js";

dns.setServers(['8.8.8.8', '1.1.1.1']);

dotenv.config();

const PORT = process.env.PORT || 5000;

connectToDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on : http://localhost:${PORT}`);
    })
}).catch((error) => {
    console.log("server: DATABASE CONNECTION FAIL\nERROR:", error)
    process.exit(1);
});


