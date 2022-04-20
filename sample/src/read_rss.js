const request = require('request');

var URL = 'http://localhost:1212/soleil_api/run_function'; // 自分の使っているポートを指定

request.post({
    uri: URL,
    headers: { "Content-type": "application/json" },
    json: {
        function: 'read_rss'
    }
}, (err, res, data) => {
    console.log(data);
});