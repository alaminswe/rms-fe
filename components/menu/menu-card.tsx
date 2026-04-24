"use client";

import Image from "next/image";
import { useState } from "react";
import { Flame, Leaf, ShieldCheck } from "lucide-react";
import type { MenuItemDTO } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useCart } from "@/lib/store/cart-store";

export function MenuCard({ item }: { item: MenuItemDTO }) {
  const addItem = useCart((state) => state.addItem);
  const openCart = useCart((state) => state.openCart);
  const [notes, setNotes] = useState("");

  return (
    <Card className="overflow-hidden">
      <div className="relative h-56">
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 via-transparent to-transparent" />
        <div className="absolute right-4 top-4">
          <Badge className="bg-white/90 text-slate-900">{formatCurrency(item.price)}</Badge>
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
          </div>
          <Badge className="bg-amber-50 text-amber-700">Health {item.healthScore}</Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
          {item.vegetarian ? (
            <Badge className="bg-emerald-50 text-emerald-700">
              <Leaf className="mr-1 h-3.5 w-3.5" /> Vegetarian
            </Badge>
          ) : null}
          {item.halal ? (
            <Badge className="bg-sky-50 text-sky-700">
              <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Halal
            </Badge>
          ) : null}
          {item.spicy ? (
            <Badge className="bg-rose-50 text-rose-700">
              <Flame className="mr-1 h-3.5 w-3.5" /> Spicy
            </Badge>
          ) : null}
        </div>

        <div className="grid grid-cols-3 gap-3 rounded-2xl bg-white/70 p-3 text-sm">
          <div>
            <p className="text-slate-400">Calories</p>
            <p className="font-semibold text-slate-700">{item.nutritionCalories}</p>
          </div>
          <div>
            <p className="text-slate-400">Protein</p>
            <p className="font-semibold text-slate-700">{item.nutritionProtein}g</p>
          </div>
          <div>
            <p className="text-slate-400">Carbs</p>
            <p className="font-semibold text-slate-700">{item.nutritionCarbs}g</p>
          </div>
        </div>

        <input
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Special instructions"
          className="w-full rounded-2xl border border-orange-100 bg-white/80 px-4 py-3 text-sm outline-none focus:border-orange-300"
        />

        <Button
          type="button"
          className="w-full"
          onClick={() => {
            addItem(
              {
                id: item.id,
                name: item.name,
                price: item.price,
                imageUrl: item.imageUrl,
                specialInstructions: notes.trim() || undefined
              },
              1
            );
            setNotes("");
            openCart();
          }}
        >
          Add To Cart
        </Button>
      </div>
    </Card>
  );
}
