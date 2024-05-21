const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");

require("dotenv").config();

/* Connecting to the database before each test. */
beforeEach(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
});

/* Closing database connection after each test. */
afterEach(async () => {
    await mongoose.connection.close();
});


describe("GET /api/products/:id", () => {
    it("should return a product", async () => {
        const res = await request(app).get("/api/products/6331abc9e9ececcc2d449e44");
        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe("Product 1");
    });
});
