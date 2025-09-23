import { OnboardingChecklistContent } from "@/app/shared/onboarding-feat/Onboarding-Checklist";
import TicketComponent from "@/app/shared/ticket-feat/pages/TicketComponent";

export default function Home() {
  return (
    <main className="flex gap-6 flex-col">
      <section className="flex w-full justify-between">
        <h1 className="title"> Overview </h1>
      </section>

      {/* <OnboardingChecklistContent emailVerified={true} /> */}

      <TicketComponent />
    </main>
  );
}
