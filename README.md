# fake-server

## Usage

```javascript
fakeServer = require('fake-server');
server = fork(fakeServer, ['--port', 3000], {
            stdio: 'pipe',
            execArgv: []
         });
server.on('message', (message) => {
    if (message === 'ready') {
        // make requests
    }
});
```