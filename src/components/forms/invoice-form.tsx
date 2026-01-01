"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Plus, 
  Trash2, 
  Save, 
  Send, 
  Receipt, 
  User, 
  Calendar,
  IndianRupee,
  FileText
} from "lucide-react";
import { calculateGst, formatCurrency } from "@/lib/utils/tax-utils";
import { cn } from "@/lib/utils";

const invoiceSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  date: z.string(),
  dueDate: z.string(),
  placeOfSupply: z.number(),
  items: z.array(z.object({
    itemId: z.string().min(1, "Item is required"),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
    taxRate: z.number(),
    taxableValue: z.number(),
    cgst: z.number(),
    sgst: z.number(),
    igst: z.number(),
    total: z.number(),
  })).min(1, "At least one item is required"),
  subtotal: z.number(),
  totalTax: z.number(),
  grandTotal: z.number(),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export function InvoiceForm() {
  const [supplierState] = useState(32); // Kerala
  const [businessDetails] = useState({
    name: "SMS AGRO",
    address: "Parakulam, Kunissery, 680561",
    gstin: "23435sdfdsf234234"
  });

  const [customers, setCustomers] = useState([
    { id: "c1", name: "Reliance Retail", gstin: "27AAAAA0000A1Z5", state: 27 },
    { id: "c2", name: "Tata Motors", gstin: "27BBBBB0000B1Z5", state: 27 },
  ]);

  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "", gstin: "", state: 32 });

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      placeOfSupply: 32,
      items: [{ itemId: "", quantity: 1, unitPrice: 0, taxRate: 18, taxableValue: 0, cgst: 0, sgst: 0, igst: 0, total: 0 }],
      subtotal: 0,
      totalTax: 0,
      grandTotal: 0,
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const watchedItems = watch("items");
  const customerState = watch("placeOfSupply");

  // Recalculate everything when items or customer state changes
  useEffect(() => {
    let subtotal = 0;
    let totalTax = 0;

    watchedItems.forEach((item, index) => {
      const result = calculateGst(
        item.unitPrice, 
        item.quantity, 
        supplierState, 
        customerState, 
        item.taxRate
      );

      // Only update if values are different to avoid infinite loops
      if (item.total !== result.totalAmount) {
        setValue(`items.${index}.taxableValue`, result.taxableValue);
        setValue(`items.${index}.cgst`, result.cgst);
        setValue(`items.${index}.sgst`, result.sgst);
        setValue(`items.${index}.igst`, result.igst);
        setValue(`items.${index}.total`, result.totalAmount);
      }

      subtotal += result.taxableValue;
      totalTax += result.totalTax;
    });

    setValue("subtotal", subtotal);
    setValue("totalTax", totalTax);
    setValue("grandTotal", subtotal + totalTax);
  }, [watchedItems, customerState, supplierState, setValue]);

  const onSubmit = (data: InvoiceFormValues) => {
    console.log("Invoice Data:", data);
    alert("Invoice Draft Saved Successfully!");
  };

  const handleAddCustomer = () => {
    if (!newCustomer.name) return;
    const id = `c${customers.length + 1}`;
    setCustomers([...customers, { ...newCustomer, id }]);
    setValue("customerId", id);
    setValue("placeOfSupply", newCustomer.state);
    setIsAddCustomerOpen(false);
    setNewCustomer({ name: "", gstin: "", state: 32 });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between border-b border-border/40 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{businessDetails.name} • New Invoice</h1>
            <p className="text-sm text-muted-foreground">{businessDetails.address} | GST: {businessDetails.gstin}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </button>
          <button type="submit" className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-xl text-sm font-medium hover:opacity-90 shadow-lg shadow-primary/20 transition-all active:scale-95">
            <Save className="w-4 h-4" />
            Save Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Side: General Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <User className="w-4 h-4" /> Customer Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Customer</label>
                  <button
                    type="button"
                    onClick={() => setIsAddCustomerOpen(true)}
                    className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add New
                  </button>
                </div>
                <select 
                  {...register("customerId")}
                  className="w-full bg-secondary/30 border border-border/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                  onChange={(e) => {
                    const cust = customers.find(c => c.id === e.target.value);
                    if (cust) setValue("placeOfSupply", cust.state);
                    register("customerId").onChange(e);
                  }}
                >
                  <option value="">Select a customer...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} (GST: {c.gstin})</option>
                  ))}
                </select>
                {errors.customerId && <p className="text-[10px] text-red-500 font-medium pl-1">{errors.customerId.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">PLACE OF SUPPLY</label>
                <select 
                  {...register("placeOfSupply", { valueAsNumber: true })}
                  className="w-full bg-secondary/30 border border-border/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value={32}>32 - Kerala (Intra-state)</option>
                  <option value={27}>27 - Maharashtra (Inter-state)</option>
                  <option value={29}>29 - Karnataka (Inter-state)</option>
                  <option value={33}>33 - Tamil Nadu (Inter-state)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-6">
              <Receipt className="w-4 h-4" /> Invoice Items
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4 px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <div className="col-span-5 text-left">Item Description</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right">Total</div>
                <div className="col-span-1"></div>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-4 items-start group">
                  <div className="col-span-5">
                    <input 
                      {...register(`items.${index}.itemId`)}
                      placeholder="Search or add item..."
                      className="w-full bg-secondary/20 border border-border/40 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>
                  <div className="col-span-2">
                    <input 
                      type="number"
                      {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                      className="w-full bg-secondary/20 border border-border/40 rounded-xl px-4 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div className="col-span-2">
                    <input 
                      type="number"
                      {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                      className="w-full bg-secondary/20 border border-border/40 rounded-xl px-4 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div className="col-span-2 py-2 text-sm font-bold text-right">
                    {formatCurrency(watchedItems[index]?.total || 0)}
                  </div>
                  <div className="col-span-1 py-1">
                    <button 
                      type="button" 
                      onClick={() => remove(index)}
                      className="p-2 text-muted-foreground/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              <button 
                type="button" 
                onClick={() => append({ itemId: "", quantity: 1, unitPrice: 0, taxRate: 18, taxableValue: 0, cgst: 0, sgst: 0, igst: 0, total: 0 })}
                className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors py-2 px-2"
              >
                <Plus className="w-4 h-4" /> Add Line Item
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Summary & Meta */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Delivery & Billing
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">INVOICE NUMBER</label>
                <input 
                  {...register("invoiceNumber")}
                  className="w-full bg-secondary/30 border border-border/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="INV-2026-0001"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">DATE</label>
                <input 
                  type="date"
                  {...register("date")}
                  className="w-full bg-secondary/30 border border-border/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">DUE DATE</label>
                <input 
                  type="date"
                  {...register("dueDate")}
                  className="w-full bg-secondary/30 border border-border/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 bg-primary/5 border-primary/10 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <IndianRupee className="w-4 h-4" /> Summary
            </h3>
            <div className="space-y-3 pt-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-foreground">{formatCurrency(watch("subtotal") || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax Total (GST)</span>
                <span className="font-medium text-foreground">{formatCurrency(watch("totalTax") || 0)}</span>
              </div>
              <div className="h-px bg-border/40 my-2"></div>
              <div className="flex justify-between items-end pt-1">
                <span className="text-base font-bold">Grand Total</span>
                <span className="text-2xl font-black gradient-text">
                  {formatCurrency(watch("grandTotal") || 0)}
                </span>
              </div>
            </div>
          </div>
          
          <button type="button" className="w-full flex items-center justify-center gap-3 bg-white text-black py-3 rounded-2xl font-bold hover:bg-white/90 transition-colors shadow-xl">
            <Send className="w-5 h-5" />
            Send via WhatsApp
          </button>
        </div>
      </div>

      {/* Add Customer Modal */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-md p-8 rounded-3xl space-y-6 shadow-2xl border border-white/10 slide-in-from-bottom-8">
            <div className="space-y-1">
              <h2 className="text-xl font-bold">Add New Customer</h2>
              <p className="text-sm text-muted-foreground">Enter the customer details below</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Customer Name</label>
                <input
                  className="w-full bg-secondary/30 border border-border/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="E.g. Malanad Oil Mills"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">GST Number</label>
                <input
                  className="w-full bg-secondary/30 border border-border/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all uppercase"
                  placeholder="32AAAAA0000A1Z5"
                  value={newCustomer.gstin}
                  onChange={(e) => setNewCustomer({ ...newCustomer, gstin: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">State</label>
                <select
                  className="w-full bg-secondary/30 border border-border/40 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  value={newCustomer.state}
                  onChange={(e) => setNewCustomer({ ...newCustomer, state: parseInt(e.target.value) })}
                >
                  <option value={32}>32 - Kerala</option>
                  <option value={27}>27 - Maharashtra</option>
                  <option value={29}>29 - Karnataka</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsAddCustomerOpen(false)}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-muted-foreground hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCustomer}
                className="flex-1 py-3 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20 transition-all"
              >
                Create Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
