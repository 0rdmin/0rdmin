### 0rdmin

![screen-2024-04-24-03-34-06](https://github.com/0rdmin/0rdmin/assets/167829833/47c19c3f-5a8b-4275-92a6-d7e38c30fef0)

### Introduction
0rdmin is a project designed to facilitate interaction with a blockchain network, providing functionalities such as starting and stopping services, checking status, performing transactions, and minting digital assets. This README serves as a guide to understand the structure and usage of the 0rdmin project.

### Disclaimer
0rdmin is an Open Source continuous development initiative, subject to regular updates and enhancements. While rigorous testing is conducted, users should be mindful that errors can still occur. By opting to utilize 0rdmin, users acknowledge and fully accept that they do so entirely at their own risk. The developers behind 0rdmin bear no responsibility for any issues or consequences stemming from its usage. It is strongly advised to exercise caution and conduct thorough testing in your environments.


### Technologies Used
- Node.js
- Express.js
- Axios
- SQLite
- Bcrypt


### Installation

1. Download/Clone the repository: 


2. Unzip the file:
`tar zxvf 0rdmin-0.3.0.tar.gz`


3. Install Node.js
```
sudo apt update
sudo apt install nodejs
node -v
```

4. Instale o npm (gerenciador de pacotes do Node.js)
```
sudo apt install npm
npm -v
```

5. Install Packs
npm install sqlite3
npm install bcrypt
npm install express
npm install axios
npm install express-session


### Configuration
Before running the project, make sure to configure the following settings in the config.js file:

- bitcoin_path: Path to the Bitcoin executable.
- ord_path: Path to the Ord executable.
- cookie_file: Path to the cookie file.


### Usage

1. Create User:
Create a username and password to access your 0rdmin Server.
`node createUser.js`

3. Start the server:
`node server.js`

4. Access the application through a web browser at http://localhost:3000.

### Video Demo
https://github.com/0rdmin/0rdmin/assets/167829833/df04096f-d698-4e2e-9137-a729b4d8e2d5

### Endpoints

- POST /login: Handles user login with username and password.
- POST /start-bitcoind: Starts the bitcoind service.
- POST /stop-bitcoind: Stops the bitcoind service.
- GET /bitcoind-status: Retrieves the status of the bitcoind service.
- POST /start-ord: Starts the Ord server.
- POST /stop-ord: Stops the Ord server.
- GET /ord-status: Retrieves the status of the Ord server.
- POST /mint-rune: Performs minting of a digital asset (RUNE).
- POST /get-balance: Retrieves the wallet balance.
- POST /get-transactions: Retrieves wallet transactions.


### Error Handling
Internal server errors are logged and an appropriate error message is sent to the client.


### Other User
If you are running with another user other than root.
If you are trying to start ord and it asks for a sudo password. Take these steps to resolve it.

1. Open visudo
`sudo visudo`

3. Add permission for your user
```
user  ALL=(ALL) ALL
user ALL=(ALL) NOPASSWD: /home/user/ord-0.18.2/ord
user ALL=(ALL) NOPASSWD: /usr/bin/killall ord
```


### Dependencies
Express.js: Web framework for Node.js.
Axios: Promise-based HTTP client for the browser and Node.js.
SQLite: Serverless SQL database engine.
Bcrypt: Password hashing library.


### Contributors
Alpha Zero Community


### License
This project is licensed under the MIT License.
