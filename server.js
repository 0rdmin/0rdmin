// Require
const config = require('./config');
const express = require('express');
const axios = require('axios');
const path = require('path');
const { exec } = require('child_process');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const app = express();
app.use(express.urlencoded({ extended: true }));

// Middleware to serve CSS files with the correct content type
app.use(express.static(__dirname, {
  setHeaders: (res, path, stat) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  },
}));

// Initialize database connection
const dbPath = 'users.db';
const db = new sqlite3.Database(dbPath);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Internal server error');
});

const sessionSecret = crypto.randomBytes(32).toString('hex');

// Definition of the initializeSession function
const initializeSession = (req, res, next) => {
  if (!req.session.user) {
    req.session.user = null;
  }
  next();
};

// Definition of the authenticateUser function
const authenticateUser = (req, res, next) => {
  console.log("Session user:", req.session.user);
  if (req.session && req.session.user) {   
    next();
  } else {    
    console.log("Redirecting to login because session user is not set.");
    res.redirect('/login');
  }
};

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // Session lifetime in milliseconds (here set to 24 hours)
  }
}));
console.log("Session middleware configured successfully");


// --------- GET ROUTES --------- //


app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login', 'index.html'));
});

// Route to log out
app.get('/logout', (req, res) => {  
  req.session.destroy((err) => {
      if (err) {
          console.error('Error destroying session:', err);
          return res.status(500).send('Error logging out');
      }
      console.log('User logged out');      
      res.redirect('/login');
  });
});

app.get('/server', initializeSession, authenticateUser, (req, res) => {
  res.send(`
        <html>
          <head>
            <title>0rdmin</title>
            <link rel="stylesheet" type="text/css" href="/styles.css">
            <script src="/ordminlib.js"></script>

            </head>
            <body>
            <script> document.body.innerHTML += mainMenu();  </script>
              <div class="menu-content">
                <h1>0rdmin</h1>
                <hr>
                
                <div class="button-row">
                    <form action="/start-bitcoind" method="post">
                        <button type="submit">Start bitcoind</button>
                    </form>
                    
                    <form action="/stop-bitcoind" method="post">
                        <button type="submit">Stop bitcoind</button>
                    </form>
                </div>
                
                <hr>
                
                <div class="button-row">
                    <form action="/start-ord" method="post">
                        <button type="submit">Start ord</button>
                    </form>
                    
                    <form action="/stop-ord" method="post">
                        <button type="submit">Stop ord</button>
                    </form>
                </div>  <hr>  

                <div class="intro-container">
                    <div class="intro-text">                      
                      <p>
                      Guidelines: Start Bitcoind first, then wait for the Bitcoin server to initialize before starting Ord.
                      </p>                      
                    </div>
                </div><hr> 
            <script> document.body.innerHTML += createFooter(); </script> 
          </body>
          </html>
  
  `);
});

app.get('/mint', authenticateUser, (req, res) => {
  res.send(` 
        <html>
          <head>
            <title>0rdmin</title>
            <link rel="stylesheet" type="text/css" href="/styles.css">
            <script src="/ordminlib.js"></script>

            </head>
            <body>
            <script> document.body.innerHTML += mainMenu();  </script>
              <div class="menu-content">
                <h1>0rdmin</h1>
                <hr>  
                
                <div class="address-return-container">
                <label for="addressReturn">Address Return: </label>
                <p id="addressReturn" class="address-return">${config.address_return}</p>
                This is the address configured to receive your minted runes. If you don't see any addresses, check the config.
            </div>

            <hr>
              
              <div class="form-container">
                  <form action="/mint-rune" method="post">
                      <div>
                          <label for="feeRate">Fee Rate:</label>
                          <input type="text" id="feeRate" name="feeRate" required>
                      </div>
                  
                      <div>
                          <label for="runeName">Name Rune:</label>
                          <input type="text" id="runeName" name="runeName" required>
                      </div>
                      
                      <button type="submit">Mint</button>
                  </form>
              </div>
          </div>

              <div id="output"></div>      

            <script> getCurrentFeeRate(); </script>

            <div class="feeRatesList" id="feeRatesList"></div>

          <iframe src="http://${config.ip_server}/runes" style="width:100%; height:900px;"></iframe>
                
            </div>
            
            <script> document.body.innerHTML += createFooter();  </script>
            

          </body>
        </html>
  `);
});

