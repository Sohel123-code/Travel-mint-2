const https = require('https');
const fs = require('fs');

const url = "https://serpapi.com/search.json?engine=google_hotels&q=Mumbai&check_in_date=2024-12-01&check_out_date=2024-12-05&adults=2&currency=INR&api_key=4502676baa36f1e031841369688cdd99532b6c2d0245cbee25f32452be456a9a";

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        fs.writeFileSync('test_response.json', data);
        console.log("Wrote test_response.json!");
    });
}).on('error', err => {
    console.error("Error: " + err.message);
});
