// bigCalcServer.js \ server

//API Key: cfd538ce112f0ca5414253a9
//Example Request: https://v6.exchangerate-api.com/v6/cfd538ce112f0ca5414253a9/latest/USD
const express = require('express');
const path = require('path');

const app = express();
const port = process.argv[2] || 3000; // Use the provided port or default to 3000

if (process.argv.length != 3) {
    console.log("Usage bigCalc.js portNumber");
}

const API_KEY = 'cfd538ce112f0ca5414253a9';

class calcSupport {
    static #order;
    #delta
    constructor(start) {
        this.#delta = start;
        calcSupport.#order = 0;
    }

    set order(newOrder) {
        calcSupport.#order = newOrder;
    }
    
    get order() {
        return calcSupport.#order;
    }

    static update(pushPop) {
        calcSupport.order = (pushPop) ? (calcSupport.order + 1) : (calcSupport.order - 1);
    }

    static printJSON() {
        const jsonFilePath = path.join(__dirname, extJSON);
        // Read the JSON file synchronously
        const jsonData = fs.readFileSync(jsonFilePath, 'utf-8');
        // Parse the JSON data
        const json = JSON.parse(jsonData);
        console.log(json["itemsList"]);
        console.log("Type itemsList or stop to shutdown the server: ");
    }
} //End ES6 Class

require("dotenv").config({ path: path.resolve(__dirname, '.env') });  
const uri = process.env.MONGO_CONNECTION_STRING;

MONGO_DB_NAME = "CMSC335_DB"
MONGO_COLLECTION = "bigCalc"
const databaseAndCollection = {db: MONGO_DB_NAME, collection: MONGO_COLLECTION};
const { MongoClient, ServerApiVersion } = require('mongodb');

calcSupport.order = 0;

const bodyParser = require('body-parser'); /* To handle post parameters */
app.use(bodyParser.urlencoded({extended:false}));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// retrieve last output
app.get('/memory', async (req, res) => { // app.post or app.get ??

    let dynamicContent;

    console.log("Values in Local Memory: " + calcSupport.order);
  
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    try {
        await client.connect();
        
        calcSupport.order = await client.db(databaseAndCollection.db)
        .collection(databaseAndCollection.collection)
        .countDocuments();
        console.log(`Server Order Memory: ${calcSupport.order}`);

        if (calcSupport.order > 0) {
            console.log(`***** Looking up one value w/ order: ${calcSupport.order - 1} *****`);
            result = await lookUpOneEntry(client, databaseAndCollection, (calcSupport.order - 1));

            if (result) {
                dynamicContent = result;
                const resultTwo = await client.db(databaseAndCollection.db)
                .collection(databaseAndCollection.collection)
                .deleteOne({ order: calcSupport.order - 1});
                calcSupport.update(false);
                console.log("update false: " + calcSupport.order);
            }
            else {
                dynamicContent = `ERR`;
            }
        }
        else { // No values in DB
            dynamicContent = { value: '' };
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    res.send(dynamicContent);
});

// Handle all routes by sending the main HTML file
app.get('*', (req, res) => {
    // Extract the requested path from the URL
    const requestedPath = req.path;

    // Construct the file path based on the requested path
    const filePath = path.join(__dirname, 'public', requestedPath + '.html');

    // Send the file as the HTTP response
    res.sendFile(filePath, (err) => {
        // Handle errors, e.g., file not found
        if (err) {
            res.status(404).send('File not found');
        }
    });
});

// Handle Calculations
app.post('/calculate', async (req, res) => {
    const { expression } = req.body;

    if (!expression) {
        return res.status(400).send('No expression provided');
    }

    else {
        try {
        const result = eval(expression);
        res.send({ expression, result }); // Just result?
        } catch (error) {
            res.status(400).send('Invalid mathematical expression');
        }
    }
});

// Convert Currency
app.post('/convertCurrency', async (req, res) => {
    const { fromCurrency, toCurrency, amount } = req.body;

    try {
        const response = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/pair/${fromCurrency}/${toCurrency}/${amount}`);
        const data = await response.json();

        if(data.result === 'success') {
            res.json({ convertedAmount: data.conversion_result });
        } else {
            res.status(500).json({ error: 'Error fetching currency conversion data' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// retain last output
app.post('/memory', async (req, res) => {
    const { value } = req.body;
    
    if (value) {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
        try {
            await client.connect();

            calcSupport.order = await client.db(databaseAndCollection.db)
            .collection(databaseAndCollection.collection)
            .countDocuments();
            console.log(`Server Order Memory: ${calcSupport.order}`);

            console.log(`***** Inserting one value ${value} at order ${calcSupport.order} *****`);
            
            let serverValue = {order: calcSupport.order, value: value};
            calcSupport.update(true);
            console.log("update true: " + calcSupport.order);
            await insertOutput(client, databaseAndCollection, serverValue);
        } catch(e) {
            console.error(e);
        } finally {
            await client.close();
        }
    }
});

// Clear Memory
app.delete('/memory', async (req, res) => {
    clearMem();
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log("Type stop to shutdown the server: ");
});

process.stdin.setEncoding("utf8"); /* encoding */
process.stdin.on('readable', () => {  /* on equivalent to addEventListener */
let dataInput = process.stdin.read();
    if (dataInput !== null) {
        let command = dataInput.trim();
        if (command === "stop") {
            console.log("Shutting down the server");
            process.exit(0);  /* exiting */
        } else {
            /* After invalid command, we cannot type anything else */
            console.log(`Invalid command: ${command}`);
            console.log("Type stop to shutdown the server: ");
        }
    }
});

async function initialize() {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    let result;
    try{
        result = await client.db(databaseAndCollection.db)
        .collection(databaseAndCollection.collection)
        .countDocuments();
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    return result;
}

async function clearMem() {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    /* const memoryCollection = db.collection('memory'); */
    let result;
  
    try {
        await client.connect();
        console.log("***** Clearing Collection *****");
        /* await memoryCollection.deleteMany({}); */
        const result = await client.db(databaseAndCollection.db)
        .collection(databaseAndCollection.collection)
        .deleteMany({});
        console.log(`Deleted documents ${result.deletedCount}`);
        calcSupport.order = 0;
        result = true;
    } catch (error) {
        result = false;
    } finally {
        await client.close();
    }
    return result;
}

function performCalculation(operation, operands) {
    let result;
    switch (operation) {
        case 'add':
            result = operands.reduce((a, b) => a + b, 0);
            break;
        case 'subtract':
            result = operands.reduce((a, b) => a - b);
            break;
        case 'multiply':
            result = operands.reduce((a, b) => a * b);
            break;
        case 'divide':
            result = operands.reduce((a, b) => a / b);
            break;
    
      // ... other operations like multiply, divide, etc.
      default:
        result = 'Invalid operation';
    }
    return result;
  }

async function insertOutput(client, databaseAndCollection, newPerson) {
    const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(newPerson);

    console.log(`Output entry created with id ${result.insertedId}`);
}

async function lookUpOneEntry(client, databaseAndCollection, orderVal) {
    let filter = {order: orderVal};
    const result = await client.db(databaseAndCollection.db)
                        .collection(databaseAndCollection.collection)
                        .findOne(filter);

   if (result) {
       return (result);
   } else {
       return false;
   }
}

async function lookGPA(client, databaseAndCollection, gpa) {
    let filter = {gpa: { $gte: gpa}};
    const result = await client.db(databaseAndCollection.db)
                        .collection(databaseAndCollection.collection)
                        .find(filter).toArray();

    if (result) {
        return (result);
    } else {
        return false;
    }
}