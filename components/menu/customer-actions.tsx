"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BellRing, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartButton } from "@/components/cart/cart-button";
import { useTableStore } from "@/lib/store/table-store";

export function CustomerActions() {
  const joinedTable = useTableStore((state) => state.joinedTable);
  const joinTable = useTableStore((state) => state.joinTable);
  const notifyTable = useTableStore((state) => state.notifyTable);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link href="/track">
        <Button variant="secondary">Track Order</Button>
      </Link>
      <Button
        type="button"
        variant="secondary"
        onClick={() => {
          const nextTable = window.prompt("Enter your table number", joinedTable || "A12");
          if (!nextTable?.trim()) return;
          joinTable(nextTable);
        }}
      >
        <MapPin className="mr-2 h-4 w-4" />
        {hydrated && joinedTable ? `Table ${joinedTable}` : "Join Table"}
      </Button>
      <Button
        type="button"
        variant="secondary"
        className="border-orange-200 bg-white/80 text-slate-700"
        onClick={() => {
          let activeTable = joinedTable;
          if (!activeTable) {
            const nextTable = window.prompt("Join a table first", "A12");
            if (!nextTable?.trim()) return;
            joinTable(nextTable);
            activeTable = nextTable.trim().toUpperCase();
          }
          notifyTable();
          window.alert(`Staff has been notified for table ${activeTable}.`);
        }}
      >
        <BellRing className="mr-2 h-4 w-4" />
        Notify Table
      </Button>
      <CartButton />
    </div>
  );
}
