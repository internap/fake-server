# fake-server

## Usage

```javascript
const request = require('request');
const fork = require('child_process').fork;

const fakeServer = require('fake-server');
const server = fork(fakeServer, ['--port', 3000], {
                   stdio: 'pipe',
                   execArgv: []
               });

server.on('message', (message) => {
    if (message === 'ready') {
        request.post({
            headers: {'Content-Type' : 'application/json'},
            uri: 'http://127.0.0.1:3000/setup',
            body:    {
                endpoint: '/get_fruits',
                method: 'GET',
                status_code: 200,
                data: [
                    'apple',
                    'orange',
                    'banana'
                ]
            },
            json: true
        }, (error, response, body) => {
            // make GET request to 127.0.0.1:3000/get_fruits
            // returns ['apple', 'orange', 'banana']
        });
    }
});
```