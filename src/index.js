const ws = require("ws");

const NUM_WORKERS = +process.env.NUM_WORKERS || 50;
const NUM_REQUESTS = +process.env.NUM_REQUESTS || 3000;
const SERVER_IP = process.env.SERVER_IP;

const workers = new Array(NUM_WORKERS).fill(0);
const requests = new Array(NUM_REQUESTS).fill(0);

const task = async () => {
  try {
    const wsClient = new ws(`ws://${SERVER_IP}:8080`);
    await new Promise((resolve, reject) => {
      wsClient.on("open", () => {
        resolve();
      });
      wsClient.on("error", (err) => {
        reject(err);
      });
    });
  } catch (err) {
    console.log(err);
  }
};

const getNextTask = () => {
  if (requests.length === 0) return null;
  requests.pop();
  return task;
};

const workerExec = async (worker) => {
  const task = getNextTask();
  const taskNumber = NUM_REQUESTS - requests.length;
  if (task) {
    await task();
    console.log(`Task ${taskNumber} completed`);
    workerExec(worker);
  }
};

const start = async () => {
  workers.forEach((worker) => {
    workerExec(worker);
  });
};

(async () => {
  await start();
})();