app.get('/infos', authenticateUser, (req, res) => {
  res.send(`
      <html>
        <head>
          <title>0rdmin</title>
          <link rel="stylesheet" type="text/css" href="/styles.css">
          <script src="/ordminlib.js"></script>

          </head>
          <body>
          <script> document.body.innerHTML += mainMenu();  </script>
            <div class="menu-content">
              <h1>0rdmin</h1><hr>  

              <div class="button-row">
              <form action="/get-balance" method="post">
                  <button type="submit">Runes</button>
              </form></div><hr>

              <div class="button-row">
                  <form action="/get-transactions" method="post">
                  <button type="submit">Transactions</button>
              </form></div><hr>

              <div class="button-row">
                  <form action="/get-bitcoin-transactions" method="post">
                  <button type="submit">All Transactions </button>
              </form></div><hr>   

              <div class="button-row">
                  <form action="/get-send-bitcoin-transactions" method="post">
                  <button type="submit">Transactions Sent</button>
              </form></div><hr>         
                  
            </div>
          
          <script> document.body.innerHTML += createFooter();  </script>

      </body>
    </html>
  `);
});

// GET route to get bitcoind status
app.get('/bitcoind-status', (req, res) => {
  res.send({ status: bitcoindStatus });
});

// GET route to get ord status
app.get('/ord-status', (req, res) => {
  res.send({ status: ordStatus });
});


// --------- POST ROUTES --------- //


app.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log("Received login request. Username:", username);

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
    console.log("Searching for user in the database. Username:", username);
    if (err) {
      console.error('Error when searching for user:', err);
      return res.status(500).send('Error processing the request');
    }

    if (!row) {
      console.log('User not found');
      return res.status(401).send('Invalid credentials');
    }

    bcrypt.compare(password, row.passwordHash, (err, result) => {
      console.log("Comparing passwords for user:", username);
      if (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).send('Error processing the request');
      }

      if (result) {
        req.session.user = row.id;
        console.log("User session set:", req.session.user);
        console.log("Redirecting user to '/server' after successful login");
        res.redirect('/server');
      } else {
        console.log('Invalid password');
        res.status(401).send('Invalid credentials');
      }
    });
  });
});

let bitcoindStatus = 'OFF';

// POST route to start bitcoind
app.post('/start-bitcoind', authenticateUser, (req, res) => {
  exec(`${config.bitcoin_path}bitcoind -daemon`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error when starting bitcoind: ${error.message}`);
      return res.status(500).send('Error when starting bitcoind');
    }
    if (stderr) {
      console.error(`Error when starting bitcoind: ${stderr}`);
      return res.status(500).send('Error when starting bitcoind');
    }
    console.log(`bitcoind started: ${stdout}`);
    bitcoindStatus = 'ON';
    res.sendStatus(200);
  });
});

// POST route to stop bitcoind
app.post('/stop-bitcoind', authenticateUser, (req, res) => {
  exec(`${config.bitcoin_path}bitcoin-cli stop`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error when stopping bitcoind: ${error.message}`);
      return res.status(500).send('Error when stopping bitcoind');
    }
    if (stderr) {
      console.error(`Error when stopping bitcoind: ${stderr}`);
      return res.status(500).send('Error when stopping bitcoind');
    }
    console.log(`bitcoind stopped: ${stdout}`);
    bitcoindStatus = 'OFF';
    res.sendStatus(200);
  });
});

let ordStatus = 'OFF';

// POST route to start the ord
app.post('/start-ord', authenticateUser, (req, res) => {
  exec(`sudo ${config.ord_path}ord --cookie-file ${config.cookie_file}.cookie --index-runes --index-sats server`, (error, stdout, stderr) => {
    if (error || stderr) {
      console.error(`Error starting the server ord: ${error || stderr}`);
      return res.status(500).send('Error starting the server ord');
    }

    console.log(`Ord server started: ${stdout}`);
    ordStatus = 'ON';

    setTimeout(() => {
      res.redirect('/mint');
    }, 5000); // 5000 milliseconds = 5 seconds
  });
});

