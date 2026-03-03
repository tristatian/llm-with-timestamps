// Claude.ai Message Timestamps content script (Manifest V3)

(() => {
  const TIMESTAMP_CLASS = "claude-timestamp-extension-timestamp";
  const STYLE_ID = "claude-timestamp-extension-style";
  const PROCESSED_ATTR = "data-claude-timestamped";

  const MESSAGE_SELECTORS = [
    // Common patterns for chat messages; supports possible Claude.ai structures.
    '[data-testid="message-bubble"]',
    '[data-message-author-role]',
    'main [class*="message-bubble"]',
    'main [data-testid*="chat-message"]',
    'main [class*="prose"] article', // generic fallback for chat message articles
  ];

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .${TIMESTAMP_CLASS} {
        font-size: 0.72rem;
        color: rgba(130, 130, 150, 0.9);
        margin-top: 4px;
        text-align: right;
        opacity: 0.9;
        pointer-events: none;
        user-select: none;
      }

      /* Try to keep timestamp visually attached to the bubble */
      [data-testid="message-bubble"],
      [data-message-author-role],
      main [class*="message-bubble"],
      main [data-testid*="chat-message"],
      main [class*="prose"] article {
        position: relative;
      }
    `;
    document.head.appendChild(style);
  }

  function formatTime(date) {
    try {
      return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
      });
    } catch {
      return date.toLocaleTimeString();
    }
  }

  function getTimestampForMessage(messageEl) {
    // If Claude exposes a <time datetime="..."> inside the message, use it.
    const timeEl = messageEl.querySelector("time[datetime]");
    if (timeEl && timeEl.dateTime) {
      const parsed = new Date(timeEl.dateTime);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    // Fallback: use the moment this message element was first seen.
    return new Date();
  }

  function addTimestampToMessage(messageEl) {
    if (!messageEl || messageEl.getAttribute(PROCESSED_ATTR) === "true") return;

    const existing = messageEl.querySelector(`.${TIMESTAMP_CLASS}`);
    if (existing) {
      messageEl.setAttribute(PROCESSED_ATTR, "true");
      return;
    }

    const timestampDate = getTimestampForMessage(messageEl);
    const timeText = formatTime(timestampDate);

    const container = document.createElement("div");
    container.className = TIMESTAMP_CLASS;
    container.textContent = `Sent at ${timeText}`;

    // Prefer appending inside the bubble; fall back to after it.
    if (messageEl instanceof HTMLElement) {
      messageEl.appendChild(container);
    } else if (messageEl.parentElement) {
      messageEl.parentElement.appendChild(container);
    }

    messageEl.setAttribute(PROCESSED_ATTR, "true");
  }

  function isMessageElement(el) {
    if (!(el instanceof Element)) return false;
    return MESSAGE_SELECTORS.some((sel) => el.matches(sel));
  }

  function findAndTimestampMessages(root = document) {
    const selector = MESSAGE_SELECTORS.join(",");
    const nodes = root.querySelectorAll(selector);
    nodes.forEach((node) => addTimestampToMessage(node));
  }

  function handleMutations(mutationList) {
    for (const mutation of mutationList) {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          const el = /** @type {Element} */ (node);

          if (isMessageElement(el)) {
            addTimestampToMessage(el);
          }

          // Also search within this subtree for any message elements.
          findAndTimestampMessages(el);
        });
      }
    }
  }

  function init() {
    injectStyles();
    findAndTimestampMessages(document);

    const observer = new MutationObserver(handleMutations);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();

