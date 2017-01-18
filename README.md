# fake-server

## Usage

```bash
$ npm install internap-fake-server
```

```javascript
const request = require('request');
const fakeServer = require('internap-fake-server');

fakeServer.listen(3000, () => {
    request.post({
        headers: {'Content-Type' : 'application/json'},
        uri: 'http://127.0.0.1:3000/setup',
        body: {
            endpoint: '/fruits',
            method: 'GET',
            status_code: 200,
            data: [
                'apple',
                'orange',
                'banana'
            ],
            queries: { // optional
                foo: 'bar'
            }
        },
        json: true
    }, () => {
        request.get('http://127.0.0.1:3000/fruits', (err, res, body) => {
            console.log(res.statusCode);  // prints 404
        });
        request.get('http://127.0.0.1:3000/fruits?foo=bar', (err, res, body) => {
            console.log(body);  // prints ['apple', 'orange', 'banana']
        });
    });
});
```