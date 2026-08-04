import { useState } from "react";
import { Trash2 } from "lucide-react";
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
  customer_id: string;
  description: string;
  delivery_date: string | null;
  start_time: string | null;
  end_time: string | null;
  price: number | null;
  status: string;
  notes: string | null;
  customers: { name: string } | null;
};

async function findOrCreateCustomerId(name: string) {
  const { data: existing, error: findError } = await supabase
    .from("customers")
    .select("id")
    .eq("name", name)
    .maybeSingle();
  if (findError) throw findError;
  if (existing?.id) return existing.id;

  const { data: created, error: createError } = await supabase
    .from("customers")
    .insert({ name })
    .select("id")
    .single();
  if (createError) throw createError;
  return created.id;
}

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
  const [search, setSearch] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCustomerName, setEditCustomerName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDeliveryDate, setEditDeliveryDate] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, customer_id, description, delivery_date, start_time, end_time, price, status, notes, customers(name)")
        .order("delivery_date", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data as unknown as OrderRow[];
    },
  });

  const searchLower = search.trim().toLowerCase();
  const filteredOrders = orders
    .filter((o) => {
      if (statusFilter !== "all") return o.status === statusFilter;
      if (searchLower) return true;
      return o.status !== "delivered" && o.status !== "cancelled";
    })
    .filter((o) => !searchLower || (o.customers?.name ?? "").toLowerCase().includes(searchLower));

  const updateStatus = async (orderId: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", orderId);
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  };

  const deleteOrder = async (orderId: string) => {
    await supabase.from("orders").delete().eq("id", orderId);
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
      const customerId = await findOrCreateCustomerId(customerName.trim());

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

  const startEdit = (order: OrderRow) => {
    setEditingId(order.id);
    setEditCustomerName(order.customers?.name ?? "");
    setEditDescription(order.description);
    setEditDeliveryDate(order.delivery_date ?? "");
    setEditStartTime(order.start_time ?? "");
    setEditEndTime(order.end_time ?? "");
    setEditPrice(order.price != null ? String(order.price) : "");
    setEditNotes(order.notes ?? "");
    setEditError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (e: React.FormEvent, order: OrderRow) => {
    e.preventDefault();
    setEditError("");
    if (!editCustomerName.trim() || !editDescription.trim()) {
      setEditError("צריך למלא שם לקוחה ותיאור");
      return;
    }
    setSavingEdit(true);
    try {
      const trimmedName = editCustomerName.trim();
      const customerId =
        trimmedName === order.customers?.name ? order.customer_id : await findOrCreateCustomerId(trimmedName);

      const { error } = await supabase
        .from("orders")
        .update({
          customer_id: customerId,
          description: editDescription.trim(),
          delivery_date: editDeliveryDate || null,
          start_time: editDeliveryDate && editStartTime ? editStartTime : null,
          end_time: editDeliveryDate && editEndTime ? editEndTime : null,
          price: editPrice ? Number(editPrice) : null,
          notes: editNotes.trim() || null,
        })
        .eq("id", order.id);
      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      setEditingId(null);
    } catch {
      setEditError("משהו השתבש בשמירה, נסי שוב");
    } finally {
      setSavingEdit(false);
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

      <Input
        placeholder="חיפוש לפי שם לקוחה..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {orders.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded-md px-2.5 py-1 text-xs border ${
              statusFilter === "all" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            פעילות
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
        <p className="text-muted-foreground">אין הזמנות תואמות.</p>
      )}

      <div className="space-y-3">
        {filteredOrders.map((order) => {
          if (editingId === order.id) {
            return (
              <Card key={order.id} className="border-primary">
                <CardContent className="p-4">
                  <form onSubmit={(e) => saveEdit(e, order)} className="space-y-3">
                    <Input
                      placeholder="שם לקוחה"
                      value={editCustomerName}
                      onChange={(e) => setEditCustomerName(e.target.value)}
                      autoFocus
                    />
                    <Input
                      placeholder="תיאור ההזמנה"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                    />
                    <div className="flex gap-3">
                      <Input
                        type="date"
                        value={editDeliveryDate}
                        onChange={(e) => setEditDeliveryDate(e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="מחיר"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    {editDeliveryDate && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={editStartTime}
                          onChange={(e) => setEditStartTime(e.target.value)}
                          className="flex-1"
                        />
                        <span className="text-sm text-muted-foreground shrink-0">עד</span>
                        <Input
                          type="time"
                          value={editEndTime}
                          onChange={(e) => setEditEndTime(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    )}
                    <Textarea
                      placeholder="הערות (הוראות מיוחדות, אלרגנים וכו')"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      className="min-h-[60px]"
                    />
                    {editError && <p className="text-sm text-destructive">{editError}</p>}
                    <div className="flex gap-2">
                      <Button type="submit" disabled={savingEdit}>
                        {savingEdit ? "שומרת..." : "שמירה"}
                      </Button>
                      <Button type="button" variant="ghost" onClick={cancelEdit}>
                        ביטול
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            );
          }

          return (
            <Card key={order.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium">
                    {order.customers?.name ?? "לקוחה"} — {order.description}
                  </div>
                  <div className="flex gap-3 shrink-0">
                    <button
                      onClick={() => startEdit(order)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      עריכה
                    </button>
                    <button
                      onClick={() => deleteOrder(order.id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="מחיקה"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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
          );
        })}
      </div>
    </div>
  );
}
