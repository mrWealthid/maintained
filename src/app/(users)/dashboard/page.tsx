import TicketComponent from "@/features/tickets/components/TicketComponent";

export default function Home() {
  return (
    <main className="flex gap-6 flex-col">
      <section className="flex w-full justify-between">
        <h1 className="title"> Overview </h1>
      </section>

      <TicketComponent />
    </main>
  );
}
