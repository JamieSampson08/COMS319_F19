const request = require('supertest');
const app = require('../app');
const mockAxios = require("axios");

describe('get from giphy endpoint', () => {
    it('should return one giph', async () => {
        const res = await request(app)
            .get('/giphy')
        expect(res.statusCode).toEqual(200);
        expect(res.body.id).not.toBeNull();
        expect(res.body.title).not.toBeNull();
        expect(res.body.url).not.toBeNull();
    })
});