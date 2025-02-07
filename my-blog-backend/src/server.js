import fs from 'fs';  
import path from 'path';
import admin from 'firebase-admin';
import express from 'express';   
import'dotenv/config';
import { db, connectToDB } from './db.js'   

import { fileURLToPath } from 'url';  

// Recreating the __dirname
const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename); 

const credentials = JSON.parse( 
    fs.readFileSync('./credentials.json')
);

admin.initializeApp({ 
    credential: admin.credential.cert(credentials),
});

const app = express();  
app.use(express.json());   
app.use(express.static(path.join(__dirname, '../build'))); 

// Adding a route handler for when we receive a request that is not one of our routes 
app.get(/^(?!\/api).+/, (req, res) => { 
    res.sendFile(path.join(__dirname, '../build/index.html'));
})

// App.use middlewear to load the user automatically by their header 
app.use( async (req, res, next) => { 
    const { authtoken } = req.headers; 

    if (authtoken) { 
        try { 
            req.user = await admin.auth().verifyIdToken(authtoken); 
        } catch (e) { 
            return res.sendStatus(400);
        }
    }  

    req.user = req.user || {}; 
    next();
});

//Fake Database for aritcle upvotes to make sure the server will process the upvotes correctly 
// let articlesInfo = [{ 
//     name: 'learn-react', 
//     upvotes: 0, 
//     comments: [],
// }, { 
//     name: 'learn-node', 
//     upvotes: 0, 
//     comments: [],
// }, { 
//     name: 'mongodb', 
//     upvotes: 0, 
//     comments: [],
// }] 

app.get('/api/articles/:name', async (req, res) => { 
    const { name } = req.params;  
    const { uid } = req.user; 

 
    const article = await db.collection('articles').findOne({ name }); 

    if (article) {  
        const upvoteIds = article.upvoteIds || []; 
        article.canUpvote = uid && !upvoteIds.includes(uid);
        res.json(article); 
    } else { 
        res.sendStatus(404).send('Article not found')
    }
     
}); 


// Add peice of middlewear thats only going to apply to the next 2 and will prevent them from making requests is they alredy have 
app.use((req, res, next) => { 
    if (req.user) { 
        next(); 
    } else { 
        res.sendStatus(401);
    }
});


app.put('/api/articles/:name/upvote', async (req, res) => {  
    const { name } = req.params;    
    const { uid } = req.user;   

    const article = await db.collection('articles').findOne({ name }); 
    
    if (article) {  
        const upvoteIds = article.upvoteIds || []; 
        const canUpvote = uid && !upvoteIds.includes(uid); 
        if (canUpvote) { 
            await db.collection('articles').updateOne({ name }, { 
                $inc: { upvotes: 1 }, 
                $push: { upvoteIds: uid } 
            }); 
        }  

        const updatedArticle = await db.collection('articles').findOne({ name });
        res.json(updatedArticle);
    } else { 
        res.sendStatus(404);
    }
});  


app.post('/api/articles/:name/comments', async (req, res) => {  
    const { name } = req.params; 
    const { text } = req.body;
    const { email } = req.user;

    await db.collection('articles').updateOne({ name }, { 
        $push: { comments: { postedBy: email, text } }, 

    });  

    const article = await db.collection('articles').findOne({ name }); 

    if (article) {   
        res.json(article);
    } else { 
        res.send('Article doesn\'t exist');
    }
    
});


const PORT = process.env.PORT || 8000;  

connectToDB(() => {  
    console.log('Successfully connected to database') 
    app.listen(PORT, () => { 
        console.log('Server is listening on port' + PORT);
    }); 
});







// Figure out how we can have the user remove a like that they have placed. This may have to be done once we integrate user Auth
// app.put('/api/articles/:name/upvote', (req, res) => { 
//     const { name } = req.params; 
//     const article = articlesInfo.find(a => a.name === name); 
//     if (article) { 
//         article.upvotes += 1; 
//         res.send(`The ${name} article now has ${article.upvotes} likes.`);
//     } 
//     else { 
//         res.send('Article doesn\'t exist');
//     }
// });

// Basic server post and get implementation 
// app.post('/hello', (req, res) => {  
//     console.log(req.body)
//     res.send(`Hello ${req.body.name}`);
// });  

// app.get('/hello/:name/goodbye/:otherName', (req, res) => {  
//     console.log(req.params);
//     const { name } = req.params; 
//     res.send(`Hello ${name} in new `)
// }); 