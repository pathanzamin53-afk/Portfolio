"use strict";

const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const { createServer } = require("./server");

const server = createServer({ whatsappPhone: "917618639841" });
let baseUrl;

before(async () => {
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
  });
});

test("serves the portfolio from the backend server", async () => {
  const response = await fetch(baseUrl);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /text\/html/);
  assert.match(await response.text(), /zamin\.dev/);

  const imageResponse = await fetch(`${baseUrl}/Images/my-image.png`);
  assert.equal(imageResponse.status, 200);
  assert.match(imageResponse.headers.get("content-type"), /image\/png/);
});

test("returns a WhatsApp link containing the submitted enquiry", async () => {
  const response = await fetch(`${baseUrl}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Asha Example",
      email: "asha@example.com",
      company: "",
      service: "Business Website",
      message: "I need a responsive website."
    })
  });
  const result = await response.json();
  const whatsappUrl = new URL(result.whatsappUrl);

  assert.equal(response.status, 200);
  assert.equal(result.ok, true);
  assert.equal(whatsappUrl.hostname, "wa.me");
  assert.equal(whatsappUrl.pathname, "/917618639841");
  assert.match(whatsappUrl.searchParams.get("text"), /asha@example\.com/);
  assert.match(whatsappUrl.searchParams.get("text"), /I need a responsive website\./);
});

test("rejects invalid form data", async () => {
  const response = await fetch(`${baseUrl}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "", email: "not-an-email" })
  });
  const result = await response.json();

  assert.equal(response.status, 400);
  assert.match(result.error, /complete all required/i);
});

test("rejects malformed JSON and oversized submissions", async () => {
  const malformedResponse = await fetch(`${baseUrl}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{"
  });
  assert.equal(malformedResponse.status, 400);

  const oversizedResponse = await fetch(`${baseUrl}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Asha",
      email: "asha@example.com",
      company: "",
      service: "Business Website",
      message: "x".repeat(17 * 1024)
    })
  });
  assert.equal(oversizedResponse.status, 413);
});

test("does not serve backend source files", async () => {
  const response = await fetch(`${baseUrl}/Backend/server.js`);
  assert.equal(response.status, 404);
});
