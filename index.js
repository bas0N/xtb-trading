const WebSocket = require("ws");
const fs = require("fs");
const fileStream = fs.createWriteStream("messages.txt", { flags: "a" });

const PRICES_RETRIEVAL_INTERVAL = 5; // seconds
const SECOND_IN_MILLISECONDS = 1000;
const EXECUTE = true;

function repeatWithTimeout(callback, interval, socket) {
  function run() {
    callback(socket);
    setTimeout(run, interval);
  }
  if (EXECUTE) {
    run();
  }
}

const auth = () => {
  const socket = new WebSocket("wss://ws.xtb.com/demo");
  let authorized = false;
  socket.addEventListener("open", () => {
    // Log in to the API
    socket.send(
      JSON.stringify({
        command: "login",
        arguments: {
          userId: "16643938",
          password: "NR$CKy#rdVC9",
        },
      })
    );
  });

  socket.addEventListener("message", ({ data }) => {
    const packet = JSON.parse(data);
    if (packet.status == true && packet.streamSessionId && !authorized) {
      console.log("auth", packet);
      authorized = true;

      repeatWithTimeout(
        triggerPriceDownload,
        PRICES_RETRIEVAL_INTERVAL * SECOND_IN_MILLISECONDS,
        socket
      );
    } else if (packet.status == false) {
      console.log("error", data);
    } else {
      console.log("packet", data);
    }
  });
};

auth();

const triggerPriceDownload = (socket) => {
  const currentTimeStamp = Date.now();
  const pastTimeStamp = currentTimeStamp - 120 * SECOND_IN_MILLISECONDS;
  const object = {
    command: "getCandles",
    symbol: "BITCOIN",
    arguments: {
      info: {
        end: currentTimeStamp,
        period: 1,
        start: pastTimeStamp,
        symbol: "BITCOIN",
        ticks: 120,
      },
    },
  };
  console.log(object);
  socket.send(JSON.stringify(object));
};

// const auth = () => {
//   const socket = new WebSocket("wss://ws.xtb.com/demo");

//   // receive a message from the server

//   let authorized = false;
//   let orderNumber = 0;

//   socket.addEventListener("message", ({ data }) => {
//     const parsed = JSON.parse(data);
//     console.log("Received message:", parsed);
//     if (parsed.status == true && parsed?.returnData?.order) {
//       orderNumber = parsed?.returnData?.order;
//     }
//   });

//   socket.addEventListener("open", () => {
//     // Log in to the API
//     socket.send(
//       JSON.stringify({
//         command: "login",
//         arguments: {
//           userId: "16643938",
//           password: "NR$CKy#rdVC9",
//         },
//       })
//     );
//   });

//   setTimeout(() => {
//     socket.send(
//       JSON.stringify({
//         command: "tradeTransaction",
//         arguments: {
//           tradeTransInfo: {
//             cmd: 0,
//             customComment: "Some text",
//             expiration: 1724251381000,
//             offset: 0,
//             order: 0,
//             price: 20,
//             sl: 0.0,
//             symbol: "BITCOIN",
//             tp: 0.0,
//             type: 0,
//             volume: 0.01,
//           },
//         },
//       })
//     );
//   }, 2000);

//   setTimeout(() => {
//     console.log("orderNumber", orderNumber);
//     socket.send(
//       JSON.stringify({
//         command: "tradeTransactionStatus",
//         arguments: {
//           order: orderNumber,
//         },
//       })
//     );
//   }, 3000);

//   // setTimeout(() => {
//   //   const currentTimeStamp = Date.now();
//   //   //60000 is the number of ms in one minute
//   //   const timeStamp15minBefore = currentTimeStamp - 15 * 60000;
//   //   socket.send(
//   //     JSON.stringify({
//   //       command: "getChartRangeRequest",
//   //       arguments: {
//   //         info: {
//   //           end: currentTimeStamp,
//   //           period: 1,
//   //           start: timeStamp15minBefore,
//   //           symbol: "BITCOIN",
//   //           ticks: 15,
//   //         },
//   //       },
//   //     })
//   //   );
//   // }, 2000);

//   // socket.addEventListener("message", ({ data }) => {
//   //   console.log("Received message:", data);
//   //   // const packet = JSON.parse(data);
//   //   // if (packet.status == true && packet.streamSessionId && !authorized) {
//   //   //   console.log("auth", packet);
//   //   //   authorized = true;
//   //   // } else if (packet.status == false) {
//   //   //   console.log("error", data);
//   //   // }
//   // });

//   // setTimeout(() => {
//   //   socket.addEventListener("message", (data) => {
//   //     console.log("Received message:", data);

//   //     // Write the message to the file, followed by a newline
//   //     try {
//   //       const parsedMessage = JSON.parse(data);
//   //       console.log("Received object:", parsedMessage);

//   //       // Convert the object to a JSON string with indentation for readability
//   //       const jsonString = JSON.stringify(parsedMessage, null, 2);

//   //       // Write the JSON string to the file with a newline for each message
//   //       fileStream.write(jsonString + "\n");
//   //     } catch (error) {
//   //       console.log("Received raw message:", data);

//   //       // If the message is not JSON, write it directly
//   //       fileStream.write(data + "\n");
//   //     }
//   //   });
//   //   const currentTimeStamp = Date.now();
//   //   //60000 is the number of ms in one minute
//   //   const timeStamp15minBefore = currentTimeStamp - 15 * 60000;
//   //   socket.send(
//   //     JSON.stringify({
//   //       command: "getChartRangeRequest",
//   //       arguments: {
//   //         info: {
//   //           end: currentTimeStamp,
//   //           period: 1,
//   //           start: timeStamp15minBefore,
//   //           symbol: "BITCOIN",
//   //           ticks: 15,
//   //         },
//   //       },
//   //     })
//   //   );
//   // }, 2000);
// };
