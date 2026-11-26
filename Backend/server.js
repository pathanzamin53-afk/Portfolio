"use strict";

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const MAX_BODY_BYTES = 16 * 1024;
const SERVICES = new Set([
  "Business Website",
  "Restaurant Website",
  "Landing Page",
  "E-commerce Website",
  "Portfolio Website",
  "Website Maintenance",
  "Other"
]);
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  response.end(JSON.stringify(payload));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    let size = 0;
    let tooLarge = false;

    request.setEncoding("utf8");
    request.on("data", chunk => {
      size += Buffer.byteLength(chunk);
      if (size > MAX_BODY_BYTES) {
        tooLarge = true;
        return;
      }
      body += chunk;
    });
    request.on("end", () => {
      if (tooLarge) {
        reject(Object.assign(new Error("Request body is too large."), { statusCode: 413 }));
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(Object.assign(new Error("Request body must be valid JSON."), { statusCode: 400 }));
      }
    });
    request.on("error", reject);
  });
}

function validateSubmission(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { error: "Please submit a valid contact form." };
  }

  const fields = ["name", "email", "company", "service", "message"];
  if (fields.some(field => typeof input[field] !== "string")) {
    return { error: "Please complete all required contact fields." };
  }

  const submission = {
    name: input.name.trim(),
    email: input.email.trim(),
    company: input.company.trim(),
    service: input.service.trim(),
    message: input.message.trim()
  };

  if (!submission.name || submission.name.length > 120) {
    return { error: "Name is required and must be 120 characters or fewer." };
  }
  if (
    submission.email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submission.email)
  ) {
    return { error: "Please enter a valid email address." };
  }
  if (submission.company.length > 120) {
    return { error: "Company name must be 120 characters or fewer." };
  }
  if (!SERVICES.has(submission.service)) {
    return { error: "Please choose a valid service." };
  }
  if (!submission.message || submission.message.length > 5000) {
    return { error: "Project details are required and must be 5,000 characters or fewer." };
  }

  return { submission };
}

function getStaticFile(requestPath) {
  if (requestPath === "/" || requestPath === "/index.html") {
    return path.join(PROJECT_ROOT, "index.html");
  }
  if (requestPath === "/favicon.png") {
    return path.join(PROJECT_ROOT, "favicon.png");
  }
  if (requestPath.startsWith("/Images/")) {
    const imageName = requestPath.slice("/Images/".length);
    if (!imageName || path.basename(imageName) !== imageName) {
      return null;
    }

    const imagePath = path.resolve(PROJECT_ROOT, "Images", imageName);
    if (!imagePath.startsWith(path.resolve(PROJECT_ROOT, "Images") + path.sep)) {
      return null;
    }
    return imagePath;
  }

  return null;
}

function createServer(options = {}) {
  const whatsappPhone = String(
    options.whatsappPhone || process.env.WHATSAPP_PHONE || "917618639841"
  ).replace(/\D/g, "");

  if (!/^\d{8,15}$/.test(whatsappPhone)) {
    throw new Error("WHATSAPP_PHONE must contain 8 to 15 digits, including country code.");
  }

  return http.createServer(async (request, response) => {
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    response.setHeader("X-Frame-Options", "DENY");

    let requestPath;
    try {
      requestPath = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    } catch {
      sendJson(response, 400, { error: "Invalid request URL." });
      return;
    }

    if (requestPath === "/api/contact") {
      if (request.method !== "POST") {
        response.setHeader("Allow", "POST");
        sendJson(response, 405, { error: "Use POST to submit the contact form." });
        return;
      }

      if (!String(request.headers["content-type"] || "").includes("application/json")) {
        sendJson(response, 415, { error: "Content-Type must be application/json." });
        return;
      }

      try {
        const input = await readJson(request);
        const result = validateSubmission(input);
        if (result.error) {
          sendJson(response, 400, { error: result.error });
          return;
        }

        const { name, email, company, service, message } = result.submission;
        const whatsappMessage = [
          "New website enquiry",
          `Name: ${name}`,
          `Email: ${email}`,
          `Company: ${company || "Not provided"}`,
          `Service: ${service}`,
          "",
          "Project details:",
          message
        ].join("\n");
        const whatsappUrl =
          `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`;

        sendJson(response, 200, { ok: true, whatsappUrl });
      } catch (error) {
        const statusCode = error.statusCode || 500;
        if (statusCode === 500) {
          console.error("Contact form request failed:", error);
        }
        sendJson(response, statusCode, {
          error: statusCode === 500 ? "Unable to prepare your WhatsApp message." : error.message
        });
      }
      return;
    }

    if (!["GET", "HEAD"].includes(request.method)) {
      response.setHeader("Allow", "GET, HEAD");
      sendJson(response, 405, { error: "Method not allowed." });
      return;
    }

    let filePath;
    try {
      filePath = getStaticFile(requestPath);
    } catch {
      filePath = null;
    }
    if (!filePath) {
      sendJson(response, 404, { error: "Not found." });
      return;
    }

    fs.stat(filePath, (statError, stats) => {
      if (statError || !stats.isFile()) {
        sendJson(response, 404, { error: "Not found." });
        return;
      }

      response.writeHead(200, {
        "Content-Type": MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream",
        "Content-Length": stats.size,
        "Cache-Control": filePath.endsWith("index.html") ? "no-cache" : "public, max-age=3600"
      });

      if (request.method === "HEAD") {
        response.end();
        return;
      }

      const stream = fs.createReadStream(filePath);
      stream.on("error", error => {
        console.error("Static file read failed:", error);
        if (!response.headersSent) {
          sendJson(response, 500, { error: "Unable to read requested file." });
        } else {
          response.destroy(error);
        }
      });
      stream.pipe(response);
    });
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be a valid port number.");
  }

  createServer().listen(port, () => {
    console.log(`Portfolio server running at http://localhost:${port}`);
  });
}

module.exports = { createServer, validateSubmission };
