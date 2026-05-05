import type {
  FieldValues,
  Path,
  PathValue,
  SetValueConfig,
  UseFormSetValue,
} from "react-hook-form";

export function setTypedValue<
  TFieldValues extends FieldValues,
  TPath extends Path<TFieldValues>,
>(
  setValue: UseFormSetValue<TFieldValues>,
  path: TPath,
  value: PathValue<TFieldValues, TPath>,
  options?: SetValueConfig,
) {
  setValue(path, value, {
    shouldDirty: true,
    shouldTouch: true,
    shouldValidate: false,
    ...options,
  });
}

export function useTypedSetValue<TFieldValues extends FieldValues>(
  setValue: UseFormSetValue<TFieldValues>,
) {
  return <TPath extends Path<TFieldValues>>(
    path: TPath,
    value: PathValue<TFieldValues, TPath>,
    options?: SetValueConfig,
  ) => setTypedValue(setValue, path, value, options);
}
