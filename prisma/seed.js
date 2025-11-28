const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    await prisma.inventory.deleteMany();
    let inventories = [];

    inventories.push({
        name: "Laptop",
        description: 'Lenovo',
        photo: null
    });
    inventories.push({
        name: "PC",
        description: null,
        photo: null
    });

    await prisma.inventory.createMany({ data: inventories,
    });
}

main()
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });