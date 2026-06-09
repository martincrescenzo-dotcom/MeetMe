"use client";

import { useState } from "react";
import type { MeetMeCategory } from "@/lib/types";

type SubmitResult = {
  slug?: string;
  share_url?: string;
  edit_url?: string;
  error?: string;
};

type Props = {
  mode: "create" | "edit";
  token?: string;
  initialName?: string;
  initialPhone?: string;
  initialData?: MeetMeCategory[];
};

const WA_MESSAGE_WARN = 300;

function emptyCategory(): MeetMeCategory {
  return { label: "", items: [{ name: "", message: "" }] };
}

export default function MeetMeForm({
  mode,
  token,
  initialName = "",
  initialPhone = "",
  initialData,
}: Props) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [categories, setCategories] = useState<MeetMeCategory[]>(
    initialData && initialData.length > 0 ? initialData : [emptyCategory()]
  );
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);

  function updateCategory(ci: number, patch: Partial<MeetMeCategory>) {
    setCategories((prev) =>
      prev.map((c, i) => (i === ci ? { ...c, ...patch } : c))
    );
  }

  function updateItem(
    ci: number,
    ii: number,
    patch: Partial<{ name: string; message: string }>
  ) {
    setCategories((prev) =>
      prev.map((c, i) =>
        i === ci
          ? {
              ...c,
              items: c.items.map((it, j) =>
                j === ii ? { ...it, ...patch } : it
              ),
            }
          : c
      )
    );
  }

  function addCategory() {
    setCategories((prev) => [...prev, emptyCategory()]);
  }

  function removeCategory(ci: number) {
    setCategories((prev) => prev.filter((_, i) => i !== ci));
  }

  function addItem(ci: number) {
    setCategories((prev) =>
      prev.map((c, i) =>
        i === ci ? { ...c, items: [...c.items, { name: "", message: "" }] } : c
      )
    );
  }

  function removeItem(ci: number, ii: number) {
    setCategories((prev) =>
      prev.map((c, i) =>
        i === ci ? { ...c, items: c.items.filter((_, j) => j !== ii) } : c
      )
    );
  }

  async function copy(text: string) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
      }
    } catch {
      // fall through to legacy path
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand("copy");
    } finally {
      document.body.removeChild(ta);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      data: categories
        .map((c) => ({
          label: c.label.trim(),
          items: c.items
            .map((it) => ({ name: it.name.trim(), message: it.message.trim() }))
            .filter((it) => it.name && it.message),
        }))
        .filter((c) => c.label && c.items.length > 0),
    };

    try {
      const url =
        mode === "create" ? "/api/meetme" : `/api/meetme/${token}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setResult({ error: json.error ?? "Something went wrong." });
      } else {
        setResult(json);
      }
    } catch (err) {
      setResult({ error: "Network error." });
    } finally {
      setSubmitting(false);
    }
  }

  if (result && !result.error) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-xl font-bold">
          {mode === "create" ? "Done." : "Saved."}
        </h1>

        {result.share_url && (
          <div className="flex flex-col gap-2">
            <p className="text-sm uppercase tracking-wide">Share URL</p>
            <a
              href={result.share_url}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all underline"
            >
              {result.share_url}
            </a>
            <button
              type="button"
              onClick={() => copy(result.share_url!)}
              className="self-start border border-ink px-3 py-1 text-sm"
            >
              Copy
            </button>
          </div>
        )}

        {mode === "create" && result.edit_url && (
          <div className="flex flex-col gap-2">
            <p className="text-sm uppercase tracking-wide">Edit URL</p>
            <p className="text-sm text-muted">
              Save this link. It cannot be recovered.
            </p>
            <a
              href={result.edit_url}
              className="break-all underline"
            >
              {result.edit_url}
            </a>
            <button
              type="button"
              onClick={() => copy(result.edit_url!)}
              className="self-start border border-ink px-3 py-1 text-sm"
            >
              Copy
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <h1 className="text-xl font-bold">
        {mode === "create" ? "Create a MeetMe" : "Edit your MeetMe"}
      </h1>

      <label className="flex flex-col gap-1">
        <span className="text-sm uppercase tracking-wide">Name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border border-ink bg-transparent px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm uppercase tracking-wide">Phone (E.164)</span>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+33612345678"
          required
          className="border border-ink bg-transparent px-3 py-2"
        />
      </label>

      <div className="flex flex-col gap-6">
        {categories.map((category, ci) => (
          <div
            key={ci}
            className="flex flex-col gap-3 border border-ink p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <input
                type="text"
                value={category.label}
                onChange={(e) =>
                  updateCategory(ci, { label: e.target.value })
                }
                placeholder="CATEGORY"
                className="flex-1 border-b border-ink bg-transparent py-1 text-sm font-bold uppercase tracking-wide"
              />
              {categories.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCategory(ci)}
                  className="text-sm text-muted underline"
                >
                  remove
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3">
              {category.items.map((item, ii) => {
                const overLimit = item.message.length > WA_MESSAGE_WARN;
                return (
                  <div key={ii} className="flex flex-col gap-1">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) =>
                        updateItem(ci, ii, { name: e.target.value })
                      }
                      placeholder="Topic label"
                      className="border border-ink bg-transparent px-2 py-1 text-sm"
                    />
                    <textarea
                      value={item.message}
                      onChange={(e) =>
                        updateItem(ci, ii, { message: e.target.value })
                      }
                      placeholder="WhatsApp message"
                      rows={2}
                      className="border border-ink bg-transparent px-2 py-1 text-sm"
                    />
                    {overLimit && (
                      <span className="text-xs text-muted">
                        Long messages may be truncated by WhatsApp.
                      </span>
                    )}
                    {category.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(ci, ii)}
                        className="self-start text-xs text-muted underline"
                      >
                        remove item
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => addItem(ci)}
              className="self-start text-sm underline"
            >
              + add item
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addCategory}
          className="self-start underline"
        >
          + add category
        </button>
      </div>

      {result?.error && (
        <p className="text-sm text-red-700">{result.error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="border border-ink bg-ink px-4 py-2 text-beige disabled:opacity-50"
      >
        {submitting ? "Saving…" : mode === "create" ? "Create" : "Save"}
      </button>
    </form>
  );
}
