import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

const sqlite = new Database("data/bookmarks.db");
sqlite.pragma("foreign_keys = ON");
migrate(drizzle(sqlite), { migrationsFolder: "./drizzle" });
console.log("マイグレーションを適用しました");