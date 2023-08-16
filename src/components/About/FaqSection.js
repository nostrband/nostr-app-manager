import React from 'react';

const faqSectionData = [
  {
    id: 1,
    question: 'What is an npub and why is it needed in Nostr?',
    answer:
      'An npub is a unique identifier for a user on the Nostr network. It is generated based on the public key when creating a Nostr wallet and allows unambiguously identifying a user, signing their messages, and verifying authenticity. Each user needs to have their own unique npub to operate on the Nostr network.',
  },
  {
    id: 2,
    question: 'What is a note in Nostr and how is it used?',
    answer:
      'A note in Nostr is a message posted by a user on the network. Notes can contain text, images, links, and other content. They are used to share information and interact between users. Examples of using notes include posts in feeds, private messages, reposts, mentions, etc.',
  },
  {
    id: 3,
    question: 'What is an event (nevent) in Nostr and why is it needed?',
    answer: `Nevent is the event mechanism in Nostr that allows user's to subscribe to updates from other accounts. When a user publishes a note, an nevent is generated that subscribers can react to. This enables propagating information and interacting in the decentralized Nostr network. nevent is the event mechanism in Nostr that allows users to subscribe to updates from other accounts. When a user publishes a note, an nevent is generated that subscribers can react to. This enables propagating information and interacting in the decentralized Nostr network.`,
  },
  {
    id: 4,
    question: 'What is a profile (nprofile) in Nostr and why is it needed?',
    answer: `Nprofile is a user's public profile on the Nostr network. It contains account information like a name, avatar, description, and other data. nprofile allows users to tell about themselves and configure their public image on the network. Profiles make communication in Nostr more personalized.`,
  },
  {
    id: 5,
    question: 'What are addresses (naddr) in Nostr and how to use them?',
    answer:
      'Naddr is a Nostr user s address that can be used to subscribe to their updates. The address has the format naddr://<npub>, where npub is the user identifier. To start following someone, you need to add their naddr to your Nostr wallet. You can also publish your address for others to subscribe to you',
  },
];

const FaqSection = () => {
  return (
    <div className="mt-4 accordion accordion-flush" id="accordionFlushExample">
      <h4>Frequently Asked Questions ?</h4>
      {faqSectionData.map((faqItem) => (
        <div className="accordion-item" key={faqItem.id}>
          <h2 className="accordion-header" id={`flush-heading-${faqItem.id}`}>
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target={`#flush-collapse-${faqItem.id}`}
              aria-expanded="false"
              aria-controls={`flush-collapse-${faqItem.id}`}
              style={{ outline: 'none', boxShadow: 'none' }}
            >
              {faqItem.question}
            </button>
          </h2>
          <div
            id={`flush-collapse-${faqItem.id}`}
            className="accordion-collapse collapse"
            aria-labelledby={`flush-heading-${faqItem.id}`}
            data-bs-parent="#accordionFlushExample"
          >
            <div className="accordion-body">{faqItem.answer}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FaqSection;
