const express = require('express')
const app = express();

const fs = require('fs')
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml')
//terminal: npm i swagger-ui-express@4.6.2 yaml

const file  =  fs.readFileSync(process.cwd() + '/swagger.yaml', 'utf8')
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

const tasks = [{ id: 1, name: 'Task 1', isDone: false }, { id: 2, name: 'Task 2', isDone: false }];
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