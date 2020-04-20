const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();


module.exports.handler = async (event) => {
    try {
        const bookData = await getAllBooksData()
        return positiveResponse(bookData)
    } catch(err) {
        console.log(err)
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


const getAllBooksData = () => new Promise((resolve, reject) => {
    const params = {
        TableName:  process.env.BOOKS_TABLE
    };
    ddb.scan(params, function (err, data) {
        if(data == null || data.Item === null) {
            reject('Book with given id not found');
        } else if(err) {
            reject(err);
        } else {
            resolve(data);
        }
    });
});
