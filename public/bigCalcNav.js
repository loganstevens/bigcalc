document.addEventListener('keydown', function(event) {
    switch(event.key) {
        case '0': document.getElementById('button0').click(); break;
        case '1': document.getElementById('button1').click(); break;
        case '2': document.getElementById('button2').click(); break;
        case '3': document.getElementById('button3').click(); break;
        case '4': document.getElementById('button4').click(); break;
        case '5': document.getElementById('button5').click(); break;
        case '6': document.getElementById('button6').click(); break;
        case '7': document.getElementById('button7').click(); break;
        case '8': document.getElementById('button8').click(); break;
        case '9': document.getElementById('button9').click(); break;
        case '+': document.getElementById('buttonPlus').click(); break;
        case '-': document.getElementById('buttonMinus').click(); break;
        case '*': document.getElementById('buttonMultiply').click(); break;
        case '/': document.getElementById('buttonDivide').click(); break;
        case '=': case 'Enter': document.getElementById('buttonEquals').click(); break;
        case 'Escape': document.getElementById('buttonClear').click(); break;
        case '.': document.getElementById('buttonDecimal').click(); break;
        case '(': document.getElementById('leftParen').click(); break;
        case ')': document.getElementById('rightParen').click(); break;
    }
    if (event.key === 'Backspace') {
        var display = document.getElementById('display');
        if (display.value.length > 1) {
            display.value = display.value.slice(0, -1); // Remove last character
        } else {
            display.value = '0'; // Set to 0 if only one character left
        }
        event.preventDefault(); // Prevent the default backspace action
    }
});

function addToDisplay(value) {
    let display = document.getElementById('display');

    if (display.value === '0') {
        display.value = value;
    } else {
        display.value += value;
    }
}

function clearDisplay() {
    /* document.getElementById('display').value = ''; */
    document.getElementById('display').value = '0';
    document.getElementById('toCurrency').value = '';
    document.getElementById('fromCurrency').value = '';
    document.getElementById('errorMessage').style.visibility = 'hidden';
    document.getElementById('errorMessage').style.opacity = '0';
}

async function calculate() {
    let expression = document.getElementById('display').value;
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;

    expression = expression.replace(/√\(/g, 'Math.sqrt(');
    expression = expression.replace(/\^/g, '**');
    expression = expression.replace(/sin\(/g, 'Math.sin(');
    expression = expression.replace(/cos\(/g, 'Math.cos(');
    expression = expression.replace(/tan\(/g, 'Math.tan(');
    expression = expression.replace(/%/g, '/100');
    expression = expression.replace(/log\(/g, 'Math.log10(');
    expression = expression.replace(/ln\(/g, 'Math.log(');
    expression = expression.replace(/π/g, 'Math.PI');
    expression = expression.replace(/e/g, 'Math.E');

    if (expression && fromCurrency && toCurrency) {
        convertCurrency();
    }
    else {
        try {
            let response = await fetch('/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ expression })
            });
            let result = await response.json();
            console.log(response);    
            document.getElementById('display').value = result.result;
            document.getElementById('errorMessage').style.visibility = 'hidden';
            document.getElementById('errorMessage').style.opacity = '0';
        } catch(e) {
            console.error(e);
            document.getElementById('errorMessage').innerText = 'ERROR: Invalid Expression';
            document.getElementById('errorMessage').style.display = 'block';
            document.getElementById('errorMessage').style.visibility = 'visible';
            document.getElementById('errorMessage').style.opacity = '1';
        }
    }
}

function calculateFactorial() {
    let expression = document.getElementById('display').value;
    document.getElementById('display').value = factorial(expression);
}

function factorial(n) {
    return n ? n * factorial(n - 1) : 1;
}

function togglePlusMinus() {
    let currentValue = document.getElementById('display').value;
    if (currentValue.startsWith('-')) {
        document.getElementById('display').value = currentValue.slice(1);
    } else {
        document.getElementById('display').value = '-' + currentValue;
    }
}

async function squareRoot() {
    let value = document.getElementById('display').value;
    clearDisplay();
    document.getElementById('display').value = Math.sqrt(value);
}

// Memory Store
async function memoryStore(op) {
    /* let value = document.getElementById('display').value; */
    let value;
    switch (op) {
        case 1:
            value = `+(${document.getElementById('display').value})`;
            break;
        case 2:
            value = `-(${document.getElementById('display').value})`;
            break;
        default:
            value = document.getElementById('display').value;
    }
    await fetch('/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value })
    });
}

// Memory Recall
async function memoryRecall(op) {// 0: default, 1: plus, 2: minus
    let response = await fetch('/memory', {method: 'GET'});
    try {
        if (response.ok) {
            let memory = await response.json();
            switch (op) {
                case 1:
                    document.getElementById('display').value += `+(${memory.value})`;
                    break;
                case 2:
                    document.getElementById('display').value += `-(${memory.value})`;
                    break;
                default:
                    document.getElementById('display').value += memory.value;
            }
        }
    } catch (e) {
        console.error(e);
        document.getElementById('display').value = 0;
    }
}

async function convertCurrency() {
    const amount = document.getElementById('display').value
    const fromCurrency = document.getElementById('fromCurrency').value.toUpperCase();
    const toCurrency = document.getElementById('toCurrency').value.toUpperCase();

    try {
        let response = await fetch('/convertCurrency', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fromCurrency, toCurrency, amount })
        });

        let result = await response.json();
        /* document.getElementById('conversionResult').innerText = `Converted Amount: ${result.convertedAmount}`; */
        document.getElementById('display').value = result.convertedAmount;
        document.getElementById('errorMessage').style.visibility = 'hidden';
        document.getElementById('errorMessage').style.opacity = '0';
    } catch (error) {
        console.error('Error: ', error);
        document.getElementById('errorMessage').innerText = 'ERROR: Conversion Error';
        document.getElementById('errorMessage').style.display = 'block';
        document.getElementById('errorMessage').style.visibility = 'visible';
        document.getElementById('errorMessage').style.opacity = '1';
    }
}

// Memory Clear
async function memoryClear() {
    await fetch('/memory', {
        method: 'DELETE'
    });
}