// POST route to stop the ord
app.post('/stop-ord', authenticateUser, (req, res) => {
  ordStatus = 'SHUTTING DOWN';
  res.send('Initiating shutdown process for Ord server');
  exec('sudo pkill -INT ord', (error, stdout, stderr) => {
    if (error || stderr) {
      console.error(`Error stopping server ord: ${error || stderr}`);
      ordStatus = 'OFF';
      return;
    }
    console.log(`Ord server stopped: ${stdout}`);
    ordStatus = 'OFF';
    process.exit(); // Encerra o servidor
  });
});

// POST route to perform minting
app.post('/mint-rune', authenticateUser, (req, res) => {
    const runeName = req.body.runeName;
    const feeRate = req.body.feeRate;
  
    const command = `${config.ord_path}ord --cookie-file ${config.cookie_file}.cookie wallet mint --fee-rate ${feeRate} --rune ${runeName} --destination ${config.address_return}`;
  
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error when minting RUNE: ${error.message}`);
        return res.status(500).send('Error when minting RUNE:');
      }
      if (stderr) {
        console.error(`Error when minting RUNE: ${stderr}`);
        return res.status(500).send('Error when minting RUNE:');
      }
      console.log(`RUNE minting carried out successfully: ${stdout}`);
      res.send('RUNE minting carried out successfully:');  
      
      console.log('Transaction information:');
      console.log(stdout);
    });
  });

// POST route to obtain the wallet balance
  app.post('/get-balance', authenticateUser, (req, res) => {
    exec(`${config.ord_path}ord --cookie-file ${config.cookie_file}.cookie wallet balance`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error getting wallet balance: ${error.message}`);
        return res.status(500).send('Error getting wallet balance');
      }
      if (stderr) {
        console.error(`Error getting wallet balance: ${stderr}`);
        return res.status(500).send('Error getting wallet balance');
      }
      console.log(`Wallet balance: ${stdout}`);      
      const balanceData = JSON.parse(stdout);

      const formattedOutput = `
        <html>
          <head>
            <title>Wallet Balance</title>
            <link rel="stylesheet" type="text/css" href="/styles.css">    
            <script src="/ordminlib.js"></script>        
          </head>
          <body>          
            <div class="balance-container">
              <h2>Wallet Balance</h2>
              <p>Cardinal: ${balanceData.cardinal}</p>
              <p>Ordinal: ${balanceData.ordinal}</p>
              <h3>Rune Balances</h3>
              <ul>
                ${Object.entries(balanceData.runes).map(([rune, amount]) => `<li>${rune}: ${amount}</li>`).join('')}
              </ul>
              <p>Runic: ${balanceData.runic}</p>
              <p>Total: ${balanceData.total}</p>
            </div>
            <script src="../ordminlib.js"></script>
            <script>    
              document.body.innerHTML += createFooter();
            </script>
          </body>
        </html>
      `;      
      res.send(formattedOutput);
    });
  });

