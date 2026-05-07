import { PaymentGateway } from "@/components/PaymentGateway";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Payment gateway demo
        </p>
        <h1 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          Secure Pay
        </h1>
      </div>
      <PaymentGateway />
    </main>
  );
}
