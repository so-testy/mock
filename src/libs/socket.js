import socketIO from 'socket.io';

const users = [];
// const activeUsers = [];
const messages = [];
const roomOpts = { maxWorking: 2, timer: 20 };
const exam = {
  started: false,
  startTime: null,
  studentId: null,
  queue: {
    waiting: [],
    working: [],
    ready: [],
  },
};

export let io;
export const initSocket = (server) => {
  io = socketIO(server);

  io.on('connection', (socket) => {
    console.log(socket.id, 'a user connected');

    // регастрация юзера
    socket.on('createUser', (data) => {
      let user = users.find((u) => u.id == socket.id);

      if (!user) {
        user = { name: socket.id, id: socket.id, type: data.type, status: 'waiting', statusChanged: new Date() };
        users.push(user);
        if (data.type !== 'teacher') exam.queue.waiting.push(user);
        // activeUsers.push(user);
      }

      socket.emit('userData', user);
      io.sockets.emit('users', { users: exam.queue, participants: users });
      io.sockets.emit('examData', exam);

      socket.emit('messages', messages);
    });

    // начинается экзамен
    socket.on('startExam', () => {
      if (!exam.started) {
        exam.started = true;
        exam.startTime = new Date();
      }

      const queueVolume = roomOpts.maxWorking - exam.queue.working.length;
      for (let i = 0; i < queueVolume; i++) {
        const el = exam.queue.waiting.shift();
        el && exam.queue.working.push(el);
      }

      io.sockets.emit('examData', exam);
    });

    // начинается защита
    socket.on('startStudentExam', (data) => {
      exam.studentId = data.id;
      io.sockets.emit('examData', exam);
    });

    // экзамен сдан
    socket.on('examPassed', (data) => {
      const id = exam.queue.ready.findIndex(u => u.id === data.id);
      exam.queue.ready.splice(id, 1);
      exam.studentId = null;
      if (exam.queue.ready.length + exam.queue.waiting.length + exam.queue.working.length === 0) exam.started = false;

      io.sockets.emit('examData', exam);
    });

    // юзер готов к сдаче
    socket.on('userReady', () => {

      const userIndex = exam.queue.working.findIndex((u) => u.id === socket.id);

      if (userIndex !== -1) {
        const user = exam.queue.working[userIndex];

        exam.queue.working.splice(userIndex, 1);
        exam.queue.ready.push(user);
        const queueVolume = roomOpts.maxWorking - exam.queue.working.length;

        for (let i = 0; i < queueVolume; i++) {
          const el = exam.queue.waiting.shift();
          el && exam.queue.working.push(el);
        }

        io.sockets.emit('examData', exam);
      }
    });

    socket.on('message', (message) => {
      messages.push({ ...message, myself: false });
      io.sockets.emit('messages', messages);
    });

    socket.on('disconnect', () => {
      Promise.race([
        new Promise((res, rej) => {
          const userIndex = exam.queue.waiting.findIndex((u) => u.id == socket.id);
          if (userIndex !== -1) {
            exam.queue.waiting.splice(userIndex, 1);
            res();
          }
        }),
        new Promise((res, rej) => {
          const userIndex = exam.queue.working.findIndex((u) => u.id == socket.id);
          if (userIndex !== -1) {
            exam.queue.working.splice(userIndex, 1);
            res();
          }
        }),
        new Promise((res, rej) => {
          const userIndex = exam.queue.ready.findIndex((u) => u.id == socket.id);
          if (userIndex !== -1) {
            exam.queue.ready.splice(userIndex, 1);
            res();
          }
        }),
      ]);

      io.sockets.emit('users', { users: exam.queue, participants: users });

      console.log('A user disconnected');
    });
  });
};
