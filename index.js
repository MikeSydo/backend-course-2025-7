const { program } = require('commander');
const express = require('express');
const app = express();
const path = require('path');
const multer = require('multer');
const swaggerUi = require('swagger-ui-express');    
const YAML = require('yamljs');
require('dotenv').config()
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

program
    .requiredOption('-h, --host <host>')
    .requiredOption('-p, --port <port>')
    .parse(process.argv);

const options = program.opts();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 }});

const swaggerDocument = YAML.load('./swagger.yaml');
swaggerDocument.servers = [{ url: `http://${options.host}:${options.port}` }];

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.post('/register', upload.single('photo'), async (req, res) => {
    try {
        const { inventory_name, description } = req.body;
        if (!inventory_name) return res.status(400).send('Name is required');
        await prisma.inventory.create({
            data: {
                name: inventory_name,
                description: description || null,
                photoName: req.file ? req.file.originalname : null,
                photo: req.file ? req.file.buffer : null  
            }
        });
        res.status(200).json({ message: "Inventory created successfully"});
    } catch (error) {
        res.status(500).json({ error: 'Error creating item', message: error });
    }
});

app.get('/inventory', async (req, res) => { 
    try {
        const inventories = await prisma.inventory.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                photoName: true
            },
            orderBy: {
                id: 'asc'
            }
        });

        res.status(200).json(inventories);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching inventories', message: error });
    }
 });

app.get('/inventory/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const inventory = await prisma.inventory.findUnique({ 
            where: { id },
            select: {
                id: true,
                name: true,
                description: true,
                photoName: true
            },
        });
        if(!inventory) return res.status(404).json({ error: "Inventory not found"});
        res.status(200).json(inventory);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching inventory', message: error });
    }
});

app.put('/inventory/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { inventory_name, description } = req.body;

        const updateData = {};
        if (inventory_name) updateData.name = inventory_name;
        if (description) updateData.description = description;

        await prisma.inventory.update({
            where: { id },
            data: updateData,
        });

        res.status(200).json({ message: 'Inventory updated successfully' });
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Inventory not found' });
        res.status(500).json({ error: 'Error updating inventory', message: error });
    }
});

app.get('/inventory/:id/photo', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const inventory = await prisma.inventory.findUnique({
            where: { id },
            select: { photo: true }
        });

        if (!inventory || !inventory.photo) {
            return res.status(404).json({ error: 'Photo not found' });
        }

        res.setHeader("Content-Type", "image/jpeg");
        res.send(inventory.photo);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching photo inventory', message: error });
    }
});

app.put('/inventory/:id/photo', upload.single('photo'), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        const inventory = await prisma.inventory.findUnique({ where: { id } });
        if (!inventory) return res.status(404).json({ error: 'Inventory not found' });
        if (!req.file) return res.status(400).json({ error: 'Photo is required' });

        await prisma.inventory.update({ 
            where: { id }, 
            data: { 
                photo: req.file.buffer,
                photoName: req.file.originalname 
            }});

        res.status(200).json({ message: 'Photo updated successfully' });
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Inventory not found' });
        res.status(500).json({ error: 'Error updating photo inventory', message: error});
    }
});

app.delete('/inventory/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma.inventory.delete({ where: { id } });
        res.status(200).json({ message: 'Photo deleted successfully' });
    } catch (error) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Item not found' });
        res.status(500).json({ error: 'Error deleting inventory', message: error });
    }
});

app.get('/RegisterForm.html', (req, res) => { res.sendFile(path.join(path.resolve(), 'src', 'RegisterForm.html')); });
app.get('/SearchForm.html', (req, res) => { res.sendFile(path.join(path.resolve(), 'src', 'SearchForm.html')); });

app.post('/search', async (req, res) => {
    try {
        const id = parseInt(req.body.id);
        const includePhoto = req.body.includePhoto === 'on';
        let inventory = await prisma.inventory.findUnique({ 
            where: { id },
            select: {
                id: true,
                name: true,
                description: true,
                photoName: true
            },
        });
        if(!inventory) return res.status(404).json({ error: "Inventory not found"});
        if (includePhoto && inventory.photoName) {
            inventory.description = inventory.description ? `${inventory.description} Photo: ${inventory.photoName}` : `Photo: ${inventory.photoName}`;
        }
        res.status(200).json(inventory);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching inventory', message: error });
    }
});

app.use((req, res) => { res.status(405).json({ error: 'Method not allowed' }); });

app.listen(options.port, process.env.HOST, () => {
    console.log(`Server listening on http://${options.host}:${options.port}`);
});