const express = require('express');
const fs = require('fs');
const path = require('path');
const uuid = require('./helpers/uuid');

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/index.html'))
);

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/notes.html'));
});

app.get('/api/notes', (req, res) => {
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to read notes data' });
        }
        res.json(JSON.parse(data));
    });
});

app.post('/api/notes', (req, res) => {
    const { title, text } = req.body;

    if (title && text) {
        const newNote = {
            title,
            text,
            id: uuid(),
        };
        fs.readFile('./db/db.json', (err, data) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'error reading notes data' });
            }
            const notes = JSON.parse(data);
            notes.push(newNote);

            fs.writeFile('./db/db.json', JSON.stringify(notes, null, 2), (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Error saving the note.' });
                }
                res.json(newNote);
            });
        })
    } else {
        res.status(400).json({ error: 'Please give both a Title and Text for the note.' });
    }
})

app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;

    fs.readFile('./db/db.json', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error reading notes data' });
        }
        let notes = JSON.parse(data);
        notes = notes.filter(note => note.id !== noteId); // Remove the note with the matching id

        fs.writeFile('./db/db.json', JSON.stringify(notes, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error deleting the note' });
            }
            res.json({ message: 'Note deleted successfully' });
        });
    });
});


app.listen(PORT, () =>
    console.log(`App listening at http://localhost:${PORT}`)
);