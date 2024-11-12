// test/test.js
const axios = require('axios');
const chai = require('chai');
const expect = chai.expect;
const mongoose = require('mongoose');
const app = require('../app');

const server = app.listen(3000, () => {
    console.log('Test server running on port 3000');
});

describe('API Tests', () => {
    before(async () => {
        await mongoose.connect('mongodb://localhost:27017/testdb', { useNewUrlParser: true, useUnifiedTopology: true });
        await mongoose.connection.db.dropDatabase();
    });

    after(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.disconnect();
        server.close();
    });

    it('should create a new item', async () => {
        const response = await axios.post('http://localhost:3000/items', {
            name: 'Test Item',
            quantity: 10
        });
        expect(response.status).to.equal(201);
        expect(response.data).to.have.property('_id');
        expect(response.data.name).to.equal('Test Item');
        expect(response.data.quantity).to.equal(10);
    });

    it('should get all items', async () => {
        const response = await axios.get('http://localhost:3000/items');
        expect(response.status).to.equal(200);
        expect(response.data).to.be.an('array');
        expect(response.data.length).to.be.above(0);
    });
});
