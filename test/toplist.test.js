const request = require('supertest');
const chai = require('chai');
const app = require('../app.js'); 

const { expect } = chai;

describe('Toplist sine endpoints', () => {

    it('GET, skal svare 200 og innholde toplist', (done) => {
        request(app)
            .get('/')
            .end((err, res) => {
                if (err) return done(err);
                expect(res.status).to.equal(200);
                expect(res.text).to.include('Understory Toplist');
                done();
            });
        });

        it('GET /understory-toplist skal rendres (både period + sort)', (done) => {
            request(app)
                .get('/understory-toplist')
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.status).to.equal(200);
                    expect(res.text).to.include('FILTRER ETTER');
                    done();
                });
            });

        it('POST /login skal gi 400 ved feil innlogging', (done) => {
            request(app)
                .post('/login')
                .send({ email: 'test@example.com', password: 'feilpassword' })
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.status).to.equal(400); //eller 400 avhengig av implementasjon
                    done();
                });
            });
    
        it('POST /signup skal gi 400 ved mangelnde data', (done) => {
            request(app)
                .post('/signup')
                .send({ email: '', password: '' })
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.status).to.equal(400);
                    done();
                });
        });
});

