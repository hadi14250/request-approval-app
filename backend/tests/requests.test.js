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
        it("should respond with 201 and send back created request as json", async () => {
            const response = await request(app)
            .post("/requests")
            .set("user-id", "1") // user-id 1 belongs to a requester
            .send({
                title: "VPN Access",
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
                title: "VPN Access",
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
            .set("user-id", "2") // user-id 2 belongs to an approver
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
        it("should respond with 200 and send submitted request as json", async () => {
            const CreateResponse = await request(app)
            .post("/requests")
            .set("user-id", "1") // user-id 1 belongs to a requester
            .send({
                title: "VPN Access",
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
        it("should respond with 400 status code", async () => {
            const CreateResponse = await request(app)
            .post("/requests")
            .set("user-id", "1") // user-id 1 belongs to a requester
            .send({
                title: "VPN Access",
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

    describe("Submit draft request as an approver (not requester", () => {
        it("should respond with 403 status code", async () => {
            const CreateResponse = await request(app)
            .post("/requests")
            .set("user-id", "1") // user-id 1 belongs to a requester
            .send({
                title: "VPN Access",
                description: "Need VPN for work",
                type: "Work"
            })

            const id = CreateResponse.body.id;

            const submitResponse = await request(app)
            .post(`/requests/${id}/submit`)
            .set("user-id", "2"); // user-id 2 belongs to an approver
            
            expect(submitResponse.statusCode).toBe(403);

        });
    })
})


describe("POST /requests/:id/approve", () => {

    describe("approve valid submitted request", () => {
        it("should respond with 200 status code and send approved request as json", async () => {
            const createResponse = await request(app).
            post("/requests")
            .set("user-id", "1") // user-id 1 belongs to a requester
            .send({
                title: "VPN Access",
                description: "Need VPN for work",
                type: "Work"
            });

            const id = createResponse.body.id;

            const submitResponse = await request(app)
            .post(`/requests/${id}/submit`)
            .set("user-id", "1"); // user-id 1 belongs to a requester

            expect(submitResponse.statusCode).toBe(200);
            expect(submitResponse.body.status).toBe("Submitted");

            const approveResponse = await request(app)
            .post(`/requests/${id}/approve`) 
            .set("user-id", "2") // user-id 2 belongs to an approver
            .send({
                approverComment: "nice request"
            });

            expect(approveResponse.statusCode).toBe(200);
            expect(approveResponse.body.status).toBe("Approved")

        });
    });

    describe("approve valid submitted request as requester (not approver)", () => {
        it("should respond with 403", async () => {
            const createResponse = await request(app).
            post("/requests")
            .set("user-id", "1") // user-id 1 belongs to a requester
            .send({
                title: "VPN Access",
                description: "Need VPN for work",
                type: "Work"
            });

            const id = createResponse.body.id;

            const submitResponse = await request(app)
            .post(`/requests/${id}/submit`)
            .set("user-id", "1"); // user-id 1 belongs to a requester

            expect(submitResponse.statusCode).toBe(200);
            expect(submitResponse.body.status).toBe("Submitted");

            const approveResponse = await request(app)
            .post(`/requests/${id}/approve`) 
            .set("user-id", "1") // user-id 1 belongs to a requester
            .send({
                approverComment: "nice request"
            });

            expect(approveResponse.statusCode).toBe(403);

        });
    });

    describe("approve already approved request", () => {
        it("should respond with 400", async () => {
            const createResponse = await request(app).
            post("/requests")
            .set("user-id", "1") // user-id 1 belongs to a requester
            .send({
                title: "VPN Access",
                description: "Need VPN for work",
                type: "Work"
            });

            const id = createResponse.body.id;

            const submitResponse = await request(app)
            .post(`/requests/${id}/submit`)
            .set("user-id", "1"); // user-id 1 belongs to a requester

            expect(submitResponse.statusCode).toBe(200);
            expect(submitResponse.body.status).toBe("Submitted");

            const approveResponse = await request(app)
            .post(`/requests/${id}/approve`) 
            .set("user-id", "2") // user-id 2 belongs to a requester
            .send({
                approverComment: "nice request"
            });

            expect(approveResponse.statusCode).toBe(200);

            const reApproveResponse = await request(app)
            .post(`/requests/${id}/approve`)
            .set("user-id", "2") // user-id 2 belongs to a requester
            .send({
                approverComment: "nice request"
            });

            expect(reApproveResponse.statusCode).toBe(400);
        });
    });

    describe("approve request without approver Comment", () => {
        it("should respond with 400", async () => {
            const createResponse = await request(app).
            post("/requests")
            .set("user-id", "1") // user-id 1 belongs to a requester
            .send({
                title: "VPN Access",
                description: "Need VPN for work",
                type: "Work"
            });

            const id = createResponse.body.id;

            const submitResponse = await request(app)
            .post(`/requests/${id}/submit`)
            .set("user-id", "1"); // user-id 1 belongs to a requester

            expect(submitResponse.statusCode).toBe(200);
            expect(submitResponse.body.status).toBe("Submitted");

            const approveResponse = await request(app)
            .post(`/requests/${id}/approve`) 
            .set("user-id", "2") // user-id 2 belongs to a requester

            expect(approveResponse.statusCode).toBe(400);
        });
    });
})

describe("POST /requests/:id/reject", () => {

    describe("reject valid submitted request", () => {
        it("should respond with 200 status code and send approved request as json", async () => {
            const createResponse = await request(app).
            post("/requests")
            .set("user-id", "1") // user-id 1 belongs to a requester
            .send({
                title: "VPN Access",
                description: "Need VPN for work",
                type: "Work"
            });

            const id = createResponse.body.id;

            const submitResponse = await request(app)
            .post(`/requests/${id}/submit`)
            .set("user-id", "1"); // user-id 1 belongs to a requester

            expect(submitResponse.statusCode).toBe(200);
            expect(submitResponse.body.status).toBe("Submitted");

            const rejectResponse = await request(app)
            .post(`/requests/${id}/reject`) 
            .set("user-id", "2") // user-id 2 belongs to an approver
            .send({
                approverComment: "not nice request"
            });

            expect(rejectResponse.statusCode).toBe(200);
            expect(rejectResponse.body.status).toBe("Rejected")

        });
    });

    describe("reject valid submitted request as requester (not approver)", () => {
        it("should respond with 403", async () => {
            const createResponse = await request(app).
            post("/requests")
            .set("user-id", "1") // user-id 1 belongs to a requester
            .send({
                title: "VPN Access",
                description: "Need VPN for work",
                type: "Work"
            });

            const id = createResponse.body.id;

            const submitResponse = await request(app)
            .post(`/requests/${id}/submit`)
            .set("user-id", "1"); // user-id 1 belongs to a requester

            expect(submitResponse.statusCode).toBe(200);
            expect(submitResponse.body.status).toBe("Submitted");

            const rejectResponse = await request(app)
            .post(`/requests/${id}/reject`) 
            .set("user-id", "1") // user-id 1 belongs to a requester
            .send({
                approverComment: "not nice request"
            });

            expect(rejectResponse.statusCode).toBe(403);

        });
    });

    describe("reject an approved request", () => {
        it("should respond with 400", async () => {
            const createResponse = await request(app).
            post("/requests")
            .set("user-id", "1") // user-id 1 belongs to a requester
            .send({
                title: "VPN Access",
                description: "Need VPN for work",
                type: "Work"
            });

            const id = createResponse.body.id;

            const submitResponse = await request(app)
            .post(`/requests/${id}/submit`)
            .set("user-id", "1"); // user-id 1 belongs to a requester

            expect(submitResponse.statusCode).toBe(200);
            expect(submitResponse.body.status).toBe("Submitted");

            const approveResponse = await request(app)
            .post(`/requests/${id}/approve`) 
            .set("user-id", "2") // user-id 2 belongs to a requester
            .send({
                approverComment: "nice request"
            });

            expect(approveResponse.statusCode).toBe(200);

            const rejecteResponse = await request(app)
            .post(`/requests/${id}/reject`)
            .set("user-id", "2") // user-id 2 belongs to a requester
            .send({
                approverComment: "not nice request"
            });

            expect(rejecteResponse.statusCode).toBe(400);
        });
    });

    describe("reject request without approver Comment", () => {
        it("should respond with 400", async () => {
            const createResponse = await request(app).
            post("/requests")
            .set("user-id", "1") // user-id 1 belongs to a requester
            .send({
                title: "VPN Access",
                description: "Need VPN for work",
                type: "Work"
            });

            const id = createResponse.body.id;

            const submitResponse = await request(app)
            .post(`/requests/${id}/submit`)
            .set("user-id", "1"); // user-id 1 belongs to a requester

            expect(submitResponse.statusCode).toBe(200);
            expect(submitResponse.body.status).toBe("Submitted");

            const rejectResponse = await request(app)
            .post(`/requests/${id}/reject`) 
            .set("user-id", "2") // user-id 2 belongs to a requester

            expect(rejectResponse.statusCode).toBe(400);
        });
    });
})

