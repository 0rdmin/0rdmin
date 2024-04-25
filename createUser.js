const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const readline = require('readline');
const fs = require('fs');

const dbFile = 'users.db';

if (fs.existsSync(dbFile)) {
  console.log('The database already exists.');
  process.exit(1);
}

const db = new sqlite3.Database(dbFile);

db.serialize(() => {
  db.run(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL
    )
  `, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('User table created successfully.');
    }
  });
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter username: ', (username) => {
  rl.question('Enter password: ', (password) => {
    bcrypt.hash(password, 10, (err, passwordHash) => {
      if (err) {
        console.error('Error encrypting password:', err);
        rl.close();
        return;
      }

      const dbPath = 'users.db';
      const db = new sqlite3.Database(dbPath);

      db.run(
        'INSERT INTO users (username, passwordHash) VALUES (?, ?)',
        [username, passwordHash],
        function(err) {
          if (err) {
            console.error('Error inserting user:', err.message);
          } else {
            console.log('New user inserted successfully. ID:', this.lastID);
          }

          db.close((err) => {
            if (err) {
              console.error('Error closing database:', err.message);
            } else {
              console.log('Database closed successfully.');
            }
            rl.close();
          });
        }
      );
    });
  });
});
