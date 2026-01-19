const http = require("http");

exports.search = (userId, prompt) => {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      user_id: userId,
      prompt
    });

    const options = {
      hostname: "127.0.0.1",
      port: 5001,
      path: "/search",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const pythonReq = http.request(options, (pythonRes) => {
      let data = "";

      pythonRes.on("data", chunk => {
        data += chunk;
      });

      pythonRes.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(new Error("Invalid AI response"));
        }
      });
    });

    pythonReq.on("error", () => {
      reject(new Error("AI service unreachable"));
    });

    pythonReq.write(payload);
    pythonReq.end();
  });
};
