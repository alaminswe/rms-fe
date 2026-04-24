import Link from "next/link";
import { Sparkles } from "lucide-react";
import { sampleMenuItems } from "@/lib/data/menu";
import { getRestaurantName } from "@/lib/utils";
import { MenuGrid } from "@/components/menu/menu-grid";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { CustomerActions } from "@/components/menu/customer-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function MenuPage() {
  const restaurantName = getRestaurantName();

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="glass-panel flex flex-col gap-4 rounded-[32px] border border-white/60 px-6 py-5 shadow-soft lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-orange-500">QR Dining SaaS</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">{restaurantName}</h1>
          </div>
          <CustomerActions />
        </header>

        <section className="relative overflow-hidden rounded-[36px] bg-hero-glow bg-slate-900 px-6 py-10 text-white shadow-soft sm:px-8 lg:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.14),transparent_22%)]" />
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <Badge className="border-none bg-white/15 text-orange-100">
                <Sparkles className="mr-2 h-3.5 w-3.5" /> Fast table-side ordering
              </Badge>
              <h2 className="mt-5 max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
                Delight guests with a polished QR menu and frictionless ordering flow.
              </h2>
              <p className="mt-4 max-w-xl text-base text-orange-50/90 sm:text-lg">
                Explore chef specials, customize every dish, and place table-side orders in seconds.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#menu-list">
                  <Button>Pre-order Now</Button>
                </a>
                <Link href="#menu-list">
                  <Button
                    variant="secondary"
                    className="border-white/20 bg-white/10 text-white hover:bg-white/15"
                  >
                    Explore Menu
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["Avg Prep", "18 min"],
                ["Top Rated", "96%"],
                ["Live Tables", "24"]
              ].map(([label, value]) => (
                <div key={label} className="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur">
                  <p className="text-sm text-orange-100/80">{label}</p>
                  <p className="mt-3 text-3xl font-bold">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="menu-list" className="space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">Curated Menu</p>
              <h2 className="text-3xl font-bold text-slate-900">Choose what fits the table</h2>
            </div>
            <p className="max-w-lg text-sm text-slate-500">
              Browse food, drinks, and desserts with nutrition details, dietary labels, and quick add-to-cart actions.
            </p>
          </div>
          <MenuGrid items={sampleMenuItems} />
        </section>
      </div>

      <CartDrawer />
    </main>
  );
}
