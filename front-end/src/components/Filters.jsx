import { useId, useState } from "react";

/**
 * Generic, reusable filters row.
 *
 * Usage:
 * <Filters
 *   items={[
 *     { type: "select", id: "language", label: "Language", value, onChange, options: [{value:"All", label:"All"}] },
 *     { type: "text", id: "search", label: "Search", value, onChange },
 *   ]}
 * />
 */
export default function Filters({
  items,
  className = "",
  defaultOpen = false,
  showLabel = "Show filters",
  hideLabel = "Hide filters",
}) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={contentId}
      >
        {open ? hideLabel : showLabel}
      </button>

      {open && (
        <div id={contentId} className={`filters ${className}`.trim()}>
          {items.map((item) => {
            if (item.type === "select") {
              return (
                <label key={item.id}>
                  {item.label}:{" "}
                  <select
                    id={item.id}
                    value={item.value}
                    onChange={(e) => item.onChange(e.target.value, e)}
                  >
                    {item.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label ?? opt.value}
                      </option>
                    ))}
                  </select>
                </label>
              );
            }

            if (item.type === "text") {
              return (
                <label key={item.id} htmlFor={item.id}>
                  {item.label}:
                  <input
                    id={item.id}
                    type="text"
                    value={item.value}
                    onChange={(e) => item.onChange(e.target.value, e)}
                    placeholder={item.placeholder}
                  />
                </label>
              );
            }

            // Unknown type: render nothing (fail safe)
            return null;
          })}
        </div>
      )}
    </div>
  );
}

