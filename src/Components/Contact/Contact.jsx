import React, { useState } from "react";
import mailIcon from "../../assets/mail_icon.svg";
import locationIcon from "../../assets/location_icon.svg";
import callIcon from "../../assets/call_icon.svg";

const Contact = () => {
  const [submitStatus, setSubmitStatus] = useState(null);

  const onSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    formData.append("access_key", "f03b99d4-599d-460a-998d-62046420b9ba");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData)),
      });

      const res = await response.json();
      if (res.success) {
        setSubmitStatus("success");
        event.target.reset();
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      setSubmitStatus("error");
    }
  };

  return (
    <section id="contact" className="bg-black text-gray-100 px-5 py-20 md:px-10 lg:px-24">
      {/* Title */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-100">Get in Touch</h1>
        <p className="mt-3 text-gray-400 max-w-2xl mx-auto">
          I’m open to projects, collaborations, and opportunities in Full-Stack development. Let’s build something amazing together.
        </p>
      </div>

      {/* Container */}
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
        {/* Contact Info */}
        <div className="flex-1 space-y-6">
          <h2 className="text-2xl font-semibold text-gray-100">Let's Connect</h2>
          <p className="text-gray-400">
            I’m excited to collaborate and deliver end-to-end solutions, whether it’s building APIs, integrating backend systems, or crafting seamless user experiences.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <div className="flex items-center gap-4 bg-gray-900 p-4 rounded-xl shadow">
              <img src={mailIcon} alt="Email Icon" className="w-6 h-6" />
              <p className="text-gray-200 break-all">Perpetualokan0@gmail.com</p>
            </div>
            <div className="flex items-center gap-4 bg-gray-900 p-4 rounded-xl shadow">
              <img src={callIcon} alt="Phone Icon" className="w-6 h-6" />
              <p className="text-gray-200">+234-810-355-837</p>
            </div>
            <div className="flex items-center gap-4 bg-gray-900 p-4 rounded-xl shadow">
              <img src={locationIcon} alt="Location Icon" className="w-6 h-6" />
              <p className="text-gray-200">Nigeria</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <form
          onSubmit={onSubmit}
          className="flex-1 flex flex-col gap-4 bg-gray-900 p-6 rounded-2xl shadow-lg"
        >
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            required
            className="bg-gray-800 text-gray-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700"
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            required
            className="bg-gray-800 text-gray-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700"
          />
          <textarea
            name="message"
            rows="6"
            placeholder="Your Message"
            required
            className="bg-gray-800 text-gray-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700 resize-none"
          />

          {submitStatus === "success" && (
            <p className="text-green-400 font-medium">✅ Message sent successfully!</p>
          )}
          {submitStatus === "error" && (
            <p className="text-red-400 font-medium">❌ Failed to send message. Please try again.</p>
          )}

          <button
            type="submit"
            className="mt-2 bg-gray-800 text-gray-200 px-6 py-3 rounded-lg font-semibold shadow hover:bg-gray-700 hover:scale-105 transform transition"
          >
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;
