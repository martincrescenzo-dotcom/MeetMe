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

type DraftItem = { id: number; name: string; message: string };
type DraftCategory = { id: number; label: string; items: DraftItem[] };

let _uid = 1;
const nextId = () => ++_uid;

function blankCategory(): DraftCategory {
  return {
    id: nextId(),
    label: "",
    items: [{ id: nextId(), name: "", message: "" }],
  };
}

function fromInitial(cats: MeetMeCategory[]): DraftCategory[] {
  return cats.map((c) => ({
    id: nextId(),
    label: c.label,
    items: c.items.map((i) => ({
      id: nextId(),
      name: i.name,
      message: i.message,
    })),
  }));
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
  const [cats, setCats] = useState<DraftCategory[]>(
    initialData && initialData.length > 0
      ? fromInitial(initialData)
      : [blankCategory()]
  );
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);

  const setCatLabel = (id: number, v: string) =>
    setCats((p) => p.map((c) => (c.id === id ? { ...c, label: v } : c)));
  const addCat = () => setCats((p) => [...p, blankCategory()]);
  const removeCat = (id: number) =>
    setCats((p) => p.filter((c) => c.id !== id));
  const addItem = (cid: number) =>
    setCats((p) =>
      p.map((c) =>
        c.id === cid
          ? {
              ...c,
              items: [...c.items, { id: nextId(), name: "", message: "" }],
            }
          : c
      )
    );
  const removeItem = (cid: number, iid: number) =>
    setCats((p) =>
      p.map((c) =>
        c.id === cid
          ? { ...c, items: c.items.filter((i) => i.id !== iid) }
          : c
      )
    );
  const setItemField = (
    cid: number,
    iid: number,
    field: "name" | "message",
    val: string
  ) =>
    setCats((p) =>
      p.map((c) =>
        c.id === cid
          ? {
              ...c,
              items: c.items.map((i) =>
                i.id === iid ? { ...i, [field]: val } : i
              ),
            }
          : c
      )
    );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      data: cats
        .map((c) => ({
          label: c.label.trim(),
          items: c.items
            .map((i) => ({ name: i.name.trim(), message: i.message.trim() }))
            .filter((i) => i.name && i.message),
        }))
        .filter((c) => c.label && c.items.length > 0),
    };

    try {
      const url = mode === "create" ? "/api/meetme" : `/api/meetme/${token}`;
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
    } catch {
      setResult({ error: "Network error." });
    } finally {
      setSubmitting(false);
    }
  }

  if (result && !result.error) {
    return <DonePanel mode={mode} result={result} />;
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1 className="m-0 mb-10 text-[24px] font-normal leading-[1.2] tracking-[-0.01em] text-ink">
        {mode === "create" ? "Create a MeetMe" : "Edit your MeetMe"}
      </h1>

      <SectionLabel className="mb-5">Identity</SectionLabel>

      <div>
        <FieldLabel>Your name</FieldLabel>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Martin"
          required
          className="mm-input text-[17px]"
        />
      </div>

      <div className="mt-6">
        <FieldLabel>Your WhatsApp number</FieldLabel>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+44 7911 000000"
          required
          className="mm-input text-[17px]"
        />
        <p className="m-0 mt-1.5 text-[11px] leading-[1.5] text-muted">
          This is where people will message you
        </p>
      </div>

      <SectionLabel className="mt-11">Categories</SectionLabel>

      <div className="flex flex-col">
        {cats.map((cat, ci) => (
          <div
            key={cat.id}
            className="mt-7 border-t border-divider pt-5"
          >
            <div className="flex items-end gap-3">
              <input
                type="text"
                value={cat.label}
                onChange={(e) => setCatLabel(cat.id, e.target.value)}
                placeholder={`Category ${ci + 1}`}
                className="mm-input flex-1 text-[13px] font-bold uppercase tracking-[0.12em]"
              />
              {cats.length > 1 && (
                <GhostBtn
                  onClick={() => removeCat(cat.id)}
                  className="pb-[9px]"
                >
                  remove
                </GhostBtn>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-5">
              {cat.items.map((item) => (
                <div key={item.id}>
                  <div className="flex items-end gap-2">
                    <span className="shrink-0 pb-[9px] font-mono text-[16px] text-muted">
                      ·
                    </span>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) =>
                        setItemField(cat.id, item.id, "name", e.target.value)
                      }
                      placeholder="Item name"
                      className="mm-input flex-1 text-[16px]"
                    />
                    {cat.items.length > 1 && (
                      <GhostBtn
                        onClick={() => removeItem(cat.id, item.id)}
                        className="pb-[9px] text-[15px]"
                      >
                        ×
                      </GhostBtn>
                    )}
                  </div>
                  <div className="mt-2 pl-6">
                    <label className="mb-1 block text-[9px] font-bold uppercase tracking-[0.16em] text-muted">
                      WhatsApp message
                    </label>
                    <textarea
                      value={item.message}
                      onChange={(e) =>
                        setItemField(
                          cat.id,
                          item.id,
                          "message",
                          e.target.value
                        )
                      }
                      placeholder="Pre-filled message when tapped..."
                      rows={2}
                      className="mm-input text-[13px]"
                    />
                  </div>
                </div>
              ))}
            </div>

            <GhostBtn
              onClick={() => addItem(cat.id)}
              className="mt-[14px] block"
            >
              + add item
            </GhostBtn>
          </div>
        ))}
      </div>

      <GhostBtn onClick={addCat} className="mt-5 block">
        + add category
      </GhostBtn>

      {result?.error && (
        <p className="mt-6 text-[12px] text-red-700">{result.error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-[52px] block w-full bg-ink py-[15px] text-[17px] tracking-[0.04em] text-beige disabled:opacity-50"
      >
        {submitting
          ? "Saving…"
          : mode === "create"
            ? "Create MeetMe"
            : "Save changes"}
      </button>
    </form>
  );
}

function SectionLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`text-[10px] font-bold uppercase tracking-[0.22em] text-muted ${className}`}
    >
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
      {children}
    </label>
  );
}

