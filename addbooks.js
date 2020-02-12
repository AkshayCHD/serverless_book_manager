
const randomBytes = require('crypto').randomBytes;

const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();


module.exports.func = (event, context, callback) => {
  
    console.log(event.body)
    const requestBody = JSON.parse(event.body);
    

    console.log(requestBody.book_id);
    if(!requestBody.book_id || !requestBody.book_name || !requestBody.book_author) {
        callback(null,  {
            statusCode: 500,
            body: JSON.stringify({
              error: 'Sent parameters not sufficient',
            }),
            headers: {
              'Access-Control-Allow-Origin': '*',
            },
        })
    }
    recordRide(parseInt(requestBody.book_id), requestBody.book_name, requestBody.book_author).then(() => {

        callback(null, {
            statusCode: 201,
            body: `id: ${requestBody.book_id} successfully entered`,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        });
    }).catch((err) => {
        console.error(err);
        errorResponse(err.message, context.awsRequestId, callback)
    });
};


function recordRide(_id, _name, _author) {
    return ddb.put({
        TableName: process.env.BOOKS_TABLE,
        Item: {
            book_id: _id,
            name: _name,
            author: _author
        },
    }).promise();
}


function errorResponse(errorMessage, awsRequestId, callback) {
  callback(null, {
    statusCode: 500,
    body: JSON.stringify({
      Error: errorMessage,
      message: errorMessage,
      Reference: awsRequestId,
    }),
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });
}