import TicketComponent from "@/app/shared/features/ticket-feat/pages/TicketComponent";

export default function Home() {
  return (
    <main className="flex min-h-screen gap-6 flex-col">
      <section className="flex w-full justify-between">
        <h1 className="title"> Overview </h1>
      </section>
      <TicketComponent />
    </main>
  );
}
