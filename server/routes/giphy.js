const express = require('express');
const axios = require('axios');
const router = express.Router();

const GIPHY_API_KEy = "njfwquOIVgH2Eh6HhroP0GZlCaKQ1i9r";
const random_api = "https://api.giphy.com/v1/gifs/random?api_key=" + GIPHY_API_KEy;

router.get('/', function(req, res, next) {
    axios({
        method: 'get',
        url: random_api,
    })
    .then(response =>{
        const giphData = response.data.data;
        var giphs = {
            "title": giphData.title,
            "id": giphData.id,
            "url": giphData.image_original_url,
        };
        res.send(giphs);
    })
    .catch(error =>{
        console.log("Error fetching and parsing data", error);
    });
});

module.exports = router;
