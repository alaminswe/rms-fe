"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CreditCard, Landmark, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/store/cart-store";
import { useOrderStore } from "@/lib/store/order-store";
import { useTableStore } from "@/lib/store/table-store";
import { paymentMethods, type PaymentMethod } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCart((state) => state.items);
  const total = useCart((state) => state.total);
  const clearCart = useCart((state) => state.clearCart);
  const createOrder = useOrderStore((state) => state.createOrder);
  const joinedTable = useTableStore((state) => state.joinedTable);
  const [tableNumber, setTableNumber] = useState(joinedTable);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [cardholderName, setCardholderName] = useState("Alex Carter");
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiryDate, setExpiryDate] = useState("12/28");
  const [cvv, setCvv] = useState("123");
  const [mobileWalletNumber, setMobileWalletNumber] = useState("01700000000");
  const [walletReference, setWalletReference] = useState("TXN12345");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (joinedTable && !tableNumber) {
      setTableNumber(joinedTable);
    }
  }, [joinedTable, tableNumber]);

  async function handleSubmit() {
    setLoading(true);
    setError("");

    if (!items.length) {
      setError("Your cart is empty.");
      setLoading(false);
      return;
    }

    const sanitizedCard = cardNumber.replace(/\D/g, "");
    const sanitizedWalletNumber = mobileWalletNumber.replace(/\D/g, "");

    if (paymentMethod === "CARD") {
      if (!cardholderName.trim()) {
        setError("Enter the cardholder name.");
        setLoading(false);
        return;
      }

      if (sanitizedCard.length !== 16) {
        setError("Enter a valid 16-digit demo card number.");
        setLoading(false);
        return;
      }

      if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
        setError("Enter expiry as MM/YY.");
        setLoading(false);
        return;
      }

      if (cvv.replace(/\D/g, "").length < 3) {
        setError("Enter a valid CVV.");
        setLoading(false);
        return;
      }
    }

    if (paymentMethod === "BKASH" || paymentMethod === "NAGAD" || paymentMethod === "ROCKET") {
      if (sanitizedWalletNumber.length < 11) {
        setError("Enter a valid mobile wallet number.");
        setLoading(false);
        return;
      }

      if (!walletReference.trim()) {
        setError("Enter the demo transaction reference.");
        setLoading(false);
        return;
      }
    }

    try {
      await new Promise((resolve) =>
        window.setTimeout(resolve, paymentMethod === "CASH" ? 500 : 1200)
      );
      const order = createOrder({
        tableNumber,
        items,
        paymentMethod,
        paymentStatus: paymentMethod === "CASH" ? "PAY_ON_TABLE" : "PAID",
        paymentLast4: paymentMethod === "CARD" ? sanitizedCard.slice(-4) : undefined,
        paymentAccount:
          paymentMethod === "BKASH" || paymentMethod === "NAGAD" || paymentMethod === "ROCKET"
            ? sanitizedWalletNumber.slice(-4)
            : undefined
      });
      window.localStorage.setItem("latest-order-id", order.id);
      clearCart();
      router.push(`/order/${order.id}`);
    } catch {
      setError("Unable to place your order.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.25em] text-orange-500">Checkout</p>
          <h1 className="mt-2 text-4xl font-bold text-slate-900">Review and place your order</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-900">Order Summary</h2>
            <div className="mt-5 space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.specialInstructions ?? ""}`}
                  className="flex gap-4 rounded-[28px] border border-orange-100 p-4"
                >
                  <div className="relative h-20 w-20 overflow-hidden rounded-2xl">
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="80px" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="text-sm text-slate-500">Qty {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-slate-900">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                    {item.specialInstructions ? (
                      <p className="mt-2 text-sm text-slate-500">Note: {item.specialInstructions}</p>
                    ) : null}
                  </div>
                </div>
              ))}
              {!items.length ? (
                <div className="rounded-[28px] bg-orange-50 p-8 text-center text-slate-500">
                  Your cart is empty. Return to the menu to add items before checkout.
                </div>
              ) : null}
            </div>
          </Card>

          <Card className="h-fit p-6">
            <h2 className="text-xl font-bold text-slate-900">Table Details</h2>
            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">Table Number</label>
                <Input
                  value={tableNumber}
                  onChange={(event) => setTableNumber(event.target.value)}
                  placeholder="e.g. A12"
                />
              </div>
              <div className="rounded-[28px] bg-orange-50 p-5">
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Subtotal</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-lg font-bold text-slate-900">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
              <div className="rounded-[28px] border border-orange-100 bg-white/80 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Payment Method</h3>
                    <p className="text-sm text-slate-500">Choose cash or a demo online payment option.</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Secure Demo
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {paymentMethods.map((method) => {
                      const active = method === paymentMethod;
                      const icon =
                        method === "CASH" ? (
                          <Landmark className="h-4 w-4" />
                        ) : method === "CARD" ? (
                          <CreditCard className="h-4 w-4" />
                        ) : (
                          <Wallet className="h-4 w-4" />
                        );

                      return (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                            active
                              ? "border-orange-400 bg-orange-50 text-orange-700"
                              : "border-orange-100 bg-white text-slate-600"
                          }`}
                        >
                          {icon}
                          {method === "BKASH" ? "bKash" : method}
                        </button>
                      );
                    })}
                  </div>

                  {paymentMethod === "CASH" ? (
                    <div className="rounded-2xl bg-amber-50 px-4 py-4 text-sm text-amber-800">
                      Cash payment selected. The order will be confirmed now and payment will be collected at the table.
                    </div>
                  ) : null}

                  {paymentMethod === "CARD" ? (
                    <>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-600">Cardholder Name</label>
                    <Input
                      value={cardholderName}
                      onChange={(event) => setCardholderName(event.target.value)}
                      placeholder="Alex Carter"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-600">Card Number</label>
                    <Input
                      value={cardNumber}
                      onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
                      placeholder="4242 4242 4242 4242"
                      inputMode="numeric"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">Expiry</label>
                      <Input
                        value={expiryDate}
                        onChange={(event) => setExpiryDate(formatExpiry(event.target.value))}
                        placeholder="12/28"
                        inputMode="numeric"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-600">CVV</label>
                      <Input
                        value={cvv}
                        onChange={(event) => setCvv(event.target.value.replace(/\D/g, "").slice(0, 4))}
                        placeholder="123"
                        inputMode="numeric"
                        type="password"
                      />
                    </div>
                  </div>
                    </>
                  ) : null}

                  {paymentMethod === "BKASH" || paymentMethod === "NAGAD" || paymentMethod === "ROCKET" ? (
                    <>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-600">
                          {paymentMethod === "BKASH"
                            ? "bKash Number"
                            : paymentMethod === "NAGAD"
                              ? "Nagad Number"
                              : "Rocket Number"}
                        </label>
                        <Input
                          value={mobileWalletNumber}
                          onChange={(event) =>
                            setMobileWalletNumber(event.target.value.replace(/\D/g, "").slice(0, 11))
                          }
                          placeholder="01700000000"
                          inputMode="numeric"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-600">Transaction Reference</label>
                        <Input
                          value={walletReference}
                          onChange={(event) => setWalletReference(event.target.value.toUpperCase())}
                          placeholder="TXN12345"
                        />
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
              {error ? <p className="text-sm text-rose-500">{error}</p> : null}
              <Button
                className="w-full"
                disabled={!items.length || !tableNumber.trim() || loading}
                onClick={handleSubmit}
              >
                {loading
                  ? paymentMethod === "CASH"
                    ? "Confirming Cash Order..."
                    : "Processing Demo Payment..."
                  : paymentMethod === "CASH"
                    ? "Confirm Cash Order"
                    : `Pay ${formatCurrency(total)} And Place Order`}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
