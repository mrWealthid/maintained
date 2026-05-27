"use client";
import React, { FC, useState } from "react";
import { useForm } from "react-hook-form";
import TextInput from "@/shared/components/form-elements/Text-Input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAssignTechnician } from "@/features/tickets/hooks/ticketHooks";
import {
  AssignTechnicianFormControls,
  AssignTechnicianFormProps,
} from "@/features/tickets/models/ticket.model";
import AutoComplete from "@/shared/components/auto-complete/AutoComplete";
import { User } from "@/shared/model/model";
import { fetchTechnicians } from "@/features/tickets/services/ticket-service";

const AssignTechnicianForm: FC<AssignTechnicianFormProps> = ({
  ticket,
  onCloseModal,
}) => {
  const [autoCompleteValue, setAutoCompleteValue] = useState<{
    assignedTo: User;
  } | null>(null);

  const { register, handleSubmit, setValue, formState } =
    useForm<AssignTechnicianFormControls>({
      mode: "all",
    });

  const { errors, isSubmitting, isValid, isDirty } = formState;
  const { isAssigning, handleAssignTechnician } = useAssignTechnician(
    ticket.slug,
    onCloseModal
  );

  async function onSubmit(data: AssignTechnicianFormControls) {
    handleAssignTechnician(data);
  }

  function onError(err: unknown) {
    console.log(err);
  }

  function handleAutoCompleteValues(values: any) {
    setAutoCompleteValue({ ...autoCompleteValue, ...values });
    if (values.assignedTo)
      setValue("assignedTo", values.assignedTo.id, {
        shouldValidate: true,
        shouldDirty: true,
      });
  }

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit(onSubmit, onError)}
        className=" flex flex-1 items-center"
      >
        <section className="flex-col flex gap-2 w-full">
          <div className="w-full flex gap-4">
            <AutoComplete<User>
              queryKey="assignedTo"
              service={fetchTechnicians}
              label={"Technician"}
              optionKey={"id"}
              displayValue={"name"}
              initialValue={ticket?.assignedTo}
              handler={handleAutoCompleteValues}
            />

            <div className="hidden">
              <TextInput
                name={"assignedTo"}
                error={errors?.["assignedTo"]?.message?.toString()}
              >
                <input
                  title="assignedTo"
                  {...register("assignedTo", {
                    required: "This field is required",
                  })}
                  className="input-style"
                  type="text"
                  id="assignedTo"
                />
              </TextInput>
            </div>
          </div>
          <hr className=" my-3" />
          <section className="flex justify-end  gap-4">
            <Button type="button" variant="outline" onClick={() => onCloseModal?.()}>Cancel</Button>

            <Button
              type="submit"
              disabled={!isValid || isSubmitting || !isDirty || isAssigning}
            >
              {isAssigning && <Loader2 className="mr-2 size-4 animate-spin" />}
              Submit
            </Button>
          </section>
        </section>
      </form>
    </div>
  );
};

export default AssignTechnicianForm;
