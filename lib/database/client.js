// Simple in-memory storage for development
const orders = new Map();

export function saveOrder(orderData) {
  const orderId = `order_${Date.now()}`;
  orders.set(orderId, { ...orderData, id: orderId });
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
