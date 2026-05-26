"use client";

import { useState } from "react";
import {
  ColumnSchema,
  ColumnRule,
  CleaningConfigCreate,
  ColumnAction,
  MissingStrategy,
  EncodingMethod,
  ScalingMethod,
  OutlierMethod,
} from "@/lib/api/dataset/cleaning";
import {
  ChevronDown,
  ChevronUp,
  Settings2,
  Globe,
  Columns,
  AlertTriangle,
} from "lucide-react";

// ── Option lists ─────────────────────────────────────────────────────────

const ACTIONS: { value: ColumnAction; label: string; desc: string; color: string }[] = [
  { value: "clean",  label: "Clean",  desc: "Impute / encode / scale", color: "border-emerald-500 bg-emerald-500/10 text-emerald-400" },
  { value: "keep",   label: "Keep",   desc: "No transforms",           color: "border-sky-500 bg-sky-500/10 text-sky-400" },
  { value: "drop",   label: "Drop",   desc: "Remove from output",      color: "border-rose-500 bg-rose-500/10 text-rose-400" },
  { value: "target", label: "Target", desc: "ML label — untouched",    color: "border-amber-500 bg-amber-500/10 text-amber-400" },
];

const MISSING: { value: MissingStrategy; label: string }[] = [
  { value: "MEDIAN",    label: "Median" },
  { value: "MEAN",      label: "Mean" },
  { value: "MODE",      label: "Mode" },
  { value: "DROP_ROWS", label: "Drop rows" },
  { value: "CONSTANT",  label: "Constant fill" },
];

const ENCODING: { value: EncodingMethod; label: string }[] = [
  { value: "ONE_HOT", label: "One-Hot" },
  { value: "LABEL",   label: "Label" },
  { value: "ORDINAL", label: "Ordinal" },
  { value: "none",    label: "None" },
];

const SCALING: { value: ScalingMethod; label: string }[] = [
  { value: "STANDARD", label: "Standard" },
  { value: "MIN_MAX",  label: "Min-Max" },
  { value: "ROBUST",   label: "Robust" },
  { value: "none",     label: "None" },
];

const OUTLIER: { value: OutlierMethod; label: string; desc: string }[] = [
  { value: "none",   label: "None",    desc: "No outlier handling" },
  { value: "iqr",    label: "IQR",     desc: "Remove rows outside Q1−1.5×IQR…Q3+1.5×IQR" },
  { value: "zscore", label: "Z-Score", desc: "Remove rows where |z| > 3" },
  { value: "clip",   label: "Clip",    desc: "Clamp values, keep all rows" },
];

// ── Sub-components ────────────────────────────────────────────────────────

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Column Rule Card ──────────────────────────────────────────────────────

interface ColumnRuleCardProps {
  col: ColumnSchema;
  rule: ColumnRule;
  globalConfig: Pick<CleaningConfigCreate, "missing_strategy" | "encoding_method" | "scaling_method">;
  onChange: (rule: ColumnRule) => void;
}

