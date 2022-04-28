// create a variable to hodl the DB connection
let db;

// establish a connection to IndexedDB database
const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function(event) {
    // save a reference to the database
    const db = event.target.result;
    // create an object store
    db.createObjectStore('budget_tracker', { autoIncrement: true })
};

request.onsuccess = function(event) {
    // when db is successfully created with its object store
    db = event.target.result;
    // Check if app is online, if yes reun upload
    if (navigator.onLine) {
        // function to run if it is online
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

// this function will be executed if we attempt to submit with no wifi. This will only run if the catch method is executed
function saveRecord(record) {
    // open a new tranaction with the database with read and write permissions
    const transaction = db.transaction(['budget_tracker'], 'readwrite');

    // access the object store for 'budget_tracker'
    const budgetObjectStore = transaction.objectStore('budget_tracker');

    // add record to yoru store with add method
    budgetObjectStore.add(record);
}

function uploadBudget() {
    console.log('in the budget upload')
    // open a transaction on your db
    const transaction = db.transaction(['budget_tracker'], 'readwrite');
    // access your object store
    const budgetObjectStore = transaction.objectStore('budget_tracker');
    // get all records from store and set to a variable
    const getAll = budgetObjectStore.getAll();

    // run this if getAll is successfull
    getAll.onsuccess = function() {
        // if there was data in indexedDb's store, send it to the api server
        if(getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST', 
                // get all the pizzas stored in the indexedDB and make a fetch POST to the actual server
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if(serverResponse.message) {
                    throw new Error(serverResponse);
                }
                // open on more transaction
                const transaction = db.transaction(['budget_tracker'], 'readwrite');
                // access budget_tracker object store
                const budgetObjectStore = transaction.objectStore('budget_tracker');
                // clear all items in your store since they are now in the database
                budgetObjectStore.clear();
                alert('All transactions have been submitted');
            })
            .catch(err => {
                console.log(err);
            })
        }
    }
}

// listen for the app coming back online
window.addEventListener('online', uploadBudget);
