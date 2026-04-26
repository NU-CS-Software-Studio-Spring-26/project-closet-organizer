import {
  ClothingItemFormValues,
  formatDisplaySize,
  titleize,
} from "../lib/closet";

interface ItemMetadataFieldsProps {
  onChange: (nextValues: ClothingItemFormValues) => void;
  values: ClothingItemFormValues;
}

const sizeOptions = ["xs", "small", "medium", "large", "xl"];
const tagFields: Array<keyof Pick<
  ClothingItemFormValues,
  "brand" | "color" | "material" | "season" | "style"
>> = ["brand", "color", "material", "season", "style"];

export function ItemMetadataFields({ onChange, values }: ItemMetadataFieldsProps) {
  function updateField<K extends keyof ClothingItemFormValues>(
    fieldName: K,
    value: ClothingItemFormValues[K],
  ) {
    onChange({
      ...values,
      [fieldName]: value,
    });
  }

  return (
    <>
      <label className="space-y-2 sm:col-span-2">
        <span>Name</span>
        <input
          value={values.name}
          onChange={(event) => updateField("name", event.target.value)}
          className="w-full border border-border bg-card px-4 py-3"
          required
        />
      </label>

      <label className="space-y-2">
        <span>Size</span>
        <select
          value={values.size}
          onChange={(event) => updateField("size", event.target.value)}
          className="w-full border border-border bg-card px-4 py-3"
        >
          {sizeOptions.map((size) => (
            <option key={size} value={size}>
              {formatDisplaySize(size)}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2">
        <span>Date</span>
        <input
          type="date"
          value={values.date}
          onChange={(event) => updateField("date", event.target.value)}
          className="w-full border border-border bg-card px-4 py-3"
        />
      </label>

      {tagFields.map((fieldName) => (
        <label key={fieldName} className="space-y-2">
          <span>{titleize(fieldName)}</span>
          <input
            value={values[fieldName]}
            onChange={(event) => updateField(fieldName, event.target.value)}
            className="w-full border border-border bg-card px-4 py-3"
          />
        </label>
      ))}
    </>
  );
}
