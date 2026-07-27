import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/components/DateTimeFields";

const STATUS_LABELS: Record<string, string> = {
  pending_deposit: "ממתין למקדמה",
  in_progress: "בעבודה",
  ready: "מוכן",
  delivered: "נמסר",
  cancelled: "בוטל",
};

const STATUS_OPTIONS = Object.entries(STATUS_LABELS);

type OrderRow = {
  id: string;
  description: string;
  delivery_date: string | null;
  start_time: string | null;
  end_time: string | null;
  price: number | null;
  status: string;
  notes: string | null;
  customers: { name: string } | null;
};

export default function OrdersPanel() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [description, setDescription] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, description, delivery_date, start_time, end_time, price, status, notes, customers(name)")
        .order("delivery_date", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data as unknown as OrderRow[];
    },
  });

  const filteredOrders = statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter);

  const updateStatus = async (orderId: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", orderId);
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  };

  const resetForm = () => {
    setCustomerName("");
    setDescription("");
    setDeliveryDate("");
    setStartTime("");
    setEndTime("");
    setPrice("");
    setNotes("");
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!customerName.trim() || !description.trim()) {
      setFormError("צריך למלא שם לקוחה ותיאור");
      return;
    }
    setSaving(true);
    try {
      const trimmedName = customerName.trim();
      const { data: existing, error: findError } = await supabase
        .from("customers")
        .select("id")
        .eq("name", trimmedName)
        .maybeSingle();
      if (findError) throw findError;

      let customerId = existing?.id;
      if (!customerId) {
        const { data: created, error: createError } = await supabase
          .from("customers")
          .insert({ name: trimmedName })
          .select("id")
          .single();
        if (createError) throw createError;
        customerId = created.id;
      }

      const { data: createdOrder, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_id: customerId,
          description: description.trim(),
          delivery_date: deliveryDate || null,
          start_time: deliveryDate && startTime ? startTime : null,
          end_time: deliveryDate && endTime ? endTime : null,
          price: price ? Number(price) : null,
          notes: notes.trim() || null,
        })
        .select("id")
        .single();
      if (orderError) throw orderError;

      if (deliveryDate && createdOrder) {
        supabase.functions
          .invoke("smart-processor", {
            body: {
              orderId: createdOrder.id,
              description: description.trim(),
              deliveryDate,
              startTime: startTime || null,
              endTime: endTime || null,
            },
          })
          .catch(() => {});
      }

      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      resetForm();
      setShowForm(false);
    } catch {
      setFormError("משהו השתבש בשמירה, נסי שוב");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {!showForm && (
        <Button onClick={() => setShowForm(true)}>הזמנה חדשה</Button>
      )}

      {showForm && (
        <Card className="animate-fade-in">
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                placeholder="שם לקוחה"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
              <Input
                placeholder="תיאור ההזמנה"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="flex gap-3">
                <Input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="מחיר"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="flex-1"
                />
              </div>
              {deliveryDate && (
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground shrink-0">עד</span>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="flex-1"
                  />
                </div>
              )}
              <Textarea
                placeholder="הערות (הוראות מיוחדות, אלרגנים וכו')"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[60px]"
              />
              {formError && <p className="text-sm text-destructive">{formError}</p>}
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "שומרת..." : "שמירה"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => { setShowForm(false); resetForm(); }}>
                  ביטול
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {orders.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded-md px-2.5 py-1 text-xs border ${
              statusFilter === "all" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            הכל
          </button>
          {STATUS_OPTIONS.map(([value, label]) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={`rounded-md px-2.5 py-1 text-xs border ${
                statusFilter === value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {isLoading && <p className="text-muted-foreground">טוענת...</p>}

      {!isLoading && orders.length === 0 && (
        <p className="text-muted-foreground">אין עדיין הזמנות.</p>
      )}
      {!isLoading && orders.length > 0 && filteredOrders.length === 0 && (
        <p className="text-muted-foreground">אין הזמנות בסטטוס הזה.</p>
      )}

      <div className="space-y-3">
        {filteredOrders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-4 space-y-2">
              <div className="font-medium">
                {order.customers?.name ?? "לקוחה"} — {order.description}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {order.delivery_date && (
                  <span>מסירה: {formatDateTime(order.delivery_date, order.start_time, order.end_time)}</span>
                )}
                {order.price != null && <span>{order.price} ש"ח</span>}
              </div>
              <select
                value={order.status}
                onChange={(e) => updateStatus(order.id, e.target.value)}
                className="rounded-md bg-accent px-2.5 py-1 text-xs text-accent-foreground border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {STATUS_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              {order.notes && (
                <p className="text-sm text-muted-foreground border-t border-border pt-2 mt-1">{order.notes}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
