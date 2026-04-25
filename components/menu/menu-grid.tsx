"use client";

import { useEffect, useMemo, useState } from "react";
import type { DietaryFilter, MenuCategory, MenuItemDTO } from "@/lib/types";
import { categories, dietaryFilters } from "@/lib/types";
import { MenuCard } from "@/components/menu/menu-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useMenuStore } from "@/lib/store/menu-store";

const categoryMeta: Record<MenuCategory, { marker: string; copy: string }> = {
  Food: { marker: "FD", copy: "Chef-curated plates for every craving." },
  Drinks: { marker: "DR", copy: "Coolers, mocktails, and sparkling pours." },
  Desserts: { marker: "DS", copy: "Sweet finishes for the perfect table." }
};

export function MenuGrid({ items }: { items: MenuItemDTO[] }) {
  const storedItems = useMenuStore((state) => state.items);
  const resetMenu = useMenuStore((state) => state.resetMenu);
  const [hydrated, setHydrated] = useState(false);
  const [activeCategory, setActiveCategory] = useState<MenuCategory>("Food");
  const [activeFilters, setActiveFilters] = useState<DietaryFilter[]>([]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const hasAllCategories = categories.every((category) =>
      storedItems.some((item) => item.category === category)
    );

    if (!storedItems.length || !hasAllCategories) {
      resetMenu();
    }
  }, [hydrated, resetMenu, storedItems]);

  const sourceItems = hydrated ? storedItems : items;

  const filteredItems = useMemo(() => {
    return sourceItems.filter((item) => {
      if (item.category !== activeCategory) return false;

      return activeFilters.every((filter) => {
        if (filter === "Vegetarian") return item.vegetarian;
        if (filter === "Vegan") return item.vegan;
        if (filter === "Halal") return item.halal;
        if (filter === "Gluten-Free") return item.glutenFree;
        if (filter === "Spicy") return item.spicy;
        return true;
      });
    });
  }, [activeCategory, activeFilters, sourceItems]);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="rounded-[32px] bg-white p-6 shadow-soft">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#fff2e6] text-lg font-extrabold text-[#ff7a1a]">
              {categoryMeta[activeCategory].marker}
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#ff7a1a]">Category Focus</p>
              <h3 className="font-display text-3xl font-bold text-[#23233f]">{activeCategory}</h3>
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-500">{categoryMeta[activeCategory].copy}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {categories.map((category) => (
            <button
              type="button"
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "rounded-full px-5 py-4 text-left shadow-soft transition",
                category === activeCategory
                  ? "bg-gradient-to-r from-[#ff7a1a] to-[#ff9f36] text-white"
                  : "bg-white text-slate-600 hover:bg-[#fff4e8]"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-sm font-extrabold text-[#ff7a1a]">
                  {categoryMeta[category].marker}
                </div>
                <div>
                  <p className="text-base font-extrabold">{category}</p>
                  <p className={cn("text-xs", category === activeCategory ? "text-orange-50" : "text-slate-400")}>
                    {categoryMeta[category].copy}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[32px] bg-white p-5 shadow-soft">
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="bg-[#23233f] text-white">Filter Menu</Badge>
          {dietaryFilters.map((filter) => {
            const active = activeFilters.includes(filter);
            return (
              <button
                type="button"
                key={filter}
                onClick={() =>
                  setActiveFilters((current) =>
                    active ? current.filter((item) => item !== filter) : [...current, filter]
                  )
                }
              >
                <Badge
                  className={
                    active ? "border-none bg-[#ff7a1a] text-white" : "bg-[#fff7f0] text-slate-600"
                  }
                >
                  {filter}
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredItems.map((item) => (
          <MenuCard key={item.id} item={item} />
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <div className="rounded-[32px] border border-dashed border-orange-200 bg-white p-12 text-center text-slate-500 shadow-soft">
          No items match the selected filters.
        </div>
      ) : null}
    </div>
  );
}
