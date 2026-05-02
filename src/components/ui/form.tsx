"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import { z } from "zod"
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import ErrorMessage from "@/shared/components/form-elements/ErrorMessage"

type FormSchema = z.ZodTypeAny | null | undefined

const FormSchemaContext = React.createContext<FormSchema>(null)

function Form<
  TFieldValues extends FieldValues,
  TContext = unknown,
  TTransformedValues = TFieldValues,
>({
  schema,
  children,
  ...props
}: React.ComponentProps<
  typeof FormProvider<TFieldValues, TContext, TTransformedValues>
> & {
  schema?: FormSchema
}) {
  return (
    <FormSchemaContext.Provider value={schema}>
      <FormProvider {...props}>{children}</FormProvider>
    </FormSchemaContext.Provider>
  )
}

type FormFieldContextValue = {
  name?: FieldPath<FieldValues>
  rules?: ControllerProps<FieldValues, FieldPath<FieldValues>>["rules"]
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {}
)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider
      value={{
        name: props.name as FieldPath<FieldValues>,
        rules: props.rules as ControllerProps<
          FieldValues,
          FieldPath<FieldValues>
        >["rules"],
      }}
    >
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState } = useFormContext()
  const formState = useFormState({ name: fieldContext?.name })
  const fieldState = fieldContext?.name
    ? getFieldState(fieldContext.name, formState)
    : { error: undefined }

  const { id } = itemContext

  return {
    id,
    name: fieldContext?.name,
    rules: fieldContext?.rules,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn("grid gap-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  )
}

function unwrapSchema(schema: z.ZodTypeAny): z.ZodTypeAny {
  let current = schema

  while (true) {
    if (
      current instanceof z.ZodOptional ||
      current instanceof z.ZodNullable
    ) {
      current = current.unwrap() as z.ZodTypeAny
      continue
    }

    if (current instanceof z.ZodDefault) {
      current = current.removeDefault() as z.ZodTypeAny
      continue
    }

    break
  }

  return current
}

function getSchemaRequiredState(schema: FormSchema, path?: string) {
  if (!schema || !path) {
    return undefined
  }

  const segments = path.split(".")
  let current: z.ZodTypeAny = schema
  let hasOptionalAncestor = current.isOptional?.() ?? false

  for (const segment of segments) {
    current = unwrapSchema(current)

    if (current instanceof z.ZodObject) {
      const next = current.shape[segment] as z.ZodTypeAny | undefined
      if (!next) {
        return undefined
      }

      hasOptionalAncestor ||= next.isOptional?.() ?? false
      current = next
      continue
    }

    if (current instanceof z.ZodArray && /^\d+$/.test(segment)) {
      current = current.element as z.ZodTypeAny
      hasOptionalAncestor ||= current.isOptional?.() ?? false
      continue
    }

    return undefined
  }

  return !hasOptionalAncestor
}

function getRuleRequiredState(
  rules?: ControllerProps<FieldValues, FieldPath<FieldValues>>["rules"],
) {
  const requiredRule = rules?.required

  if (typeof requiredRule === "string") {
    return true
  }

  if (typeof requiredRule === "boolean") {
    return requiredRule
  }

  if (
    requiredRule &&
    typeof requiredRule === "object" &&
    "value" in requiredRule
  ) {
    return Boolean(requiredRule.value)
  }

  return undefined
}

function useFieldRequired(
  name?: string,
  rules?: ControllerProps<FieldValues, FieldPath<FieldValues>>["rules"],
) {
  const schema = React.useContext(FormSchemaContext)

  return (
    getRuleRequiredState(rules) ??
    getSchemaRequiredState(schema, name)
  )
}

function FormLabel({
  className,
  required,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & { required?: boolean }) {
  const schema = React.useContext(FormSchemaContext)
  const { error, formItemId, name, rules } = useFormField()
  const inferredRequired =
    required ??
    getRuleRequiredState(
      rules as ControllerProps<FieldValues, FieldPath<FieldValues>>["rules"],
    ) ??
    getSchemaRequiredState(schema, name)

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={formItemId}
      required={inferredRequired}
      {...props}
    />
  )
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField()

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField()
  const body = error ? <ErrorMessage errorMsg={error.message!} /> : props.children

  if (!body) {
    return null
  }

  return (
    <div
      data-slot="form-message"
      id={formMessageId}
      className={cn("text-destructive text-sm", className)}
      {...props}
    >
      {body}
    </div>
  )
}

export {
  useFormField,
  useFieldRequired,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}
