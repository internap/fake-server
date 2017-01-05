'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const _ = require('lodash');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/setup', (req, res) => {
    const endpoint = req.body['endpoint'];
    const queries = req.body['queries'];
    const method = req.body['method'];
    const statusCode = req.body['status_code'];
    const data = req.body['data'];
    const setupMethod = req.method;

    if (isValidSetupCall(endpoint, method, statusCode, data, setupMethod)) {
        app[method.toLowerCase()](endpoint, (endpointReq, endpointRes) => {
            if (!_.isEqual(endpointReq.query, queries)) {
                endpointRes.status(404);
                endpointRes.json({});
            } else {
                endpointRes.status(statusCode);
                endpointRes.json(data);
            }
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

function isValidSetupCall(endpoint, method, statusCode, data, setupMethod) {
    return endpoint &&
        typeof method === 'string' &&
        ['get', 'post', 'put', 'delete', 'options'].includes(method.toLowerCase()) &&
        Number.isInteger(statusCode) && statusCode >= 100 && statusCode < 600 &&
        data &&
        setupMethod === 'POST'
}

module.exports = app;