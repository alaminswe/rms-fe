"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CircleDashed, CookingPot, PartyPopper, ReceiptText, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { OrderDTO } from "@/lib/types";
import {
  canCancelOrder,
  getCancellationTimeRemaining,
  getLiveOrder,
  getStoredOrderById,
  useOrderStore
} from "@/lib/store/order-store";

const steps = [
  { key: "ORDER_TAKEN", label: "Order Taken", icon: ReceiptText },
  { key: "IN_KITCHEN", label: "In Kitchen", icon: CookingPot },
  { key: "READY", label: "Ready", icon: CircleDashed },
  { key: "SERVED", label: "Served", icon: PartyPopper }
] as const;

export function TrackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cancelOrder = useOrderStore((state) => state.cancelOrder);
  const [orderId, setOrderId] = useState(searchParams.get("orderId") ?? "");
  const [searchValue, setSearchValue] = useState(searchParams.get("orderId") ?? "");
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [error, setError] = useState("");
  const [timeRemainingMs, setTimeRemainingMs] = useState(0);

  useEffect(() => {
    if (!orderId) return;

    function poll() {
      const nextOrder = getLiveOrder(getStoredOrderById(orderId));
      if (!nextOrder) {
        setOrder(null);
        setTimeRemainingMs(0);
        setError("Order not found.");
        return;
      }

      setOrder(nextOrder);
      setTimeRemainingMs(getCancellationTimeRemaining(nextOrder));
      setError("");
    }

    poll();
    const interval = window.setInterval(poll, 2000);

    return () => {
      window.clearInterval(interval);
    };
  }, [orderId]);

  const canCancel = canCancelOrder(order);
  const cancellationMinutesLeft = Math.max(1, Math.ceil(timeRemainingMs / 60000));

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <Card className="p-8">
          <Button
            variant="ghost"
            className="mb-6 px-0 text-sm font-semibold text-slate-500 hover:bg-transparent hover:text-orange-600"
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
                return;
              }

              router.push("/menu");
            }}
          >
            Back
          </Button>
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

            {order.status === "CANCELLED" ? (
              <div className="mt-8 rounded-[28px] border border-rose-100 bg-rose-50 p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-rose-500 p-3 text-white">
                    <XCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">This order has been cancelled</p>
                    <p className="text-sm text-slate-500">
                      Status changes are being read directly from local storage every 2 seconds.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-8 grid gap-4 sm:grid-cols-4">
                {steps.map((step, index) => {
                  const orderIndex = steps.findIndex((item) => item.key === order.status);
                  const active = index <= orderIndex;
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
            )}

            <div className="mt-8 flex flex-col gap-3 border-t border-orange-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-500">Tracking refreshes from local storage every 2 seconds.</p>
                {canCancel ? (
                  <p className="mt-1 text-sm text-amber-700">
                    You can still cancel this order for about {cancellationMinutesLeft} minute
                    {cancellationMinutesLeft === 1 ? "" : "s"}.
                  </p>
                ) : null}
              </div>
              {canCancel ? (
                <Button
                  variant="danger"
                  onClick={() => {
                    const cancelled = cancelOrder(order.id);
                    if (cancelled) {
                      setTimeRemainingMs(0);
                      setOrder({ ...order, status: "CANCELLED" });
                    } else {
                      setTimeRemainingMs(0);
                    }
                  }}
                >
                  Cancel Order
                </Button>
              ) : null}
            </div>
          </Card>
        ) : null}
      </div>
    </main>
  );
}
