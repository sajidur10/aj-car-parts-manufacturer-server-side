const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --------------------------------------------------------------------
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gqaks.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
        await client.connect();

        const database = client.db("Permium_Motors");
        const carsCollection = database.collection("Cars");
        const ordersCollection = database.collection("Orders");
        const usersCollection = database.collection("Users");
        const reviewsCollection = database.collection("Reviews");

        // get cars api
        app.get('/cars', async(req, res) => {
            const cursor =  carsCollection.find({});
            const cars = await cursor.toArray();
            res.send(cars);
        });

       // GET SINGLE car
      app.get('/carDetails/:id', async (req, res) => {
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const car = await carsCollection.findOne(query);
        res.json(car);
      });

       // GET all orders
      app.get('/orders', async (req, res) => {
        const cursor =  ordersCollection.find({});
        const orders = await cursor.toArray();
        res.send(orders);
      });

       // GET all reviews
      app.get('/reviews', async (req, res) => {
        const cursor =  reviewsCollection.find({});
        const reviews = await cursor.toArray();
        res.send(reviews);
      });

    // get admins from db
    app.get('/users/:email', async(req,res)=>{
        const email = req.params.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
        if(user?.role === 'admin'){
            isAdmin= 'true';
        }
        res.json({admin: isAdmin});
    });

        // post cars api
        app.post('/cars', async(req, res) => {
            const cars = req.body;
            const result = await carsCollection.insertOne(cars);
            res.send(result);
        });

        // post orders api
        app.post('/orders', async(req, res) => {
            const orders = req.body;
            const result = await ordersCollection.insertOne(orders);
            res.send(result);
        });


         // add all user to db
         app.post('/users', async(req,res)=>{
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });

        // post review api to db
        app.post('/reviews', async(req,res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.json(result);
        });

        // update user for google log in
        app.put('/users', async(req,res)=>{
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set:user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);

        });

        // update admin role
        app.put('/users/admin', async(req,res)=>{
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set:{ role: 'admin'} };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        });

        //DELETE order API
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await ordersCollection.deleteOne(query);
            res.json(1);
        });

        //DELETE car API
        app.delete('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await carsCollection.deleteOne(query);
            res.json(1);
        });

    }
    finally{
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req,res)=>{
    res.send('Welcome to Premium-Motors server');
});
app.listen(port, ()=>{
    console.log('Running on port: ', port);
});