const { verifyToken } = require('../utils/jwt');

const initializeSocket = (io) => {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = verifyToken(token);
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id}`);

    socket.on('join_store', (storeId) => {
      socket.join(`store_${storeId}`);
      console.log(`User ${socket.user.id} joined store ${storeId}`);
    });

    socket.on('leave_store', (storeId) => {
      socket.leave(`store_${storeId}`);
      console.log(`User ${socket.user.id} left store ${storeId}`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.id}`);
    });
  });

  return {
    emitNewOrder: (storeId, orderData) => {
      io.to(`store_${storeId}`).emit('new_order', orderData);
    },

    emitOrderStatusUpdate: (storeId, orderData) => {
      io.to(`store_${storeId}`).emit('order_status_update', orderData);
    },

    emitProductApproval: (storeId, productData) => {
      io.to(`store_${storeId}`).emit('product_approval', productData);
    },

    emitStoreStatusUpdate: (storeId, storeData) => {
      io.to(`store_${storeId}`).emit('store_status_update', storeData);
    },

    emitNewMessage: (storeId, messageData) => {
      io.to(`store_${storeId}`).emit('new_message', messageData);
    },

    emitInventoryAlert: (storeId, productData) => {
      io.to(`store_${storeId}`).emit('inventory_alert', productData);
    }
  };
};

module.exports = initializeSocket;
