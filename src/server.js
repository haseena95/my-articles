import express from 'express';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';
import path from 'path';



const app = express();
const port = process.env.PORT || 5000;
const withDB = async (operations) => {
    try {
        const client = await MongoClient.connect('mongodb://127.0.0.1:27017');
        const db = client.db('my-blog');
        operations(db);
        // client.close();
        setTimeout(() => { client.close() }, 1500);
    }
    catch (error) {
        res.status(500).json({ message: 'Error connectiong to', error });
    }
}
app.use(express.static(path.join(__dirname, '/build')));
app.use(bodyParser.json())
app.get('/api/articles/:name', async (req, res) => {
    const articleName = req.params.name;
    withDB(async (db) => {

        const articleInfo = await db.collection('articles').findOne({ name: articleName });
        res.status(200).json(articleInfo);
    }, res);


})
app.post('/api/articles/:name/upvote', async (req, res) => {
    const articleName = req.params.name;
    withDB(async (db) => {

        const articleInfo = await db.collection('articles').findOne({ name: articleName });
        db.collection('articles').updateOne(
            { name: articleName },
            { $set: { upvotes: articleInfo.upvotes + 1, } },
        );
        const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName });
        res.status(200).json(updatedArticleInfo);

    }, res);

})

app.post('/api/articles/:name/add-comments', async (req, res) => {

    const { username, comment } = req.body;
    const articleName = req.params.name;

    withDB(async (db) => {

        let articleInfo = await db.collection('articles').findOne({ name: articleName });

        //{ $set: { comments: Array.isArray(articleInfo["comments"]) ? articleInfo["comments"].concat({ username, comment }) : [] } },
        //  { $set: { comments: [...articleInfo["comments"]].concat({ username, comment }) } }
        //  const result = Array.from(set1)

        await db.collection('articles').updateOne(
            { name: articleName },
            { $set: { comments: Array.isArray(articleInfo["comments"]) ? articleInfo["comments"].concat({ username, comment }) : [] } },
        );
        const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName });

        res.status(200).json(articleInfo);

    }, res);


})
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/build/index.html'));
})
app.listen(port, () => console.log(`Listening on post ${port}`));