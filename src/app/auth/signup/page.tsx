"use client";
import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useRegister } from "../hooks/useAuth";
import AuthWrapper from "../AuthWrapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddressSchema } from "@/lib/validation/address";
import AddressField from "@/shared/components/address/AddressField";
import ErrorMessage from "@/shared/components/form-elements/ErrorMessage";
import ButtonComponent from "@/shared/components/form-elements/Button";
import { RegisterPayload } from "../model/model";
import { InternationalPhoneField } from "@/shared/components/phone-number/International-phonefield";
import parsePhoneNumberFromString, { CountryCode } from "libphonenumber-js";
import { CODES, EmailRegex } from "../data/data";

const SignupSchema = z.object({
  // Business
  businessName: z.string().min(3, "This field is required"),
  registrationId: z.string().min(1, "This field is required"),
  businessEmail: z.string().regex(EmailRegex, "Invalid email address"),
  businessContact: z.string().min(1, "This field is required"),
  countryCode: z.enum(CODES, { required_error: "Select a country" }),
  address: AddressSchema, // structured US address

  // Personal
  firstName: z.string().min(1, "This field is required"),
  lastName: z.string().min(1, "This field is required"),
  email: z.string().regex(EmailRegex, "Invalid email address"),
  password: z.string().min(8, "Min 8 characters"),
});

type SignupValues = z.infer<typeof SignupSchema>;

function formatSingleLineAddress(a: z.infer<typeof AddressSchema>) {
  const cityStateZip = [a.city, a.state, a.postalCode]
    .filter(Boolean)
    .join(" ");
  return [a.line1, cityStateZip].filter(Boolean).join(", ");
}

export default function SignupComponent() {
  const form = useForm<SignupValues>({
    resolver: zodResolver(SignupSchema),
    mode: "onChange",
    defaultValues: {
      businessName: "",
      registrationId: "",
      businessEmail: "",
      businessContact: "",
      countryCode: "US",
      address: {
        line1: "",
        line2: "",
        city: "",
        state: "NC",
        postalCode: "",
        country: "United States",
        lat: null,
        lng: null,
        placeId: "",
      },
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const {
    control,
    watch,
    setValue,
    formState: { errors, isValid },
  } = form;

  const { isLoading, registering } = useRegister();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = (data: SignupValues) => {
    const {
      firstName,
      lastName,
      countryCode,
      businessContact,
      address,
      ...rest
    } = data;

    const parsed = parsePhoneNumberFromString(
      businessContact,
      countryCode as CountryCode
    );

    if (!parsed || !parsed.isValid()) {
      // If using RHF:
      // setError("phoneDigits", { type: "manual", message: "Enter a valid phone number" });
      console.error("Invalid phone number");
      return;
    }

    const e164 = parsed.number; // "+13362103489"

    const addressStructured = {
      line1: address.line1,
      line2: address.line2 || "",
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: "United States",
      placeId: address.placeId,
      lat: address.lat ?? null,
      lng: address.lng ?? null,
    };

    const payload: RegisterPayload = {
      name: `${firstName} ${lastName}`,
      ...rest,
      businessContact: e164,
      countryCode: countryCode as CountryCode,
      businessAddress: formatSingleLineAddress(address), // keep single-line string
      country: address.country,
      addressStructured,
      location:
        address.lat != null && address.lng != null
          ? { type: "Point", coordinates: [address.lng, address.lat] }
          : undefined,
    };

    registering(payload);
  };

  function onError(err: any) {
    console.log(err);
  }

  return (
    <AuthWrapper>
      <section className="w-full flex gap-4 flex-col items-center justify-center">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground">
            Join thousands of property professionals
          </p>
        </div>

        <Card className="w-full lg:w-1/2">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold text-center">
              Sign Up
            </CardTitle>
            <CardDescription className="text-center">
              Create your ApartmentHub account to get started
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit, onError)}
                className="w-full flex flex-col gap-4"
              >
                {/* ---------------- Business Details ---------------- */}
                <section className="w-full border rounded-lg p-4">
                  <p className="text-sm mb-4">Business Details</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-4">
                    <FormField
                      control={form.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter Business Name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage>
                            {errors.businessName && (
                              <ErrorMessage
                                errorMsg={errors.businessName.message!}
                              />
                            )}
                          </FormMessage>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="registrationId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Registration Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter Registration No."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage>
                            {errors.registrationId && (
                              <ErrorMessage
                                errorMsg={errors.registrationId.message!}
                              />
                            )}
                          </FormMessage>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="businessEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="business@email.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage>
                            {errors.businessEmail && (
                              <ErrorMessage
                                errorMsg={errors.businessEmail.message!}
                              />
                            )}
                          </FormMessage>
                        </FormItem>
                      )}
                    />
                    {/* 
                    <FormField
                      control={form.control}
                      name="businessContact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="Enter Phone"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage>
                            {errors.businessContact && (
                              <ErrorMessage
                                errorMsg={errors.businessContact.message!}
                              />
                            )}
                          </FormMessage>
                        </FormItem>
                      )}
                    /> */}

                    <InternationalPhoneField
                      name="businessContact" // stores DIGITS ONLY like "3362103489"
                      control={control}
                      label="Mobile"
                      allowedCountries={CODES}
                      defaultCountry={watch("countryCode")}
                      // You can override any country’s placeholder here; others use built-in examples above:
                      placeholderByCountry={{ US: "202-555-0145" }}
                      showFlags
                      enforceDigitHints
                      onCountryChange={(c) => {
                        const allowedCountry = c as
                          | "US"
                          | "CA"
                          | "GB"
                          | "NG"
                          | "DE";
                        setValue("countryCode", allowedCountry, {
                          shouldValidate: true,
                        });
                      }}
                    />
                  </div>

                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground mb-2">
                      Address (US)
                    </p>
                    <AddressField
                      namePrefix="address"
                      proximity={{ lng: -79.792, lat: 36.0726 }} // optional bias
                    />
                  </div>
                </section>

                {/* ---------------- Personal Details ---------------- */}
                <section className="w-full border rounded-lg p-4">
                  <p className="text-sm mb-4">Personal Details</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-4">
                    <FormField
                      control={control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter First Name" {...field} />
                          </FormControl>
                          <FormMessage>
                            {errors.firstName && (
                              <ErrorMessage
                                errorMsg={errors.firstName.message!}
                              />
                            )}
                          </FormMessage>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter Last Name" {...field} />
                          </FormControl>
                          <FormMessage>
                            {errors.lastName && (
                              <ErrorMessage
                                errorMsg={errors.lastName.message!}
                              />
                            )}
                          </FormMessage>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="johndoe@gmail.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage>
                            {errors.email && (
                              <ErrorMessage errorMsg={errors.email.message!} />
                            )}
                          </FormMessage>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter Password"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword((s) => !s)}
                                className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                                aria-label={
                                  showPassword
                                    ? "Hide password"
                                    : "Show password"
                                }
                              >
                                {showPassword ? <FaEye /> : <FaEyeSlash />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage>
                            {errors.password && (
                              <ErrorMessage
                                errorMsg={errors.password.message!}
                              />
                            )}
                          </FormMessage>
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                <ButtonComponent
                  styles="w-full mt-4"
                  btnText="Register"
                  loading={isLoading}
                  type="submit"
                  disabled={!isValid || isLoading}
                />

                <p className="text-sm text-center">
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
                    className=" underline-offset-4 hover:underline"
                  >
                    Login
                  </Link>
                </p>
              </form>
            </Form>
          </CardContent>
        </Card>
      </section>
    </AuthWrapper>
  );
}