// POST route to obtain wallet transactions
  app.post('/get-transactions', authenticateUser, (req, res) => {
    exec(`${config.ord_path}ord --cookie-file ${config.cookie_file}.cookie wallet transactions`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error getting wallet transactions: ${error.message}`);
        return res.status(500).send('Error getting wallet transactions');
      }
      if (stderr) {
        console.error(`Error getting wallet transactions: ${stderr}`);
        return res.status(500).send('Error getting wallet transactions');
      }
      
      const transactions = JSON.parse(stdout);

      const formattedTransactions = transactions.map(transaction => `
        <li>Transaction: ${transaction.transaction}, Confirmations: ${transaction.confirmations}</li><p>
      `).join('');

      const formattedOutput = `
        <html>
          <head>
            <title>Wallet Transactions</title>
            <link rel="stylesheet" type="text/css" href="/styles.css">    
            <script src="/ordminlib.js"></script>        
          </head>
          <body>
          <script> document.body.innerHTML += mainMenu();  </script>
            <div class="transactions-container">
              <h2>Wallet Transactions</h2>
              <ul>
                ${formattedTransactions}
              </ul>
            </div>
            
          </body>
        </html>
      `;

      res.send(formattedOutput); 
    });
  });

// Route to get Bitcoin wallet transactions
app.post('/get-bitcoin-transactions', (req, res) => {
  exec(`${config.bitcoin_path}bitcoin-cli listtransactions "*" 100`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing bitcoin-cli: ${error.message}`);
      return res.status(500).send('Error getting Bitcoin wallet transactions');
    }
    if (stderr) {
      console.error(`Error executing bitcoin-cli: ${stderr}`);
      return res.status(500).send('Error getting Bitcoin wallet transactions');
    }

    try {
      const transactions = JSON.parse(stdout);
      const formattedTransactions = transactions.map(transaction => `
        <li>
          Transaction ID: ${transaction.txid}<br>
          Address: ${transaction.address}<br>
          Amount: ${transaction.amount}<br>
          Confirmations: ${transaction.confirmations}
        </li>
        <p>
      `).join('');

      const formattedOutput = `
        <html>
        <head>
          <title>Wallet Transactions</title>
          <link rel="stylesheet" type="text/css" href="/styles.css">    
          <script src="/ordminlib.js"></script>        
        </head>
          <body>
            <div class="transactions-container">
              <h2>Bitcoin Wallet Transactions</h2>
              <ul>
                ${formattedTransactions}
              </ul>
            </div>
          </body>
        </html>
      `;

      res.send(formattedOutput);
    } catch (parseError) {
      console.error(`Error parsing JSON: ${parseError}`);
      res.status(500).send('Error getting Bitcoin wallet transactions');
    }
  });
});

// Route to get Bitcoin wallet transactions with category "send"
app.all('/get-send-bitcoin-transactions', (req, res) => {
  if (req.method === 'GET' || req.method === 'POST') {
    exec(`${config.bitcoin_path}bitcoin-cli listtransactions "*" 100`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing bitcoin-cli: ${error.message}`);
        return res.status(500).send('Error getting Bitcoin wallet transactions');
      }
      if (stderr) {
        console.error(`Error executing bitcoin-cli: ${stderr}`);
        return res.status(500).send('Error getting Bitcoin wallet transactions');
      }

      try {
        const transactions = JSON.parse(stdout);
        const sentTransactions = transactions.filter(transaction => transaction.category === 'send');
        const formattedTransactions = sentTransactions.map(transaction => `
          <li>
            Label: ${transaction.label}<br>
            Address: ${transaction.address}<br>
            Amount: ${transaction.amount}<br>
            Fee: ${transaction.fee}<br>
            Transaction ID: ${transaction.txid}
          </li>
          <p>
        `).join('');

        const formattedOutput = `
          <html>
            <head>
              <title>Bitcoin Wallet Sent Transactions</title>
              <link rel="stylesheet" type="text/css" href="/styles.css">    
              <script src="/ordminlib.js"></script>        
            </head>
            <body>
              <div class="transactions-container">
                <h2>Bitcoin Wallet Sent Transactions</h2>
                <ul>
                  ${formattedTransactions}
                </ul>
              </div>
            </body>
          </html>
        `;

        res.send(formattedOutput);
      } catch (parseError) {
        console.error(`Error parsing JSON: ${parseError}`);
        res.status(500).send('Error getting Bitcoin wallet transactions');
      }
    });
  } else {
    res.status(405).send('Method Not Allowed');
  }
});


// GET route to home
app.get('/', (req, res) => {
  res.send(`
          <html>
            <head>
                <title>0rdmin</title>
                <link rel="stylesheet" type="text/css" href="/styles.css">
                <script src="/ordminlib.js"></script>
            </head>
            <body>
                <script> document.body.innerHTML += mainMenu();  </script>
                  <div class="menu-content">
                    <h1>0rdmin</h1>
                    <hr> 
                    <div class="intro-container">
                    <div class="intro-text">
                      <h2>Welcome to 0rdmin</h2>
                      <p>The 0rdmin is a Node.js application that provides a web interface for managing and interacting with blockchain services such as Bitcoin and Ord. It allows users to start and stop services, check status, perform transactions, and mint digital assets.</p>
                      </div>
                    </div>
                    <hr> 
                  </div>  
                <script> document.body.innerHTML += createFooter();  </script>            
            </body>
          </html>
  `);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on the port ${PORT}`);
});