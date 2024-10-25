const express = require ('express')
const app = express()
const handlebars = require ('express-handlebars').engine
const bodyparser = require ('body-parser')
const Handlebars = require ('handlebars')

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app')
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore')
const serviceAccount = require('./webll-11df3-firebase-adminsdk-dldv6-d765dc2525.json')

initializeApp({
    credential: cert(serviceAccount)
})

const db = getFirestore()

app.engine('handlebars', handlebars({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')

app.use(bodyparser.urlencoded({extended: false}))
app.use(bodyparser.json())

app.get('/', function(req, res){
    res.render('primeira_pagina')
})

app.post('/cadastrar', function(req, res){
    var result = db.collection('clientes').add({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }).then(function(){
        console.log('Dados cadastrados com sucesso!')
    })
})

app.get("/consultar", function(req, res){
    var posts = []
    db.collection('clientes').get().then(
        function(snapshot){
            snapshot.forEach(
                function(doc){
                    const data = doc.data()
                    data.id = doc.id
                    //console.log(doc.data())
                    posts.push(data)
                }
            )
            res.render("consulta", {posts: posts})
        }
    )
})

app.get("/editar/:id", function(req, res){
    var posts = []
    const id = req.params.id
    const clientes = db.collection('clientes').doc(id).get().then(
        function(doc){
            const data = doc.data()
            data.id = doc.id
            posts.push(data)
            res.render("editar", {posts: posts})
        }
    )
})

Handlebars.registerHelper('eq', function(v1, v2){
    return v1 === v2
})

app.post("/atualizar/:id", function(req, res) {
    const id = req.params.id;
    db.collection('clientes').doc(id).update({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }).then(function() {
        console.log('Documento atualizado com sucesso!');
        res.redirect('/consultar');
    }).catch(function(error) {
        console.error('Erro ao atualizar o documento:', error);
        res.status(500).send('Erro ao atualizar o documento.');
    });
});


app.get("/excluir/:id", function(req, res){
    const id = req.params.id
    var result = db.collection('clientes').doc(id).delete().then(function(){
        console.log('Documento excluído com sucesso!')
        res.redirect('/consultar')
    })
})

app.listen(8081, function(){
    console.log('Servidor ativo!')
})