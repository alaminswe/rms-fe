"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/lib/store/cart-store";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function CartDrawer() {
  const items = useCart((state) => state.items);
  const isOpen = useCart((state) => state.isOpen);
  const closeCart = useCart((state) => state.closeCart);
  const updateQuantity = useCart((state) => state.updateQuantity);
  const total = useCart((state) => state.total);
  const count = useCart((state) => state.count);

  return (
    <>
      {isOpen ? <div className="fixed inset-0 z-40 bg-slate-900/40" onClick={closeCart} /> : null}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-orange-100 p-2 text-orange-600">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Your Cart</p>
              <p className="text-sm text-slate-500">{count} items ready to order</p>
            </div>
          </div>
          <button type="button" onClick={closeCart} className="rounded-full p-2 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {items.length === 0 ? (
            <div className="rounded-[28px] bg-orange-50 p-8 text-center text-slate-500">
              Your cart is empty. Add something delicious from the menu.
            </div>
          ) : null}

          {items.map((item) => {
            const key = `${item.id}-${item.specialInstructions ?? ""}`;
            return (
              <div key={key} className="flex gap-4 rounded-[28px] border border-orange-100 p-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-2xl">
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="80px" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-800">{item.name}</p>
                      <p className="text-sm text-slate-500">{formatCurrency(item.price)}</p>
                    </div>
                    <p className="font-semibold text-slate-900">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                  {item.specialInstructions ? (
                    <p className="mt-2 text-xs text-slate-500">Note: {item.specialInstructions}</p>
                  ) : null}
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      className="rounded-full bg-orange-50 p-2 text-orange-600"
                      onClick={() => updateQuantity(key, item.quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-6 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      type="button"
                      className="rounded-full bg-orange-50 p-2 text-orange-600"
                      onClick={() => updateQuantity(key, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-slate-100 px-6 py-5">
          <div className="mb-4 flex items-center justify-between text-sm text-slate-500">
            <span>Total</span>
            <span className="text-2xl font-bold text-slate-900">{formatCurrency(total)}</span>
          </div>
          <Link href="/checkout" onClick={closeCart}>
            <Button className="w-full" disabled={!items.length}>
              Go To Checkout
            </Button>
          </Link>
        </div>
      </aside>
    </>
  );
}
