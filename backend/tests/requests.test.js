const request = require("supertest");
const app = require("../app");
const db = require("../db");

beforeAll(() => {
    db.prepare("DELETE FROM requests").run();
});


beforeEach(() => {
  db.prepare("DELETE FROM requests").run();
});

afterAll(() => {
    db.close();
});

describe("POST /requests", () => {
    
    describe("Valid header", () => {
        it("Requester makes a new request", async () => {
            const response = await request(app)
            .post("/requests")
            .set("user-id", "1")
            .send({
                title: "testyyyy",
                description: "Need VPN for work",
                type: "Work"
            });
            expect(response.statusCode).toBe(201);
            expect(response.body.status).toBe("Draft");
        });
    })

    describe("No user-id in header", () => {
        it("Should respond with 401 status code", async () => {
            const response = await request(app)
            .post("/requests")
            .send({
                title: "testyyyy",
                description: "Need VPN for work",
                type: "Work"
            });
            expect(response.statusCode).toBe(401);
        });
    })

    describe("user-id is not for a requester role", () => {
        it("Should respond with 403 status code", async () => {
            const response = await request(app)
            .post("/requests")
            .set("user-id", "2")
            .send({
                title: "VPN Access",
                description: "Need VPN for work",
                type: "Work"
            });
            expect(response.statusCode).toBe(403);
        });
    })

    describe("title is not included", () => {
        it("Should respond with 400 status code", async () => {
            const response = await request(app)
            .post("/requests")
            .set("user-id", "1")
            .send({
                description: "Need VPN for work",
                type: "Work"
            });
            expect(response.statusCode).toBe(400);
        });
    })
})


describe("POST /requests/:id/submit", () => {

    describe("Submit valid draft request", () => {
        it("Requester submits requests", async () => {
            const CreateResponse = await request(app)
            .post("/requests")
            .set("user-id", "1")
            .send({
                title: "testyyyy",
                description: "Need VPN for work",
                type: "Work"
            })

            const id = CreateResponse.body.id;

            const submitResponse = await request(app)
            .post(`/requests/${id}/submit`)
            .set("user-id", "1");

            expect(submitResponse.statusCode).toBe(200);
            expect(submitResponse.body.status).toBe("Submitted");
        });
    })

    describe("Submit non-draft request", () => {
        it("Requester submits requests", async () => {
            const CreateResponse = await request(app)
            .post("/requests")
            .set("user-id", "1")
            .send({
                title: "testyyyy",
                description: "Need VPN for work",
                type: "Work"
            })

            const id = CreateResponse.body.id;

            const submitResponse = await request(app)
            .post(`/requests/${id}/submit`)
            .set("user-id", "1");

            expect(submitResponse.statusCode).toBe(200);
            expect(submitResponse.body.status).toBe("Submitted");

            const resubmitResponse = await request(app)
            .post(`/requests/${id}/submit`)
            .set("user-id", "1");
            expect(resubmitResponse.statusCode).toBe(400);
        });
    })
})

