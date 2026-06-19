let io;
const userSockets = new Map();

export const initializeNotificationService = (socketIOInstance) => {
  io = socketIOInstance;

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      userSockets.set(userId, socket.id);
    }

    socket.on('disconnect', () => {
      if (userId) {
        userSockets.delete(userId);
      }
    });
  });
};

export const notifyUser = (userId, eventName, data) => {
  if (!io) {
    return;
  }

  const socketId = userSockets.get(userId);
  if (socketId) {
    io.to(socketId).emit(eventName, data);
  }
};

export const notifyUsers = (userIds, eventName, data) => {
  userIds.forEach((userId) => {
    notifyUser(userId, eventName, data);
  });
};

export const broadcastNotification = (eventName, data) => {
  if (io) {
    io.emit(eventName, data);
  }
};

export const getUserSockets = () => userSockets;
