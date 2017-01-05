'use strict';

const server = require('../index');

const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const qs = require('querystring');

chai.use(chaiHttp);


describe('Test fake-server', () => {

    const validPayload = {
        endpoint: "/get_fruits",
        method: "GET",
        status_code: 200,
        data: [
            "apple",
            "orange",
            "banana"
        ],
        queries: {}
    };

    describe('Test /setup', () => {
        it('Should allow a POST with the correct payload', done => {
            chai.request(server)
                .post('/setup')
                .send(validPayload)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.a('object');
                    expect(res.body.path).to.equal('/get_fruits');
                    done();
                });
        });

        it('Should not allow a GET call to /setup', done => {
            chai.request(server)
                .get('/setup')
                .send(validPayload)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.be.a('object');
                    expect(res.body.message).to.equal("Invalid setup call: Please POST correct values for each item");
                    done();
                });
        });

        it('Should not allow a PUT call to /setup', done => {
            chai.request(server)
                .put('/setup')
                .send(validPayload)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.be.a('object');
                    expect(res.body.message).to.equal("Invalid setup call: Please POST correct values for each item");
                    done();
                });
        });

        it('Should not allow an invalid method in the payload', done => {
            const invalidPayload = Object.assign(JSON.parse(JSON.stringify(validPayload)), {method: "WAT?"});

            chai.request(server)
                .post('/setup')
                .send(invalidPayload)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.be.a('object');
                    expect(res.body.message).to.equal("Invalid setup call: Please POST correct values for each item");
                    done();
                });
        });

        it('Should not allow an invalid status code in the payload', done => {
            const invalidPayload = Object.assign(JSON.parse(JSON.stringify(validPayload)), {status_code: 17});

            chai.request(server)
                .post('/setup')
                .send(invalidPayload)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.be.a('object');
                    expect(res.body.message).to.equal("Invalid setup call: Please POST correct values for each item");
                    done();
                });
        });

        it('Requires the "data" field in the payload', done => {
            const invalidPayload = JSON.parse(JSON.stringify(validPayload));
            delete invalidPayload.data;

            chai.request(server)
                .post('/setup')
                .send(invalidPayload)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.be.a('object');
                    expect(res.body.message).to.equal("Invalid setup call: Please POST correct values for each item");
                    done();
                });
        });

    });

    describe('Test dynamic API', () => {
        it('Should create a new endpoint and return the right data when accessed by the correct method', done => {
            chai.request(server)
                .post('/setup')
                .send(validPayload)
                .end(() => {
                    chai.request(server)
                        .get('/get_fruits')
                        .end((err, res) => {
                            expect(res).to.have.status(200);
                            expect(res.body).to.be.a('array');
                            expect(res.body.length).to.equal(3);
                            expect(res.body).to.deep.equal(validPayload.data);
                            done();
                        });
                });
        });

        it('Should not allow the endpoint to be accessed by the wrong method', done => {
            chai.request(server)
                .post('/setup')
                .send(validPayload)
                .end(() => {
                    chai.request(server)
                        .post('/get_fruits')
                        .end((err, res) => {
                            expect(res).to.have.status(404);
                            expect(res.body).to.deep.equal({});
                            done();
                        });
                });
        });

        it('Should not fail when the URL contains a querystring', done => {
            const payload = Object.assign(JSON.parse(JSON.stringify(validPayload)),
                {
                    endpoint: '/vegetables',
                    queries: {
                        foo: 'bar'
                    }
                });
            const endpointWithQueries = `${payload.endpoint}?${qs.stringify(payload.queries)}`;
            chai.request(server)
                .post('/setup')
                .send(payload)
                .end(() => {
                    chai.request(server)
                        .get(endpointWithQueries)
                        .end((err, res) => {
                            expect(res).to.have.status(200);
                            expect(res.body).to.be.a('array');
                            expect(res.body.length).to.equal(3);
                            expect(res.body).to.deep.equal(validPayload.data);
                            done();
                        });
                });
        });

        it('Should fail when the querystrings don\'t match', done => {
            const payload = Object.assign(JSON.parse(JSON.stringify(validPayload)),
                {
                    queries: {
                        foo: 'bar'
                    }
                });
            chai.request(server)
                .post('/setup')
                .send(payload)
                .end(() => {
                    chai.request(server)
                        .get(`${payload.endpoint}?notFoo=notBar`)
                        .end((err, res) => {
                            expect(res).to.have.status(404);
                            expect(res.body).to.deep.equal({});
                            done();
                        });
                });
        });
    });

});
