const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();


module.exports.handler = async (event) => {
    console.log(event.body)
    const requestBody = JSON.parse(event.body);
    
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
    try {
        await recordRide(requestBody.email, requestBody.name)
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `id: ${requestBody.email} successfully entered`
            }),
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        }
    } catch(err) {
        return {
            statusCode: 500,
            body: JSON.stringify({
              Error: err,
            }),
            headers: {
              'Access-Control-Allow-Origin': '*',
            },
        }
    }
};


function recordRide(_email, _name) {
    return ddb.put({
        TableName: process.env.EMPLOYEES_TABLE,
        Item: {
            email: _email,
            name: _name
        },
    }).promise();
}