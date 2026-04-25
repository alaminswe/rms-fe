"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import type { MenuItemDTO } from "@/lib/types";
import { categories } from "@/lib/types";
import { useAdminStore } from "@/lib/store/admin-store";
import { useMenuStore } from "@/lib/store/menu-store";
import { getOrderStats, useOrderStore } from "@/lib/store/order-store";
import { useToastStore } from "@/lib/store/toast-store";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "Food",
  healthScore: "75",
  imageUrl: "",
  tags: "Balanced, Healthy",
  dietaryLabels: "Halal",
  nutritionCalories: "450",
  nutritionProtein: "20",
  nutritionCarbs: "30",
  vegetarian: false,
  vegan: false,
  halal: true,
  glutenFree: false,
  spicy: false
};

export function DashboardClient() {
  const router = useRouter();
  const isAuthenticated = useAdminStore((state) => state.isAuthenticated);
  const logout = useAdminStore((state) => state.logout);
  const menuItems = useMenuStore((state) => state.items);
  const upsertItem = useMenuStore((state) => state.upsertItem);
  const deleteMenuItem = useMenuStore((state) => state.deleteItem);
  const toggleAvailability = useMenuStore((state) => state.toggleAvailability);
  const orders = useOrderStore((state) => state.orders);
  const updateStatus = useOrderStore((state) => state.updateOrderStatus);
  const pushToast = useToastStore((state) => state.pushToast);
  const [hydrated, setHydrated] = useState(false);
  const [period, setPeriod] = useState("Daily");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace("/admin/login");
    }
  }, [hydrated, isAuthenticated, router]);

  const stats = useMemo(() => getOrderStats(orders), [orders]);

  function submitMenuItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    upsertItem({
      id: editingId ?? undefined,
      name: form.name,
      description: form.description,
      price: Number(form.price),
      category: form.category as MenuItemDTO["category"],
      image: form.imageUrl,
      imageUrl: form.imageUrl,
      healthScore: Number(form.healthScore),
      nutritionCalories: Number(form.nutritionCalories),
      nutritionProtein: Number(form.nutritionProtein),
      nutritionCarbs: Number(form.nutritionCarbs),
      tags: form.tags.split(",").map((item) => item.trim()).filter(Boolean),
      dietaryLabels: form.dietaryLabels.split(",").map((item) => item.trim()).filter(Boolean),
      vegetarian: form.vegetarian,
      vegan: form.vegan,
      halal: form.halal,
      glutenFree: form.glutenFree,
      spicy: form.spicy,
      available: true
    });
    setLoading(false);
    setForm(emptyForm);
    setEditingId(null);
    pushToast({
      title: editingId ? "Menu item updated" : "Menu item added",
      description: "The frontend menu state has been refreshed locally.",
      tone: "success"
    });
  }

  function handleLogout() {
    logout();
    pushToast({
      title: "Logged out successfully",
      description: "Admin access has been closed on this device.",
      tone: "info"
    });
    router.push("/admin/login");
  }

  function startEdit(item: MenuItemDTO) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description,
      price: String(item.price),
      category: item.category,
      healthScore: String(item.healthScore),
      imageUrl: item.imageUrl,
      tags: item.tags.join(", "),
      dietaryLabels: item.dietaryLabels.join(", "),
      nutritionCalories: String(item.nutritionCalories),
      nutritionProtein: String(item.nutritionProtein),
      nutritionCarbs: String(item.nutritionCarbs),
      vegetarian: item.vegetarian,
      vegan: item.vegan,
      halal: item.halal,
      glutenFree: item.glutenFree,
      spicy: item.spicy
    });
  }

  if (!hydrated || !isAuthenticated) {
    return (
      <div className="space-y-8">
        <Card className="h-28 animate-pulse bg-orange-100/70"></Card>
        <Card className="h-[680px] animate-pulse bg-orange-100/70"></Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="hero-wave overflow-hidden bg-white px-6 py-8 sm:px-8">
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#ff7a1a]">Admin Dashboard</p>
            <h1 className="font-display mt-3 text-5xl font-bold leading-[0.98] text-[#23233f]">
              Restaurant operations at a glance
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500">
              Manage menu publishing, live order transitions, and mock reports from one editorial control room.
            </p>
          </div>
          <Button
            variant="secondary"
            className="bg-white"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["Total Orders", String(stats.totalOrders)],
          ["Revenue", formatCurrency(stats.revenue)],
          ["Active Orders", String(stats.activeOrders)],
          ["Cancelled", String(stats.cancelled)]
        ].map(([label, value], index) => (
          <Card key={label} className={`p-6 ${index === 0 ? "section-pattern text-white" : "bg-white"}`}>
            <div className={index === 0 ? "relative z-10" : undefined}>
              <p className={`text-sm ${index === 0 ? "text-orange-50" : "text-slate-500"}`}>{label}</p>
              <h2 className={`mt-3 text-4xl font-extrabold ${index === 0 ? "text-white" : "text-[#23233f]"}`}>
                {value}
              </h2>
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="bg-white p-6 sm:p-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#ff7a1a]">Menu Management</p>
              <h3 className="font-display mt-2 text-4xl font-bold text-[#23233f]">Create or update dishes</h3>
              <p className="mt-2 text-sm text-slate-500">Add, update, and control item availability.</p>
            </div>
            {editingId ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                Cancel Edit
              </Button>
            ) : null}
          </div>

          <form className="grid gap-4 md:grid-cols-2" onSubmit={submitMenuItem}>
            <Input
              placeholder="Item name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
            <Input
              placeholder="Image URL"
              value={form.imageUrl}
              onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))}
              required
            />
            <Input
              placeholder="Price"
              value={form.price}
              onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
              required
            />
            <Select
              value={form.category}
              onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
            <Input
              placeholder="Health score"
              value={form.healthScore}
              onChange={(event) => setForm((current) => ({ ...current, healthScore: event.target.value }))}
            />
            <Input
              placeholder="Tags (comma separated)"
              value={form.tags}
              onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
            />
            <Input
              placeholder="Dietary labels"
              value={form.dietaryLabels}
              onChange={(event) =>
                setForm((current) => ({ ...current, dietaryLabels: event.target.value }))
              }
            />
            <div className="grid grid-cols-3 gap-3">
              <Input
                placeholder="Calories"
                value={form.nutritionCalories}
                onChange={(event) =>
                  setForm((current) => ({ ...current, nutritionCalories: event.target.value }))
                }
              />
              <Input
                placeholder="Protein"
                value={form.nutritionProtein}
                onChange={(event) =>
                  setForm((current) => ({ ...current, nutritionProtein: event.target.value }))
                }
              />
              <Input
                placeholder="Carbs"
                value={form.nutritionCarbs}
                onChange={(event) =>
                  setForm((current) => ({ ...current, nutritionCarbs: event.target.value }))
                }
              />
            </div>
            <div className="md:col-span-2">
              <Textarea
                placeholder="Description"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                required
              />
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-slate-600 md:col-span-2">
              {[
                ["vegetarian", "Vegetarian"],
                ["vegan", "Vegan"],
                ["halal", "Halal"],
                ["glutenFree", "Gluten-Free"],
                ["spicy", "Spicy"]
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 rounded-full bg-[#fff4e8] px-4 py-2">
                  <input
                    type="checkbox"
                    checked={Boolean(form[key as keyof typeof form])}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        [key]: event.target.checked
                      }))
                    }
                  />
                  {label}
                </label>
              ))}
            </div>
            <Button className="md:col-span-2" disabled={loading}>
              {loading ? "Saving..." : editingId ? "Update Item" : "Add Item"}
            </Button>
          </form>

          <div className="mt-8 overflow-hidden rounded-[32px] border border-orange-100">
            <table className="min-w-full divide-y divide-orange-100 text-sm">
              <thead className="bg-[#fff6ee]">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left">Availability</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-100 bg-white">
                {menuItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 font-medium text-slate-800">{item.name}</td>
                    <td className="px-4 py-3 text-slate-500">{item.category}</td>
                    <td className="px-4 py-3 text-slate-500">{formatCurrency(item.price)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.available
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                        onClick={() => {
                          toggleAvailability(item.id);
                          pushToast({
                            title: `${item.name} visibility updated`,
                            description: "Menu availability changed in local state.",
                            tone: "info"
                          });
                        }}
                      >
                        {item.available ? "Available" : "Hidden"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          className="px-3 py-2 text-xs"
                          onClick={() => startEdit(item)}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          className="px-3 py-2 text-xs"
                          onClick={() => {
                            deleteMenuItem(item.id);
                            pushToast({
                              title: `${item.name} removed`,
                              description: "The item has been deleted from the frontend menu state.",
                              tone: "warning"
                            });
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-8">
          <Card className="bg-white p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#ff7a1a]">Reports</p>
                <h3 className="font-display mt-2 text-4xl font-bold text-[#23233f]">Performance snapshot</h3>
                <p className="mt-2 text-sm text-slate-500">Revenue and order performance overview.</p>
              </div>
              <Select value={period} onChange={(event) => setPeriod(event.target.value)} className="w-36">
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </Select>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-[28px] bg-[#fff4e8] p-4">
                <p className="text-sm text-slate-500">Orders</p>
                <p className="mt-2 text-2xl font-bold">{stats.totalOrders}</p>
              </div>
              <div className="rounded-[28px] bg-emerald-50 p-4">
                <p className="text-sm text-slate-500">Completed</p>
                <p className="mt-2 text-2xl font-bold">{stats.completed}</p>
              </div>
              <div className="rounded-[28px] bg-rose-50 p-4">
                <p className="text-sm text-slate-500">Cancelled</p>
                <p className="mt-2 text-2xl font-bold">{stats.cancelled}</p>
              </div>
              <div className="rounded-[28px] bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Revenue</p>
                <p className="mt-2 text-2xl font-bold">{formatCurrency(stats.revenue)}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-white p-6 sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#ff7a1a]">Order Dashboard</p>
            <h3 className="font-display mt-2 text-4xl font-bold text-[#23233f]">Kitchen flow</h3>
            <div className="mt-5 space-y-4">
              {stats.orders.map((order) => (
                <div key={order.id} className="rounded-[30px] bg-[#fffaf6] p-5 shadow-soft">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Order ID</p>
                      <p className="font-semibold text-slate-900">{order.id}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Table {order.tableNumber} | {format(new Date(order.createdAt), "PPp")}
                      </p>
                    </div>
                    <Badge
                      className={
                        order.status === "SERVED"
                          ? "bg-emerald-50 text-emerald-700"
                          : order.status === "CANCELLED"
                            ? "bg-rose-50 text-rose-700"
                            : "bg-orange-50 text-orange-700"
                      }
                    >
                      {order.status.replaceAll("_", " ")}
                    </Badge>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {order.items.map((item) => (
                      <Badge key={item.id} className="bg-white text-slate-700">
                        {item.quantity}x {item.name}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-semibold text-slate-900">{formatCurrency(order.total)}</p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        className="px-3 py-2 text-xs"
                        disabled={order.status === "CANCELLED"}
                        onClick={() => {
                          updateStatus(order.id, "IN_KITCHEN");
                          pushToast({
                            title: `Order ${order.id} moved to In Kitchen`,
                            description: "Customers will see this update from local storage.",
                            tone: "info"
                          });
                        }}
                      >
                        In Kitchen
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        className="px-3 py-2 text-xs"
                        disabled={order.status === "CANCELLED"}
                        onClick={() => {
                          updateStatus(order.id, "READY");
                          pushToast({
                            title: `Order ${order.id} is ready`,
                            description: "The tracking page will reflect this update.",
                            tone: "success"
                          });
                        }}
                      >
                        Ready
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        className="px-3 py-2 text-xs"
                        disabled={order.status === "CANCELLED"}
                        onClick={() => {
                          updateStatus(order.id, "SERVED");
                          pushToast({
                            title: `Order ${order.id} served`,
                            description: "This order has reached the final service stage.",
                            tone: "success"
                          });
                        }}
                      >
                        Served
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        className="px-3 py-2 text-xs"
                        disabled={order.status === "SERVED" || order.status === "CANCELLED"}
                        onClick={() => {
                          updateStatus(order.id, "CANCELLED");
                          pushToast({
                            title: `Order ${order.id} cancelled`,
                            description: "The cancellation is now reflected across the frontend flow.",
                            tone: "warning"
                          });
                        }}
                      >
                        Cancelled
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
