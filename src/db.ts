import dotenv from "dotenv";
import postgres from "postgres";

dotenv.config();

const sql = postgres(process.env.DATABASE_URL);

export default sql;
