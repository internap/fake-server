'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const argv = require('minimist')(process.argv.slice(2));

const app = express();
const port = argv.port || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/setup', (req, res) => {
    const endpoint = req.body['endpoint'];
    const method = req.body['method'];
    const statusCode = req.body['status_code'];
    const data = req.body['data'];
    const setupMethod = req.method;

    if (isValidSetupCall(endpoint, method, statusCode, data, setupMethod)) {
        app[method.toLowerCase()](endpoint, (endpointReq, endpointRes) => {
            endpointRes.status(statusCode);
            endpointRes.json(data);
        });

        res.status(200);
        res.json({path: endpoint});
    } else {
        res.status(400);
        res.json({
            message: "Invalid setup call: Please POST correct values for each item",
            items: {
                endpoint: "The new endpoint this server will provide",
                method: "Which HTTP method the endpoint will be accessible for",
                status_code: "The status code to be returned when calling the endpoint",
                data: "The data to be returned when calling the endpoint"
            }
        })
    }

});

app.listen(port, function () {
    console.log(`fake-server listening on port ${port}!`);
    if (process.send) {
        process.send('ready');
    }
});

function isValidSetupCall(endpoint, method, statusCode, data, setupMethod) {
    return endpoint &&
        typeof method === 'string' &&
        ['get', 'post', 'put', 'delete', 'options'].includes(method.toLowerCase()) &&
        Number.isInteger(statusCode) && statusCode >= 100 && statusCode < 600 &&
        data &&
        setupMethod === 'POST'
}

module.exports = app;