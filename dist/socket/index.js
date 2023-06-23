"use strict";

module.exports = function (io) {
  io.on("connection", async function (socket) {
    console.log("connection.........................");
  });
};