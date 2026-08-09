"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../src/generated/prisma/client");
const faker_1 = require("@faker-js/faker");
const dotenv_1 = __importDefault(require("dotenv"));
const adapter_pg_1 = require("@prisma/adapter-pg");
const prismaPg = new adapter_pg_1.PrismaPg({
    connectionString: process.env.DATABASE_URL || '',
});
const prisma = new client_1.PrismaClient({ adapter: prismaPg });
const fakeUser = {
    name: faker_1.faker.person.fullName(),
    email: faker_1.faker.internet.email(),
    password: faker_1.faker.internet.password(),
};
async function main() {
    const fakerRounds = 10;
    dotenv_1.default.config();
    console.log('Seeding...');
    for (let i = 0; i < fakerRounds; i++) {
        await prisma.user.create({ data: fakeUser });
    }
}
main()
    .catch((e) => console.error(e))
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map