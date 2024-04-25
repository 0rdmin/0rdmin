// version
const ordmin_version = '0.3.1';

// Function to get the current Bitcoin price in dollars
async function getCurrentBitcoinPrice() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
        const data = await response.json();
        return data.bitcoin.usd;
    } catch (error) {
        console.error('An error occurred while getting the Bitcoin price:', error);
        return null;
    }
}

// Function to get the current fee rate
async function getCurrentFeeRate() {
    try {
        const bitcoinPriceUSD = await getCurrentBitcoinPrice();

        const response = await fetch('https://mempool.space/api/v1/fees/recommended');
        const feeRates = await response.json();
        
        console.log('TRANSACTION FEE');
        console.log('  - Fastest Fee:', feeRates.fastestFee, 'sat/vB');
        console.log('  - Half Hour Fee:', feeRates.halfHourFee, 'sat/vB');
        console.log('  - Hour Fee:', feeRates.hourFee, 'sat/vB');
        console.log('  - Economy Fee:', feeRates.economyFee, 'sat/vB');
        console.log('  - Minimum Fee:', feeRates.minimumFee, 'sat/vB');

        // Display fees on the page
        const feeRatesList = document.getElementById('feeRatesList');
        feeRatesList.innerHTML = `
            <p><h1>Bitcoin: ${bitcoinPriceUSD}</h1></p>
            <h2>TRANSACTION FEE</h2>            
            <div id="feeRatesList">
                <p>Fastest Fee: ${feeRates.fastestFee} sat/vB</p>
                <p>Half Hour Fee: ${feeRates.halfHourFee} sat/vB</p>
                <p>Hour Fee: ${feeRates.hourFee} sat/vB</p>
                <p>Economy Fee: ${feeRates.economyFee} sat/vB</p>
                <p>Minimum Fee: ${feeRates.minimumFee} sat/vB</p>
            </div>
        `;
    } catch (error) {
        console.error('An error occurred while getting the fee rates:', error);
    }
}

// Function to fetch and display the current Bitcoin price
async function fetchBitcoinPrice() {
    const bitcoinPriceUSD = await getCurrentBitcoinPrice();
    console.log('Bitcoin: $', bitcoinPriceUSD);
}

// Using the functions
async function main() {    
    await fetchBitcoinPrice();
    await getCurrentFeeRate();
}

// Footer
function createFooter() {   
    
    console.log(`Version 0rdmin: v${ordmin_version}`);

    return `
      <footer>
        <div class="menu-content">    
          <p> Donate: </p> 
          <div class="donate-wallet">
          Bitcoin: 3NLRpdJbN44YATETpyWShG6pFnXS3L3y9c <p>
          Ordinals & Runes: bc1p3303nx5xk427y9mqsaat0dl7lmv66pxckngu54mpuqmlftljnnas70tq0q
          </div>
          <hr>        
          <p>0rdmin v${ordmin_version}</p>       
        </div>
      </footer>
    `;
}

// Main Menu
function mainMenu() {
    return `
    <img id="logo-small" src="/logo.png" alt="logo-small">
        <div class="main-menu">
            <a href="/server">Server</a>
            <a href="/mint">Mint</a>
            <a href="/infos">Infos</a>
            <a href="/logout">Logout</a>
        </div><div class="menu-content"> <hr></div>
    `;
}


