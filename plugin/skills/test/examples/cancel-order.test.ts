// The tests of `api/cancel-order`, with a tag on each test.
// The project uses Vitest and Fastify. The helpers come from the test setup of the project.
import { describe, expect, it } from "vitest";
import { buildApp, fakeStripe, hoursAgo, seedOrder, spyEvents } from "./helpers";

describe("POST /orders/:id/cancel", () => {
  // mirror: api/cancel-order AC1
  // mirror: api/cancel-order O1
  it("cancels a paid order of the last 24 hours", async () => {
    const app = await buildApp();
    await seedOrder(app, { id: "o1", status: "paid", createdAt: hoursAgo(2) });

    const res = await app.inject({ method: "POST", url: "/orders/o1/cancel" });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ id: "o1", status: "cancelled" });
  });

  // mirror: api/cancel-order AC2
  // mirror: api/cancel-order C1
  // mirror: api/cancel-order O3
  it.each([
    ["is not paid", { status: "pending", createdAt: hoursAgo(2) }],
    ["is already cancelled", { status: "cancelled", createdAt: hoursAgo(2) }],
    ["is older than 24 hours", { status: "paid", createdAt: hoursAgo(25) }],
  ])("refuses an order that %s", async (_, order) => {
    const app = await buildApp();
    await seedOrder(app, { id: "o1", ...order });

    const res = await app.inject({ method: "POST", url: "/orders/o1/cancel" });

    expect(res.statusCode).toBe(409);
    expect(res.json()).toEqual({
      error: { code: "conflict", message: "Only a paid order of the last 24 hours can be cancelled." },
    });
  });

  // mirror: api/cancel-order O2
  it("refuses an order that does not exist", async () => {
    const app = await buildApp();

    const res = await app.inject({ method: "POST", url: "/orders/nope/cancel" });

    expect(res.statusCode).toBe(404);
  });

  // mirror: api/cancel-order AC3
  // mirror: api/cancel-order O4
  it("keeps the order paid when the refund fails", async () => {
    const app = await buildApp({ stripe: fakeStripe({ refund: "down" }) });
    await seedOrder(app, { id: "o1", status: "paid", createdAt: hoursAgo(2) });

    const res = await app.inject({ method: "POST", url: "/orders/o1/cancel" });

    expect(res.statusCode).toBe(502);
    expect((await app.orders.get("o1")).status).toBe("paid");
  });

  // mirror: api/cancel-order C2
  it("gives the money back before it cancels the order", async () => {
    const stripe = fakeStripe();
    const app = await buildApp({ stripe });
    await seedOrder(app, { id: "o1", status: "paid", createdAt: hoursAgo(2) });

    await app.inject({ method: "POST", url: "/orders/o1/cancel" });

    expect(stripe.refundedWhileStatus).toBe("paid");
  });

  // mirror: api/cancel-order AC4
  it("sends the items back to the stock one time", async () => {
    const events = spyEvents();
    const app = await buildApp({ events });
    await seedOrder(app, { id: "o1", status: "paid", createdAt: hoursAgo(2) });

    await app.inject({ method: "POST", url: "/orders/o1/cancel" });
    await app.inject({ method: "POST", url: "/orders/o1/cancel" });

    expect(events.published("order.cancelled")).toHaveLength(1);
  });
});
