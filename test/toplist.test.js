const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app.js'); 

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

        it('POST /login skal gi 40 ved feil innlogging', (done) => {
            chai.request(app)
                .post('/login')
                .send({ email: 'test@example.com', password: 'feilpassword' })
                .end((err, res) => {
                    expect(res).to.have.status(401); //eller 400 avhengig av implementasjon
                    done();
                });
            });
    
        it('POST /signup skal gi 400 ved mangelnde data', (done) => {
            chai.request(app)
                .post('/signup')
                .send({ email: '', password: '' })
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    done();
                });
        });
});

