"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CircleDashed, CookingPot, PartyPopper, ReceiptText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { OrderDTO } from "@/lib/types";
import { getLiveOrder, useOrderStore } from "@/lib/store/order-store";

const steps = [
  { key: "ORDER_TAKEN", label: "Order Taken", icon: ReceiptText },
  { key: "IN_KITCHEN", label: "In Kitchen", icon: CookingPot },
  { key: "READY", label: "Ready", icon: CircleDashed },
  { key: "SERVED", label: "Served", icon: PartyPopper }
] as const;

export function TrackClient() {
  const searchParams = useSearchParams();
  const orders = useOrderStore((state) => state.orders);
  const [orderId, setOrderId] = useState(searchParams.get("orderId") ?? "");
  const [searchValue, setSearchValue] = useState(searchParams.get("orderId") ?? "");
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return;

    function poll() {
      const nextOrder = getLiveOrder(orders.find((item) => item.id === orderId));
      if (!nextOrder) {
        setOrder(null);
        setError("Order not found.");
        return;
      }

      setOrder(nextOrder);
      setError("");
    }

    poll();
    const interval = window.setInterval(poll, 5000);
    return () => {
      window.clearInterval(interval);
    };
  }, [orderId, orders]);

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <Card className="p-8">
          <p className="text-sm uppercase tracking-[0.25em] text-orange-500">Live Tracking</p>
          <h1 className="mt-2 text-4xl font-bold text-slate-900">Follow your order in real time</h1>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Enter your order ID"
            />
            <Button onClick={() => setOrderId(searchValue.trim())}>Track</Button>
          </div>
          {error ? <p className="mt-3 text-sm text-rose-500">{error}</p> : null}
        </Card>

        {order ? (
          <Card className="p-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Order {order.id}</h2>
                <p className="text-sm text-slate-500">Table {order.tableNumber}</p>
              </div>
              <p className="text-sm font-semibold text-orange-600">{order.status.replaceAll("_", " ")}</p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-4">
              {steps.map((step, index) => {
                const orderIndex = steps.findIndex((item) => item.key === order.status);
                const active = order.status === "CANCELLED" ? false : index <= orderIndex;
                const Icon = step.icon;

                return (
                  <div
                    key={step.key}
                    className={`rounded-[28px] border p-5 ${
                      active ? "border-orange-200 bg-orange-50" : "border-slate-100 bg-white"
                    }`}
                  >
                    <div
                      className={`inline-flex rounded-2xl p-3 ${
                        active ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 font-semibold text-slate-900">{step.label}</p>
                  </div>
                );
              })}
            </div>
          </Card>
        ) : null}
      </div>
    </main>
  );
}
