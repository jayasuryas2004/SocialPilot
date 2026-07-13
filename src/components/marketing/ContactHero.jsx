export default function ContactHero() {
  return (
    <section className="pt-32 pb-16 text-center bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-2xl mx-auto px-6">
        <span className="inline-block bg-purple-100 text-brand-purple text-xs font-bold px-4 py-1.5 rounded-full mb-4">
          Get in touch
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4">
          Let's talk about your <span className="text-brand-purple">social media</span>
        </h1>
        <p className="text-slate-500 text-lg">
          Questions about pricing, a demo, or support — our team replies within one business day.
        </p>
      </div>
    </section>
  );
}