function ColumnRuleCard({ col, rule, globalConfig, onChange }: ColumnRuleCardProps) {
  const [expanded, setExpanded] = useState(false);

  const actionInfo = ACTIONS.find((a) => a.value === rule.action)!;
  const isClean = rule.action === "clean";

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/20 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Column name + dtype */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono font-medium text-sm truncate">{col.name}</span>
            <span className="px-1.5 py-0.5 rounded text-xs bg-muted text-muted-foreground">
              {col.dtype}
            </span>
            {col.null_count > 0 && (
              <span className="px-1.5 py-0.5 rounded text-xs bg-amber-500/10 text-amber-400">
                {col.null_count} nulls
              </span>
            )}
          </div>
        </div>

        {/* Action pills */}
        <div className="flex gap-1.5">
          {ACTIONS.map((a) => (
            <button
              key={a.value}
              onClick={(e) => {
                e.stopPropagation();
                onChange({ ...rule, action: a.value });
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                rule.action === a.value
                  ? a.color
                  : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>

        {/* Expand toggle — only for clean */}
        {isClean ? (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        ) : (
          <div className="w-4" />
        )}
      </div>

      {/* Expanded rules (clean only) */}
      {isClean && expanded && (
        <div className="px-4 pb-4 grid grid-cols-2 gap-3 border-t border-border bg-muted/10">
          <div className="col-span-2 pt-3" />

          <SelectField
            label="Missing strategy"
            value={rule.missing_strategy ?? globalConfig.missing_strategy}
            options={MISSING}
            onChange={(v) => onChange({ ...rule, missing_strategy: v })}
          />

          {rule.missing_strategy === "CONSTANT" && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Fill value
              </label>
              <input
                type="text"
                placeholder="e.g. 0"
                value={rule.fill_value ?? ""}
                onChange={(e) => onChange({ ...rule, fill_value: e.target.value })}
                className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          )}

          {col.dtype === "numeric" && (
            <>
              <SelectField
                label="Outlier method"
                value={rule.outlier_method ?? "none"}
                options={OUTLIER}
                onChange={(v) => onChange({ ...rule, outlier_method: v })}
              />
              <SelectField
                label="Scaling method"
                value={rule.scaling_method ?? globalConfig.scaling_method}
                options={SCALING}
                onChange={(v) => onChange({ ...rule, scaling_method: v })}
              />
            </>
          )}

          {(col.dtype === "categorical" || col.dtype === "text") && (
            <SelectField
              label="Encoding method"
              value={rule.encoding_method ?? globalConfig.encoding_method}
              options={ENCODING}
              onChange={(v) => onChange({ ...rule, encoding_method: v })}
            />
          )}

          {/* Outlier tip */}
          {rule.outlier_method && rule.outlier_method !== "none" && (
            <div className="col-span-2 flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
              <AlertTriangle size={12} className="mt-0.5 shrink-0 text-amber-400" />
              {OUTLIER.find((o) => o.value === rule.outlier_method)?.desc}
              {(rule.outlier_method === "iqr" || rule.outlier_method === "zscore") &&
                " — rows will be removed."}
              {rule.outlier_method === "clip" && " — row count preserved."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────

interface Props {
  schema: { columns: ColumnSchema[] } | null;
  config: CleaningConfigCreate;
  onChange: (config: CleaningConfigCreate) => void;
}

export default function ColumnConfigBuilder({ schema, config, onChange }: Props) {
  if (!schema) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
        Complete Phase 1 first to inspect column schema.
      </div>
    );
  }

  function updateRule(colName: string, rule: ColumnRule) {
    const existing = config.column_rules.filter((r) => r.column !== colName);
    onChange({ ...config, column_rules: [...existing, rule] });
  }

  function getRuleForCol(col: ColumnSchema): ColumnRule {
    return (
      config.column_rules.find((r) => r.column === col.name) ?? {
        column: col.name,
        action: col.suggested_action,
      }
    );
  }

  const MISSING_GLOBAL = [
    { value: "MEDIAN" as MissingStrategy, label: "Median" },
    { value: "MEAN" as MissingStrategy,   label: "Mean" },
    { value: "MODE" as MissingStrategy,   label: "Mode" },
    { value: "DROP_ROWS" as MissingStrategy, label: "Drop rows" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Global fallback */}
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4 text-sm font-semibold">
          <Globe size={15} className="text-primary" />
          Global Fallback Settings
          <span className="ml-1 text-xs text-muted-foreground font-normal">
            Applied to columns with no explicit rule
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SelectField
            label="Missing strategy"
            value={config.missing_strategy}
            options={MISSING_GLOBAL}
            onChange={(v) => onChange({ ...config, missing_strategy: v })}
          />
          <SelectField
            label="Encoding"
            value={config.encoding_method}
            options={ENCODING}
            onChange={(v) => onChange({ ...config, encoding_method: v })}
          />
          <SelectField
            label="Scaling"
            value={config.scaling_method}
            options={SCALING}
            onChange={(v) => onChange({ ...config, scaling_method: v })}
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Remove Duplicates
            </label>
            <button
              onClick={() => onChange({ ...config, remove_duplicates: !config.remove_duplicates })}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                config.remove_duplicates
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground"
              }`}
            >
              <span
                className={`w-8 h-4 rounded-full relative transition-colors ${
                  config.remove_duplicates ? "bg-primary" : "bg-border"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${
                    config.remove_duplicates ? "left-4" : "left-0.5"
                  }`}
                />
              </span>
              {config.remove_duplicates ? "On" : "Off"}
            </button>
          </div>
        </div>
      </div>

      {/* Per-column rules */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold mb-1">
          <Columns size={15} className="text-primary" />
          Per-Column Rules
        </div>
        {schema.columns.map((col) => (
          <ColumnRuleCard
            key={col.name}
            col={col}
            rule={getRuleForCol(col)}
            globalConfig={config}
            onChange={(rule) => updateRule(col.name, rule)}
          />
        ))}
      </div>
    </div>
  );
}