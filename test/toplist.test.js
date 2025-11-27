const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app'); 

const { expect } = chai;
chai.use(chaiHttp);

describe('Toplist sine endpoints', () => {

    it('GET, skal svare 200 og innholde toplist', (done) => {
        chai.request(app)
            .get('/')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.text).to.include('Understory Toplist');
                done();
            });
        });

        it('GET /understory-toplist skal rendres (både period + sort)', (done) => {
            chai.request(app)
                .get('/understory-toplist')
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.text).to.include('FILTRER ETTER');
                    done();
                });
            });

        it('POST /api/toplist skal opprette en ny entry', (done) => {
            chai.request(app)
                .post('/api/toplist')
                .send({ name: 'testFirma', revenue: 12345 })
                .end((err, res) => {
                    expect(res).to.have.status(201);
                    expect(res.body).to.be.an('object');
                    expect(res.body.company).to.be.an('object');
                    expect(res.body.company.name).to.equal('testFirma');
                    expect(res.body.company.revenue).to.equal(12345);
                    done();
                });
            });
    
        it('POST /api/toplist skal returnere 400 ved manglende data', (done) => {
            chai.request(app)
                .post('/api/toplist')
                .send({ name: '' })
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    done();
                });
        });
});

