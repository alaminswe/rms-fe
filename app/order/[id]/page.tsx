"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { getLiveOrder, getStoredOrderById, useOrderStore } from "@/lib/store/order-store";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function getPaymentLabel(method: string) {
  if (method === "BKASH") return "bKash";
  if (method === "NAGAD") return "Nagad";
  if (method === "ROCKET") return "Rocket";
  if (method === "CARD") return "Card";
  return "Cash";
}

export default function OrderConfirmationPage() {
  const params = useParams<{ id: string }>();
  const orders = useOrderStore((state) => state.orders);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const order = useMemo(() => {
    if (!hydrated) return null;
    return getLiveOrder(getStoredOrderById(params.id) ?? orders.find((item) => item.id === params.id));
  }, [hydrated, orders, params.id]);

  if (hydrated && !order) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <Card className="max-w-lg p-8 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-orange-500">Order Missing</p>
          <h1 className="mt-3 text-4xl font-bold text-slate-900">We could not find this order</h1>
          <p className="mt-3 text-slate-500">It may have been removed from local storage on this device.</p>
          <Link href="/menu" className="mt-6 inline-block">
            <Button>Back To Menu</Button>
          </Link>
        </Card>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <Card className="h-48 animate-pulse bg-orange-100/70"></Card>
          <Card className="h-80 animate-pulse bg-orange-100/70"></Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <Card className="p-8 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-orange-500">Order Confirmed</p>
          <h1 className="mt-3 text-4xl font-bold text-slate-900">Thank you for your order</h1>
          <p className="mt-3 text-slate-500">
            Your meal is in motion. Keep this page handy while the kitchen prepares everything.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Badge>Order ID {order.id}</Badge>
            {order.paymentMethod === "CASH" ? (
              <Badge className="bg-amber-50 text-amber-700">Cash payment at table</Badge>
            ) : order.paymentMethod === "CARD" ? (
              <Badge className="bg-emerald-50 text-emerald-700">
                Paid with demo card ending in {order.paymentLast4}
              </Badge>
            ) : (
              <Badge className="bg-emerald-50 text-emerald-700">
                Paid via {getPaymentLabel(order.paymentMethod)} ending in {order.paymentAccount}
              </Badge>
            )}
            <Badge className="bg-amber-50 text-amber-700">
              Estimated{" "}
              {new Date(order.estimatedReadyAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
              })}
            </Badge>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Ordered Items</h2>
              <p className="text-sm text-slate-500">
                Table {order.tableNumber} | {getPaymentLabel(order.paymentMethod)} |{" "}
                {order.paymentStatus === "PAY_ON_TABLE" ? "Pay At Table" : "Paid"}
              </p>
            </div>
            <Badge className="bg-orange-50 text-orange-700">{order.status.replaceAll("_", " ")}</Badge>
          </div>

          <div className="mt-5 space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl bg-orange-50/70 px-4 py-4">
                <div>
                  <p className="font-semibold text-slate-900">
                    {item.quantity}x {item.name}
                  </p>
                  {item.specialInstructions ? (
                    <p className="text-sm text-slate-500">Note: {item.specialInstructions}</p>
                  ) : null}
                </div>
                <p className="font-semibold text-slate-900">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-orange-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-lg font-bold text-slate-900">Total {formatCurrency(order.total)}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/menu">
                <Button variant="secondary">Back To Menu</Button>
              </Link>
              <Link href={`/track?orderId=${order.id}`}>
                <Button>Track Order</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
