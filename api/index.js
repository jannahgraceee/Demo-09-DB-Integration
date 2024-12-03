require('dotenv').config();
const { sql } = require('@vercel/postgres');
const express = require('express')
const app = express();

const fs = require('fs')
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml')
//terminal: npm i swagger-ui-express@4.6.2 yaml

const file = fs.readFileSync(process.cwd() + '/swagger.yaml', 'utf8')
const swaggerDocument = YAML.parse(file)
const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css"

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customCss:
        '.swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }',
    customCssUrl: CSS_URL,
}));

// enable middleware to parse body of Content-type: application/json
app.use(express.json());

const PORT = 4000;

app.listen(process.env.PORT || PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
})

/*const tasks = [{ id: 1, name: 'Task 1', isDone: false }, { id: 2, name: 'Task 2', isDone: false }];
let taskId = tasks.length;

// http://localhost:4000/tasks
app.get('/tasks', (req, res) => {
    if (req.query) {
        if (req.query.id) {
            // http://localhost:4000/tasks?id=1
            const task = tasks.find((task) => task.id === parseInt(req.query.id));
            if (task) {
                res.json(task);
            } else {
                res.status(404).json();
            }
            return;
        }
    }

    res.json(tasks);
});

// http://localhost:4000/tasks/1
app.get('/tasks/:id', (req, res) => {
    const id = req.params.id;
    const task = tasks.find((task) => task.id === parseInt(id));

    if (task) {
        res.json(task);
    } else {
        res.status(404).json();
    }
});

// http://localhost:4000/tasks - { "name": "New Task" }
app.post('/tasks', (req, res) => {
    taskId++;
    req.body.id = taskId;
    req.body.isDone = false;
    tasks.push(req.body);
    res.status(201).json();
});

//http://localhost:4000/tasks/1 - { "name": "Task 1 Updated", "isDone": true } | { "name": "Task 1 Updated" } | { "isDone": true }
app.put('/tasks/:id', (req, res) => {
    const id = req.params.id;
    const task = tasks.find((task) => task.id === parseInt(id));

    if (task) {
        task.id = parseInt(id);
        task.name = (req.body.name != undefined ? req.body.name : task.name);
        task.isDone = (req.body.isDone != undefined ? req.body.isDone : task.isDone);

        res.json(task);
    } else {
        res.status(404).json();
    }
});

// http://localhost:4000/tasks/1
app.delete('/tasks/:id', (req, res) => {
    const id = req.params.id;
    const task = tasks.find((task) => task.id === parseInt(id));

    if (task) {
        tasks.splice(tasks.indexOf(task), 1);
        res.status(204).json();
    } else {
        res.status(404).json();
    }
});
*/

// http://localhost:4000/tasks
app.get('/tasks', async (req, res) => {
    if (req.query) {
        if (req.query.id) {
            // http://localhost:4000/tasks?id=1
            const task = await sql`SELECT * FROM Tasks WHERE Id =
    ${req.query.id};`;
            if (task.rowCount > 0) {
                res.json(task.rows[0]);
            } else {
                res.status(404).json();
            }
            return;
        }
    }
    const tasks = await sql`SELECT * FROM Tasks ORDER BY Id;`;
    res.json(tasks.rows);
});
// http://localhost:4000/tasks/1
app.get('/tasks/:id', async (req, res) => {
    const id = req.params.id;
    const task = await sql`SELECT * FROM Tasks WHERE Id =
    ${id};`;
    if (task.rowCount > 0) {
        res.json(task.rows[0]);
    } else {
        res.status(404).json();
    }
});
// http://localhost:4000/tasks - { "name": "New Task" }
app.post('/tasks', async (req, res) => {
    await sql`INSERT INTO Tasks (Name) VALUES
    (${req.body.name});`;
    res.status(201).json();
});
/*http://localhost:4000/tasks/1 - { "name": "Task 1 Updated",
"isDone": true } | { "name": "Task 1 Updated" } | {
    "isDone":
        true
}*/
app.put('/tasks/:id', async (req, res) => {
    const id = req.params.id;
    const taskUpdate = await sql`UPDATE Tasks SET Name = ${(req.body.name != undefined ? req.body.name : task.name)
        }, IsDone = ${(req.body.isDone != undefined ? req.body.isDone :
            task.isDone)
        } WHERE Id = ${id};`;
    if (taskUpdate.rowCount > 0) {
        const task = await sql`SELECT * FROM Tasks WHERE Id =
    ${id};`;
        res.status(200).json(task.rows[0]);
    } else {
        res.status(404).json();
    }
});
// http://localhost:4000/tasks/1
app.delete('/tasks/:id', async (req, res) => {
    const id = req.params.id;
    const task = await sql`DELETE FROM Tasks WHERE Id = ${id};`;
    if (task.rowCount > 0) {
        res.status(204).json();
    } else {
        res.status(404).json();
    }
});



module.exports = app;