function GhostBtn({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer border-0 bg-transparent p-0 text-[12px] tracking-[0.02em] text-muted underline underline-offset-2 ${className}`}
    >
      {children}
    </button>
  );
}

function DonePanel({
  mode,
  result,
}: {
  mode: "create" | "edit";
  result: SubmitResult;
}) {
  const [shareOk, setShareOk] = useState(false);
  const [editOk, setEditOk] = useState(false);

  async function copy(text: string, which: "share" | "edit") {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
    } catch {
      // ignore
    }
    if (which === "share") {
      setShareOk(true);
      setTimeout(() => setShareOk(false), 1800);
    } else {
      setEditOk(true);
      setTimeout(() => setEditOk(false), 1800);
    }
  }

  if (mode === "edit") {
    return (
      <div>
        <h1 className="m-0 mb-10 text-[26px] font-normal leading-[1.25] tracking-[-0.01em] text-ink">
          Saved.
        </h1>
        {result.share_url && (
          <div>
            <SectionLabel className="mb-3">Share link</SectionLabel>
            <LinkRow
              url={result.share_url}
              copied={shareOk}
              onCopy={() => copy(result.share_url!, "share")}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h1 className="m-0 mb-[52px] text-[26px] font-normal leading-[1.25] tracking-[-0.01em] text-ink">
        Your MeetMe
        <br />
        is ready.
      </h1>

      {result.share_url && (
        <div className="mb-8">
          <SectionLabel className="mb-3">Share link</SectionLabel>
          <LinkRow
            url={result.share_url}
            copied={shareOk}
            onCopy={() => copy(result.share_url!, "share")}
          />
        </div>
      )}

      {result.edit_url && (
        <div>
          <SectionLabel className="mb-3">Edit link</SectionLabel>
          <LinkRow
            url={result.edit_url}
            copied={editOk}
            onCopy={() => copy(result.edit_url!, "edit")}
          />
          <p className="m-0 mt-2.5 text-[12px] leading-[1.6] text-muted">
            Save your edit link — you won't be able to recover it.
          </p>
        </div>
      )}
    </div>
  );
}

function LinkRow({
  url,
  copied,
  onCopy,
}: {
  url: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-divider pb-3">
      <span className="break-all text-[15px] text-ink">{url}</span>
      <button
        type="button"
        onClick={onCopy}
        className={`min-w-[36px] cursor-pointer border-0 bg-transparent p-0 text-[12px] underline underline-offset-2 transition-colors ${
          copied ? "text-muted" : "text-ink"
        }`}
      >
        {copied ? "copied" : "copy"}
      </button>
    </div>
  );
}
