import ContactForm from "@/components/ContactForm";
import EmailSignup from "@/components/EmailSignup";

export const metadata = {
  title: "Contact — Basira",
  description: "Get in touch with the Basira team.",
};

export default function ContactPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-display font-bold text-text-primary">Contact Us</h1>
        <p className="text-text-muted mt-1">
          Questions, partnership ideas, or data corrections? Send us a message.
        </p>
      </header>

      <ContactForm />

      <div className="mt-10">
        <EmailSignup />
      </div>
    </main>
  );
}