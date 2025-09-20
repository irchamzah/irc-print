// Simpan data di memory (untuk production, gunakan database sesungguhnya)
const orders = new Map();

export function saveOrder(userId, orderData) {
  const orderId = `order-${Date.now()}-${userId}`;
  orders.set(orderId, {
    ...orderData,
    orderId,
    userId,
    createdAt: new Date(),
    status: "pending",
  });
  return orderId;
}

export function getOrder(orderId) {
  return orders.get(orderId);
}

export function updateOrderStatus(orderId, status) {
  const order = orders.get(orderId);
  if (order) {
    order.status = status;
    orders.set(orderId, order);
  }
}

export function getOrdersByStatus(status) {
  const result = [];
  for (const [orderId, order] of orders) {
    if (order.status === status) {
      result.push(order);
    }
  }
  return result;
}
