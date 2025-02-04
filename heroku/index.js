/**
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import express, { json } from "express";
const app = express();
const xhub = require ('express-x-hub');

app.set("port", process.env.PORT || 5000);
app.listen(app.get("port"));

app.use(xhub({ algorithm: "sha1", secret: process.env.APP_SECRET }));
app.use(json());

var token = process.env.TOKEN || "token";
let received_updates = [];

app.get("/", function (req, res) {
  console.log(req);
  res.send("<pre>" + JSON.stringify(received_updates, null, 2) + "</pre>");
});

app.get("/facebook", function (req, res) {
  if (
    req.query["hub.mode"] == "subscribe" &&
    req.query["hub.verify_token"] == token
  ) {
    res.send(req.query["hub.challenge"]);
  } else {
    res.sendStatus(400);
  }
});

app.post("/facebook", function (req, res) {
  console.log("Facebook request body:", req.body);

  if (!req.isXHubValid()) {
    console.log(
      "Warning - request header X-Hub-Signature not present or invalid"
    );
    res.sendStatus(401);
    return;
  }
  console.log("request header X-Hub-Signature validated");
  let body = req.body;

  let messsages = [];

  for (const index in body) {
    if (body[index].entry[0].changes[0].value.messages) {
      // Push to array of messageObjects
      messsages.push(body[index]);
    }
  }

  // Process the Facebook updates here
  received_updates.unshift(messsages);
  res.sendStatus(200);
});

app.listen();
