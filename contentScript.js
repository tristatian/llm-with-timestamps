// LLM Message Timestamps content script (Manifest V3)

(() => {
  const TIMESTAMP_CLASS = "llm-timestamp-extension-timestamp";
  const STYLE_ID = "llm-timestamp-extension-style";
  const PROCESSED_ATTR = "data-llm-timestamped";

  /**
   * Per-site configuration: selectors and timestamp extraction.
   * Hostname keys can be exact or suffix-matched (e.g. "claude.ai").
   */
  const SITE_CONFIGS = {
    // Claude (claude.ai)
    "claude.ai": {
      selectors: [
        '[data-testid="message-bubble"]',
        '[data-message-author-role]',
        'main [class*="message-bubble"]',
        'main [data-testid*="chat-message"]',
        'main [class*="prose"] article',
      ],
      getTimestamp(messageEl) {
        const timeEl = messageEl.querySelector("time[datetime]");
        if (timeEl && timeEl.dateTime) {
          const parsed = new Date(timeEl.dateTime);
          if (!Number.isNaN(parsed.getTime())) return parsed;
        }
        return new Date();
      },
    },

    // ChatGPT (chat.openai.com, chatgpt.com)
    "chat.openai.com": {
      selectors: [
        'main [data-message-author-role]',
        'main .markdown.prose',
        'main [data-testid*="conversation-turn"]',
      ],
      getTimestamp(messageEl) {
        return new Date();
      },
    },
    "chatgpt.com": {
      selectors: [
        'main [data-message-author-role]',
        'main .markdown.prose',
        'main [data-testid*="conversation-turn"]',
      ],
      getTimestamp(messageEl) {
        return new Date();
      },
    },

    // Gemini (gemini.google.com and related)
    "gemini.google.com": {
      selectors: [
        'main [data-testid*="message"]',
        'main [role="listitem"] article',
      ],
      getTimestamp(messageEl) {
        const timeEl = messageEl.querySelector("time[datetime]");
        if (timeEl && timeEl.dateTime) {
          const parsed = new Date(timeEl.dateTime);
          if (!Number.isNaN(parsed.getTime())) return parsed;
        }
        return new Date();
      },
    },

    // Grok (x.ai)
    "x.ai": {
      selectors: [
        'main [data-testid*="message"]',
        'main article',
      ],
      getTimestamp() {
        return new Date();
      },
    },

    // DeepSeek (deepseek.com and app.deepseek.com)
    "deepseek.com": {
      selectors: [
        'main [data-testid*="message"]',
        'main [class*="message"]',
        'main article',
      ],
      getTimestamp() {
        return new Date();
      },
    },

    // Llama (Meta AI web UIs; adjust as needed)
    "meta.ai": {
      selectors: [
        'main [data-testid*="message"]',
        'main [class*="message"]',
        'main article',
      ],
      getTimestamp() {
        return new Date();
      },
    },
  };

  function getSiteConfig() {
    const host = location.hostname;
    if (SITE_CONFIGS[host]) return SITE_CONFIGS[host];
    const key = Object.keys(SITE_CONFIGS).find((k) => host.endsWith(k));
    return key ? SITE_CONFIGS[key] : null;
  }

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
    `;
    document.head.appendChild(style);
  }

  function formatTime(date) {
    try {
      return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return date.toLocaleTimeString();
    }
  }

  function addTimestampToMessage(config, messageEl) {
    if (!messageEl || messageEl.getAttribute(PROCESSED_ATTR) === "true") return;

    const existing = messageEl.querySelector(`.${TIMESTAMP_CLASS}`);
    if (existing) {
      messageEl.setAttribute(PROCESSED_ATTR, "true");
      return;
    }

    const timestampDate = config.getTimestamp(messageEl);
    const timeText = formatTime(timestampDate);

    const container = document.createElement("div");
    container.className = TIMESTAMP_CLASS;
    container.textContent = `Sent at ${timeText}`;

    if (messageEl instanceof HTMLElement) {
      messageEl.appendChild(container);
    } else if (messageEl.parentElement) {
      messageEl.parentElement.appendChild(container);
    }

    messageEl.setAttribute(PROCESSED_ATTR, "true");
  }

  function findAndTimestampMessages(config, root = document) {
    const selector = config.selectors.join(",");
    const nodes = root.querySelectorAll(selector);
    nodes.forEach((node) => addTimestampToMessage(config, node));
  }

  function handleMutations(config, mutationList) {
    for (const mutation of mutationList) {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          const el = /** @type {Element} */ (node);
          findAndTimestampMessages(config, el);
        });
      }
    }
  }

  function init() {
    const config = getSiteConfig();
    if (!config) return;

    injectStyles();
    findAndTimestampMessages(config, document);

    const observer = new MutationObserver((mutations) =>
      handleMutations(config, mutations),
    );
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

