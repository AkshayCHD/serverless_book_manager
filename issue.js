const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();


module.exports.handler = async (event) => {
    console.log(event.body)
    const requestBody = JSON.parse(event.body);
    console.log(requestBody)
    let validation = validationCheck(requestBody);
    if(validation.statusCode) {
        return validation;
    }
    console.log("validation done")
    try {
        const book_id = Number(requestBody.book_id)
        const bookData = await getBookData(book_id)
        console.log("Book Found")
        if(bookData.Item.issued) {
            throw "The book is already issued"
        }
        console.log("Book not issued")
        const employeeData = await getEmployeeData(requestBody.email);
        console.log("got employee data")
        await issueBook(bookData.Item, employeeData.Item);
        console.log("Book Issued")
        return positiveResponse({
            message: "successfully issued the book"
        })
    } catch(err) {
        return negativeResponse(err)
    }
};

function positiveResponse(data) {
    return {
        statusCode: 200,
        body: JSON.stringify(data),
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    }
}

function negativeResponse(err) {
    return {
        statusCode: 400,
        body: JSON.stringify({
          Error: err,
        }),
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
    }
}

const issueBook = (bookData, employeeData) => new Promise((resolve, reject) => {
    bookData.issued = true;
    bookData.issued_by = employeeData.email;
    if(employeeData.issued == undefined) 
        employeeData.issued = []
    employeeData.issued.push({
        book_id: bookData.book_id,
        name: bookData.name
    })
    console.log(bookData)
    console.log(employeeData)
    
    ddb.put({
        TableName: process.env.BOOKS_TABLE,
        Item: bookData,
    }).promise().then(() => {
        return ddb.put({
            TableName: process.env.EMPLOYEES_TABLE,
            Item: employeeData,
        }).promise()
    }).then(() => {
        resolve(true)
    }).catch((err) => {
        reject(err)
    })
})

const getBookData = (_book_id) => new Promise((resolve, reject) => {
    const params = {
        TableName: process.env.BOOKS_TABLE,
        Key: {
            "book_id": _book_id
        }
    };
    ddb.get(params, function (err, data) {
        if(data == null || data.Item === null) {
            reject('Book with given id not found');
        } else if(err) {
            reject(err);
        } else {
            resolve(data);
        }
    });
});

const getEmployeeData = (_email) => new Promise((resolve, reject) => {
    const params = {
        TableName: process.env.EMPLOYEES_TABLE,
        Key: {
            "email": _email
        }
    };
    ddb.get(params, function (err, data) {
        if(data == null || data.Item === null) {
            reject('Employee with given email not found');
        } else if(err) {
            reject(err);
        } else {
            resolve(data);
        }
    });
});

function validationCheck(requestBody) {
    return true;
    if(!requestBody.email || !requestBody.name) {
        return {
            statusCode: 500,
            body: JSON.stringify({
              error: 'Sent parameters not sufficient',
            }),
            headers: {
              'Access-Control-Allow-Origin': '*',
            },
        }
    }
    return true;
}
