"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem, OrderDTO, OrderStatus, PaymentMethod, PaymentStatus } from "@/lib/types";

type OrderStore = {
  orders: OrderDTO[];
  createOrder: (input: {
    tableNumber: string;
    items: CartItem[];
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    paymentLast4?: string;
    paymentAccount?: string;
  }) => OrderDTO;
  getOrderById: (id: string) => OrderDTO | undefined;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  cancelOrder: (id: string) => boolean;
};

function fakeOrderId() {
  return `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
}

function estimateStatus(order: OrderDTO): OrderStatus {
  if (order.status === "CANCELLED" || order.status === "SERVED") {
    return order.status;
  }

  const minutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)
  );

  if (minutes >= 18) return "SERVED";
  if (minutes >= 12) return "READY";
  if (minutes >= 5) return "IN_KITCHEN";
  return "ORDER_TAKEN";
}

function syncOrder(order: OrderDTO) {
  return {
    ...order,
    status: estimateStatus(order)
  };
}

export function getLiveOrder(order: OrderDTO | null | undefined) {
  return order ? syncOrder(order) : null;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],
      createOrder: ({
        tableNumber,
        items,
        paymentMethod,
        paymentStatus,
        paymentLast4,
        paymentAccount
      }) => {
        const order: OrderDTO = {
          id: fakeOrderId(),
          tableNumber,
          total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
          status: "ORDER_TAKEN",
          paymentStatus,
          paymentMethod,
          paymentLast4,
          paymentAccount,
          estimatedReadyAt: new Date(Date.now() + 18 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          items: items.map((item, index) => ({
            id: `${item.id}-${index}-${Date.now()}`,
            menuItemId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            specialInstructions: item.specialInstructions ?? null
          }))
        };

        set((state) => ({ orders: [order, ...state.orders] }));
        return order;
      },
      getOrderById: (id) => {
        const order = get().orders.find((item) => item.id === id);
        return order ? syncOrder(order) : undefined;
      },
      updateOrderStatus: (id, status) =>
        set((state) => ({
          orders: state.orders.map((order) => (order.id === id ? { ...order, status } : order))
        })),
      cancelOrder: (id) => {
        const order = get().orders.find((item) => item.id === id);
        if (!order) return false;

        const minutesElapsed = Math.floor(
          (Date.now() - new Date(order.createdAt).getTime()) / 60000
        );

        if (minutesElapsed > 5 || order.status === "SERVED") {
          return false;
        }

        set((state) => ({
          orders: state.orders.map((item) =>
            item.id === id ? { ...item, status: "CANCELLED" } : item
          )
        }));
        return true;
      }
    }),
    {
      name: "restaurant-orders",
      storage: createJSONStorage(() => localStorage)
    }
  )
);

export function getOrderStats(orders: OrderDTO[]) {
  const syncedOrders = orders.map(syncOrder);
  return {
    orders: syncedOrders,
    totalOrders: syncedOrders.length,
    revenue: syncedOrders
      .filter((order) => order.status !== "CANCELLED")
      .reduce((sum, order) => sum + order.total, 0),
    activeOrders: syncedOrders.filter((order) =>
      ["ORDER_TAKEN", "IN_KITCHEN", "READY"].includes(order.status)
    ).length,
    completed: syncedOrders.filter((order) => order.status === "SERVED").length,
    cancelled: syncedOrders.filter((order) => order.status === "CANCELLED").length
  };
}
