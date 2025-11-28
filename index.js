const { program } = require('commander');
const express = require('express');
const app = express();
const path = require('path');
const multer = require('multer');
const swaggerUi = require('swagger-ui-express');    
const YAML = require('yamljs');
require('dotenv').config()

program
    .requiredOption('-h, --host <host>')
    .requiredOption('-p, --port <port>')
    .parse(process.argv);

const options = program.opts();
const upload = multer({ storage: multer.memoryStorage()});

const swaggerDocument = YAML.load('./swagger.yaml');
swaggerDocument.servers = [{ url: `http://${options.host}:${options.port}` }];

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.post('/register', upload.single('photo'), async (req, res) => {

});

app.get('/inventory', async (req, res) => { res.json("Test method") });

app.get('/inventory/:id', async (req, res) => {

});

app.put('/inventory/:id', async (req, res) => {

});

app.get('/inventory/:id/photo', async (req, res) => {

});

app.put('/inventory/:id/photo', upload.single('photo'), async (req, res) => {

});

app.delete('/inventory/:id', async (req, res) => {

});

app.get('/RegisterForm.html', (req, res) => { res.sendFile(path.join(path.resolve(), 'src', 'RegisterForm.html')); });
app.get('/SearchForm.html', (req, res) => { res.sendFile(path.join(path.resolve(), 'src', 'SearchForm.html')); });

app.post('/search', async (req, res) => {

});

app.use((req, res) => { res.status(405).json({ error: 'Method not allowed' }); });

app.listen(options.port, process.env.HOST, () => {
    console.log(`Server listening on http://${options.host}:${options.port}`);
});