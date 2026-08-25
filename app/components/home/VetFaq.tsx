"use client";

import React, { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Is Vet365.AI a replacement for my regular vet?",
    answer:
      "No. Kora is built to give you fast, vet-trained guidance and help you decide your next step - including when to see your own vet or an emergency clinic. It complements in-person care; it doesn't replace exams, diagnostics, or treatment.",
  },
  {
    question: "What happens if it's a real emergency?",
    answer:
      "Kora is trained to recognize red-flag symptoms and will tell you plainly when something needs immediate, in-person care - and can help you find the nearest emergency vet.",
  },
  {
    question: "How is Kora different from searching online?",
    answer:
      "Kora is built and trained by a practicing veterinarian using vet-approved resources, asks follow-up questions like a real consult would, and gives you a specific next step for your pet.",
  },
];

export default function VetFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="section on-light" id="faq" aria-label="Frequently Asked Questions">
      <div className="wrap">
        <div className="section-head center">
          <span className="badge on-light">FAQ</span>
          <h2>Questions, answered.</h2>
        </div>

        <div className="faq-list" role="region" aria-label="FAQ Accordion">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            const contentId = `faq-answer-${index}`;
            const headerId = `faq-header-${index}`;

            return (
              <div key={item.question} className={`faq-item ${isOpen ? "open" : ""}`}>
                <button
                  type="button"
                  id={headerId}
                  className="faq-q"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                >
                  <span>{item.question}</span>
                  <span className="faq-plus" aria-hidden="true">
                    +
                  </span>
                </button>
                <div
                  id={contentId}
                  className="faq-a"
                  role="region"
                  aria-labelledby={headerId}
                  hidden={!isOpen}
                >
                  <p>{item.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
