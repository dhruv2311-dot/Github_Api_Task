const express = require('express');
const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');
const app = express();
const port = 3001;


const uri = "mongodb://127.0.0.1:27017";
const dbName = "github";


app.use(express.json());

let db, users, repositories, issues, pullRequests, commits, forks, stars;


async function initializeDatabase() {
    try {
        const client = await MongoClient.connect(uri, { useUnifiedTopology: true });
        console.log("Connected to MongoDB");

        db = client.db(dbName);
        users = db.collection("users");
        repositories = db.collection("repositories");
        issues = db.collection("issues");
        pullRequests = db.collection("pullRequests");
        commits = db.collection("commits");
        forks = db.collection("forks");
        stars = db.collection("stars");


        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    }
}


initializeDatabase();


app.get('/users', async (req, res) => {
    try {
        const allUsers = await users.find().toArray();
        res.json(allUsers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/users/:userId', async (req, res) => {
    try {
        const user = await users.findOne({ userId: req.params.userId });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/users', async (req, res) => {
    try {
        const result = await users.insertOne(req.body);



        const newUser = await users.findOne({ _id: result.insertedId });

        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});



app.patch('/users/:userId', async (req, res) => {
    try {
        const result = await users.updateOne(
            { userId: req.params.userId },
            { $set: req.body }
        );
        if (result.matchedCount === 0) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.delete('/users/:userId', async (req, res) => {
    try {
        const result = await users.deleteOne({ userId: req.params.userId });
        if (result.deletedCount === 0) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



app.get('/repositories', async (req, res) => {
    try {
        const allRepositories = await repositories.find().toArray();
        res.json(allRepositories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/repositories/:repoId', async (req, res) => {
    try {

        const repository = await db.collection('repositories').findOne({ repoId: req.params.repoId });


        if (!repository) {
            return res.status(404).json({ error: 'Repository not found' });
        }


        res.json(repository);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.post('/repositories', async (req, res) => {
    try {

        const result = await db.collection('repositories').insertOne(req.body);


        res.status(201).json({
            repoId: result.insertedId, 
            ...req.body           
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


app.patch('/repositories/:repoId', async (req, res) => {
    try {
        const repoId = req.params.repoId;
        const updates = req.body;

        const result = await repositories.updateOne(
            { repoId },
            { $set: updates }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Repository not found' });
        }

        res.status(200).json({ message: 'Repository updated successfully', updatedCount: result.modifiedCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.delete('/repositories/:repoId', async (req, res) => {
    try {
        const repoId = req.params.repoId;

        const result = await repositories.deleteOne({ repoId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Repository not found' });
        }

        res.status(200).json({ message: 'Repository deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});





app.get('/repositories/:repoId/issues', async (req, res) => {
    try {
        const repoIssues = await issues.find({ repoId: req.params.repoId }).toArray();
        res.json(repoIssues);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/issues', async (req, res) => {
    try {
     
        const result = await db.collection('issues').insertOne(req.body);


        res.status(201).json({
            issueId: result.insertedId, 
            ...req.body                
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});



app.patch('/issues/:issueId/status', async (req, res) => {
    try {
        const issueId = req.params.issueId;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        const result = await db.collection('issues').updateOne(
            { issueId: issueId }, 
            { $set: { status } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Issue not found' });
        }

        res.status(200).json({
            message: 'Issue status updated successfully',
            updatedCount: result.modifiedCount
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.delete('/issues/:issueId', async (req, res) => {
    try {
        const issueId = req.params.issueId;

      
        const result = await db.collection('issues').deleteOne({ issueId: issueId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Issue not found' });
        }

        res.status(200).json({ message: 'Issue deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



app.get('/repositories/:repoId/pull-requests', async (req, res) => {
    try {
        const repoPullRequests = await pullRequests.find({ repoId: req.params.repoId }).toArray();
        res.json(repoPullRequests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/pull-requests', async (req, res) => {
    try {
        const pullRequest = new PullRequest(req.body);
        await pullRequest.save();
        res.status(201).json(pullRequest);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
app.delete('/pull-requests/:prId', async (req, res) => {
    try {
        const prId = req.params.prId; 

        
        const result = await db.collection('pullRequests').deleteOne({ prId: prId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Pull request not found' });
        }

        res.status(200).json({ message: 'Pull request deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



app.get('/repositories/:repoId/commits', async (req, res) => {
    try {
        const repoCommits = await commits.find({ repoId: req.params.repoId }).toArray();
        res.json(repoCommits);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/commits', async (req, res) => {
    try {
        const newCommit = {
            commitId: req.body.commitId,
            repoId: req.body.repoId,
            userId: req.body.userId,
            message: req.body.message,
            createdAt: new Date(req.body.createdAt || Date.now())
        };

        const result = await db.collection('commits').insertOne(newCommit);

        
        res.status(201).json({ ...newCommit, _id: result.insertedId });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


app.delete('/commits/:commitId', async (req, res) => {
    try {
        const commitId = req.params.commitId;

        const result = await db.collection('commits').deleteOne({ commitId: commitId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Commit not found' });
        }

        res.status(200).json({ message: 'Commit deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.post('/forks', async (req, res) => {
    try {
        const fork = req.body;

        const result = await db.collection('forks').insertOne(fork);

        await db.collection('repositories').updateOne(
            { repoId: fork.repoId },
            { $inc: { forks: 1 } }
        );

        res.status(201).json({ ...fork, _id: result.insertedId });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});



app.post('/stars', async (req, res) => {
    try {
        const star = req.body;

        const result = await db.collection('stars').insertOne(star);

        await db.collection('repositories').updateOne(
            { repoId: star.repoId },
            { $inc: { stars: 1 } }
        );

        res.status(201).json({ ...star, _id: result.insertedId });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

