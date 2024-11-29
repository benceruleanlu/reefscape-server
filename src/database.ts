import sqlite from 'sqlite3';
import { open, Database, Statement } from 'sqlite'

let db: Database;
let insertStmt: Statement<sqlite.Statement>;
export async function init() {
  db = await open({ filename: "databse.db", driver: sqlite.Database });
  await db.exec("CREATE TABLE IF NOT EXISTS scouters (student_number INTEGER PRIMARY KEY, name TEXT)");
  insertStmt = await db.prepare('INSERT INTO scouters (student_number, name) VALUES (?, ?)');
}

export async function insertScouter(studentNumber: number, name: string) {
  insertStmt.run(studentNumber, name);
}

export async function getScouters(): Promise<Array<any>> {
  let res = await db.all("SELECT * FROM scouters;");
  return res;
}

