"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle } from "lucide-react";

const schema = z.object({
  name: z.string().min(3, "Station name required"),
  address: z.string().min(5, "Address required"),
  city: z.string().min(2, "City required"),
  province: z.string().min(2, "Province required"),
  lat: z.coerce.number().min(5.7).max(10.0, "Invalid Sri Lanka latitude"),
  lng: z.coerce.number().min(79.5).max(82.1, "Invalid Sri Lanka longitude"),
  chargerType: z.enum(["AC", "DC", "AC+DC"]),
  connectors: z.array(z.string()).min(1, "Select at least one connector"),
  speedKw: z.coerce.number().min(1).max(350),
  numberOfPorts: z.coerce.number().min(1),
  costPerKwh: z.coerce.number().optional(),
  is24Hours: z.boolean(),
  open: z.string().optional(),
  close: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  network: z.string().optional(),
  submitterName: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const CONNECTOR_OPTIONS = ["Type 1", "Type 2", "CCS1", "CCS2", "CHAdeMO", "GB/T", "Tesla"];
const PROVINCES = ["Western", "Central", "Southern", "Northern", "Eastern", "North Western", "North Central", "Uva", "Sabaragamuwa"];

export default function SubmitPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { is24Hours: true, chargerType: "AC", connectors: [] },
  });

  const is24Hours = watch("is24Hours");

  function onSubmit(data: FormData) {
    setSubmittedData(data);
    setSubmitted(true);
  }

  if (submitted && submittedData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Thank you!</h2>
          <p className="text-gray-600 text-sm mb-6">
            Your submission has been recorded. Please email the details below to{" "}
            <strong>evchargeslk@gmail.com</strong> so we can verify and add it to the map.
          </p>
          <pre className="text-left text-xs bg-gray-100 rounded-lg p-4 overflow-auto max-h-64 mb-6">
            {JSON.stringify(submittedData, null, 2)}
          </pre>
          <Link href="/" className="inline-block bg-green-500 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-green-600">
            Back to Map
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-600 text-white p-4 flex items-center gap-3">
        <Link href="/" className="hover:bg-green-700 rounded-full p-1">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-bold">Add a Charging Station</h1>
          <p className="text-xs text-green-100">Help grow the Sri Lanka EV map</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto p-4 space-y-6 pb-16">
        <Section title="Station Info">
          <Field label="Station Name *" error={errors.name?.message}>
            <input {...register("name")} placeholder="e.g. LECO EV Station - Colombo Fort" className={inputClass} />
          </Field>
          <Field label="Address *" error={errors.address?.message}>
            <input {...register("address")} placeholder="Street address" className={inputClass} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="City *" error={errors.city?.message}>
              <input {...register("city")} placeholder="e.g. Colombo" className={inputClass} />
            </Field>
            <Field label="Province *" error={errors.province?.message}>
              <select {...register("province")} className={inputClass}>
                <option value="">Select province</option>
                {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
          </div>
        </Section>

        <Section title="Location Coordinates">
          <p className="text-xs text-gray-500 -mt-1">
            Find coordinates: open Google Maps, right-click your location → copy coordinates
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Latitude *" error={errors.lat?.message}>
              <input {...register("lat")} type="number" step="any" placeholder="e.g. 6.9344" className={inputClass} />
            </Field>
            <Field label="Longitude *" error={errors.lng?.message}>
              <input {...register("lng")} type="number" step="any" placeholder="e.g. 79.8428" className={inputClass} />
            </Field>
          </div>
        </Section>

        <Section title="Charger Details">
          <Field label="Charger Type *" error={errors.chargerType?.message}>
            <div className="flex gap-3">
              {(["AC", "DC", "AC+DC"] as const).map((t) => (
                <label key={t} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="radio" {...register("chargerType")} value={t} className="accent-green-500" />
                  {t}
                </label>
              ))}
            </div>
          </Field>
          <Field label="Connectors *" error={errors.connectors?.message}>
            <div className="flex flex-wrap gap-3">
              {CONNECTOR_OPTIONS.map((c) => (
                <label key={c} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="checkbox" {...register("connectors")} value={c} className="accent-green-500" />
                  {c}
                </label>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Speed (kW) *" error={errors.speedKw?.message}>
              <input {...register("speedKw")} type="number" placeholder="e.g. 22" className={inputClass} />
            </Field>
            <Field label="Number of Ports *" error={errors.numberOfPorts?.message}>
              <input {...register("numberOfPorts")} type="number" placeholder="e.g. 2" className={inputClass} />
            </Field>
          </div>
        </Section>

        <Section title="Cost & Hours">
          <Field label="Cost per kWh (LKR)" error={errors.costPerKwh?.message}>
            <input {...register("costPerKwh")} type="number" placeholder="Leave blank if free or unknown" className={inputClass} />
          </Field>
          <Field label="Hours">
            <label className="flex items-center gap-2 text-sm cursor-pointer mb-2">
              <input type="checkbox" {...register("is24Hours")} className="accent-green-500" />
              Open 24 hours
            </label>
            {!is24Hours && (
              <div className="grid grid-cols-2 gap-4">
                <Field label="Opens" error={undefined}>
                  <input {...register("open")} type="time" className={inputClass} />
                </Field>
                <Field label="Closes" error={undefined}>
                  <input {...register("close")} type="time" className={inputClass} />
                </Field>
              </div>
            )}
          </Field>
        </Section>

        <Section title="Contact (optional)">
          <Field label="Network / Operator" error={undefined}>
            <input {...register("network")} placeholder="e.g. LECO EV, Lanka IOC" className={inputClass} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Phone" error={undefined}>
              <input {...register("phone")} placeholder="+94..." className={inputClass} />
            </Field>
            <Field label="Website" error={errors.website?.message}>
              <input {...register("website")} placeholder="https://..." className={inputClass} />
            </Field>
          </div>
          <Field label="Your Name (optional)" error={undefined}>
            <input {...register("submitterName")} placeholder="Or leave blank to submit anonymously" className={inputClass} />
          </Field>
        </Section>

        <button
          type="submit"
          className="w-full bg-green-500 text-white font-semibold py-3 rounded-xl hover:bg-green-600 transition-colors"
        >
          Submit Station
        </button>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
      <h3 className="font-semibold text-gray-800 border-b border-gray-100 pb-2">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400";
