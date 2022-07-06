const axios = require('axios');
const keys = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos, a neque nisi reprehenderit corrupti eligendi quia suscipit, similique alias quaerat, dolorum commodi! Deleniti nesciunt assumenda doloremque veniam dolor illo libero inventore ab quam, corporis repudiandae unde eum. Voluptate, mollitia accusantium dignissimos atque cum fuga incidunt debitis ab. Sint, deserunt distinctio.".split(" ");
const testLoop = async() => {
    const start = new Date();

    for (let i = 0; i < 100000; i++) {
        const idx1 = Math.floor(Math.random() * keys.length);
        const idx2 = Math.floor(Math.random() * keys.length);
        const filter = keys.slice(Math.min(idx1, idx2), Math.max(idx1, idx2)).join(" ");
        if (i % 1000 == 0) {
            console.log(i)
        }
        var data = JSON.stringify({
            "filter": filter,
            "page": idx1 < idx2 ? 1 : 2,
            "type": "search"
        });
        var config = {
            method: 'post',
            url: 'http://127.0.0.1:3000/getPostPage',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        const res = await axios(config);
        // .then(function(response) {
        //     // console.log(JSON.stringify(response.data));
        // })
        // // .catch(function(error) {
        // //     break;
        // // });
    }
    const end = new Date();
    console.log(`Time elapsed: ${(end - start)/1000} s`);
}

testLoop();