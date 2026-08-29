import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const dataDir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../data');
fs.mkdirSync(dataDir,{recursive:true});
export const db=new Database(path.join(dataDir,'okinawa.sqlite'));
db.pragma('journal_mode = WAL');
db.exec(`CREATE TABLE IF NOT EXISTS trips(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS itinerary_items(id INTEGER PRIMARY KEY AUTOINCREMENT,trip_id INTEGER NOT NULL,date TEXT,time TEXT,title TEXT NOT NULL,description TEXT DEFAULT '',category TEXT DEFAULT '',sort_order INTEGER DEFAULT 0,FOREIGN KEY(trip_id) REFERENCES trips(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS expenses(id INTEGER PRIMARY KEY AUTOINCREMENT,trip_id INTEGER NOT NULL,date TEXT,category TEXT,amount_jpy REAL NOT NULL,twd REAL NOT NULL,rate REAL NOT NULL,note TEXT DEFAULT '',created_at TEXT NOT NULL,FOREIGN KEY(trip_id) REFERENCES trips(id) ON DELETE CASCADE);`);
