"use client";

import { useEffect, useMemo, useState } from "react";
import type { DietaryFilter, MenuCategory, MenuItemDTO } from "@/lib/types";
import { categories, dietaryFilters } from "@/lib/types";
import { MenuCard } from "@/components/menu/menu-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useMenuStore } from "@/lib/store/menu-store";

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
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => (
          <button
            type="button"
            key={category}
            onClick={() => setActiveCategory(category)}
            className={cn(
              "rounded-full px-5 py-3 text-sm font-semibold transition",
              category === activeCategory
                ? "bg-slate-900 text-white shadow-soft"
                : "bg-white/80 text-slate-600 hover:bg-orange-50"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
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
              <Badge className={active ? "bg-orange-500 text-white" : "bg-white/90 text-slate-700"}>
                {filter}
              </Badge>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredItems.map((item) => (
          <MenuCard key={item.id} item={item} />
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-orange-200 bg-white/60 p-12 text-center text-slate-500">
          No items match the selected filters.
        </div>
      ) : null}
    </div>
  );
}
