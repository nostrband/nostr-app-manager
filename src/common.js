import platform from 'platform-detect'

export const apps = [
  {
    pubkey: "damus",
    name: "Damus",
    about: "iOS nostr client",
    picture: "https://damus.io/favicon.ico",
    profile_url: "damus:{npub}",
    event_url: "damus:{note}",
    platforms: ["ios","macos"],
    kinds: [0, 1],
  },
  {
    pubkey: "amethyst",
    name: "Amethyst",
    about: "Nostr client for Android",
    picture: "https://github.com/vitorpamplona/amethyst/raw/main/fastlane/metadata/android/en-US/images/icon.png",
    platforms: ["android"],
    profile_url: "nostr:{nprofile}",
    event_url: "nostr:{nevent}",
    kinds: [0, 1],
  },
  {
    pubkey: "snort",
    name: "Snort",
    about: "Feature packed nostr web UI",
    profile_url: "https://snort.social/p/{npub}",
    event_url: "https://snort.social/e/{nevent}",
    picture: "https://nostr.band/snort.png",
    platforms: ["web","android"],
    kinds: [0, 1],
  },
  {
    pubkey: "iris",
    name: "Iris",
    about: "Decentralized messenger",
    profile_url: "https://iris.to/#/profile/{npub}",
    event_url: "https://iris.to/#/post/{note}",
    picture: "https://iris.to/favicon.ico",
    platforms: ["web","android"],
    kinds: [0, 1],
  },
  {
    pubkey: "primal",
    name: "Primal",
    about: "Lightning-fast UI for Nostr",
    profile_url: "https://primal.net/profile/{npub}",
    event_url: "https://primal.net/thread/{note}",
    picture: "https://primal.net/assets/favicon-66add1cc.ico",
    platforms: ["web"],
    kinds: [0, 1],
  },
  {
    pubkey: "astral",
    name: "Astral",
    profile_url: `https://astral.ninja/{npub}`,
    event_url: `https://astral.ninja/{note}`,
    picture: "https://astral.ninja/favicon.ico",
    platforms: ["web"],
    kinds: [0, 1],
  },
  {
    pubkey: "coracle",
    name: "Coracle",
    about: "A Nostr client that makes relays a first-class concept",
    profile_url: "https://coracle.social/{nprofile}",
    event_url: "https://coracle.social/{nevent}",
    picture: "https://coracle.social/images/favicon.png",
    platforms: ["web"],
    kinds: [0, 1],
  },
  {
    pubkey: "nostrgram",
    name: "NostrGram",
    profile_url: "https://nostrgram.co/#profile:allMedia:{pubkey}",
    event_url: "https://nostrgram.co/#thread:{event_id}:{event_id}",
    picture: "https://nostrgram.co/images/logo_new_icon.ico",
    platforms: ["web"],
    kinds: [0, 1],
  },
  {
    pubkey: "satellite",
    name: "Satellite.Earth",
    about: "Satellite nostr client",
    profile_url: "https://satellite.earth/@{npub}",
    event_url: "https://satellite.earth/thread/{note}",
    picture: "https://satellite.earth/favicon.ico",
    platforms: ["web"],
    kinds: [0, 1],
  },
  {
    pubkey: "nostribe",
    name: "Nostribe",
    profile_url: "https://www.nostribe.com/profile/{npub}",
    event_url: "https://www.nostribe.com/post/{note}",
    picture: "https://www.nostribe.com/_next/static/media/metadata/favicon.d87dc90f.ico",
    platforms: ["web"],
    kinds: [0, 1],
  },
  {
    pubkey: "nostrid",
    name: "Nostrid",
    profile_url: "https://web.nostrid.app/account/{pubkey}",
    event_url: "https://web.nostrid.app/note/{event_id}",
    picture: "https://web.nostrid.app/icon-192.png",
    platforms: ["web"],
    kinds: [0, 1],
  },
  {
    pubkey: "yosup",
    name: "Yosup",
    profile_url: "https://yosup.app/profile/{pubkey}",
    event_url: "https://yosup.app/thread/{event_id}",
    picture: "https://yosup.app/icon/logo-inverted.svg",
    platforms: ["web"],
    kinds: [0, 1],
  },
  // ...
  {
    pubkey: "habla",
    name: "Habla.News",
    about: "Long-form posts on Nostr",
    profile_url: "https://habla.news/u/{nprofile}",
    event_url: "https://habla.news/a/{naddr}",
    picture: "https://habla.news/favicon.ico",
    platforms: ["web"],
    kinds: [0, 30023],
  },
  {
    pubkey: "zapstr",
    name: "Zapstr.Live",
    about: "Music app on Nostr",
    picture: "https://www.iconarchive.com/download/i50332/ncrow/mega-pack-2/Winamp.ico",
    profile_url: "https://zapstr.live/{npub}/tracks",
    event_url: "https://zapstr.live/?track={naddr}",
    platforms: ["web"],
    kinds: [0, 31337],
  },
  {
    pubkey: "highlighter",
    name: "Highlighter",
    about: "Highlight any content and share on Nostr",
    event_url: "https://highlighter.com/e/{note}",
    picture: "https://highlighter.com/favicon.png",
    platforms: ["web"],
    kinds: [9802],
  },
  {
    pubkey: "nostr_band",
    name: "Nostr.Band",
    about: "Search engine for Nostr",
    picture: "https://nostr.band/favicon.ico",
    profile_url: "https://nostr.band/{npub}",
    event_url: "https://nostr.band/{note}",
    platforms: ["web"],
    kinds: [0, 1],
  },
  {
    pubkey: "listr",
    name: "Listr.Lol",
    about: "List management app",
    picture: "https://listr.lol/apple-touch-icon.png",
    profile_url: "https://listr.lol/{npub}",
    event_url: "https://listr.lol/a/{naddr}",
    platforms: ["web"],
    kinds: [30000, 30001],
  },
  {
    pubkey: "other_npub",
    name: "Other Native App (npub)",
    about: "Redirect to a native app that supports nostr:npub links.",
    picture: "",
    profile_url: "nostr:{npub}",
    platforms: ["web", "android", "ios", "macos", "desktop"],
    kinds: [0],
  },
  {
    pubkey: "other_nprofile",
    name: "Other Native App (nprofile)",
    about: "Redirect to a native app that supports nostr:nprofile links.",
    picture: "",
    profile_url: "nostr:{nprofile}",
    platforms: ["web", "android", "ios", "macos", "desktop"],
    kinds: [0],
  },
  {
    pubkey: "other_note",
    name: "Other Native App (note)",
    about: "Redirect to a native app that supports nostr:note links.",
    picture: "",
    event_url: "nostr:{note}",
    platforms: ["web", "android", "ios", "macos", "desktop"],
    kinds: ["1-9999","40000-"],
  },
  {
    pubkey: "other_nevent",
    name: "Other Native App (nevent)",
    about: "Redirect to a native app that supports nostr:nevent links.",
    picture: "",
    event_url: "nostr:{nevent}",
    platforms: ["web", "android", "ios", "macos", "desktop"],
    kinds: ["1-9999","40000-"],
  },
  {
    pubkey: "other_naddr",
    name: "Other Native App",
    about: "Redirect to a native app that supports nostr:naddr links.",
    picture: "",
    event_url: "nostr:{naddr}",
    platforms: ["web", "android", "ios", "macos", "desktop"],
    kinds: ["30000-39999"],
  }
];

export function localGet(key) {
  try
  {
    if (localStorage)
      return localStorage.getItem(key);
    else
      return sessionStorage.getItem(key);
  }
  catch (e)
  {
    return null;
  }
}

export function localSet(key, value) {
  try
  {
    if (localStorage)
      localStorage.setItem(key, value);
    else
      sessionStorage.setItem(key, value);
  }
  catch (e)
  {}
}

export function readAppSettings() {
  const json = localGet("appSettings");
  try {
    return json ? JSON.parse (json) : {};
  } catch (e) {
    return {};
  }
}

export function writeAppSettings(apps) {
  localSet("appSettings", JSON.stringify(apps));
}

export function getKindLabel(kind) {
  let label = "";
  switch (Number(kind)) {
    case 0: label = "profile"; break;
    case 1: label = "note"; break;
    case 30023: label = "post"; break;
    case 9802: label = "highlight"; break;
    case 31337: label = "audio track"; break;
    case 30000: label = "profile list"; break;
    case 30001: label = "bookmark list"; break;
    default: label = "event kind:"+kind; break;
  }
  return label;
}

export function getRememberLabel(kind, platform) {
  let label = "";
  switch (kind) {
    case 0: label = "profiles"; break;
    case 1: label = "notes"; break;
    case 30023: label = "posts"; break;
    case 9802: label = "highlights"; break;
    case 31337: label = "audio tracks"; break;
    case 30000: label = "profile lists"; break;
    case 30001: label = "bookmark lists"; break;
    default: label = "events of kind:"+kind; break;
  }
  return  (
    <>
      Remember chosen app for <b>{label}</b> on <b>{platform || "all devices"}</b>
    </>
  )
}

export function getSavedApp(kind, platform, settings) {

  if ("kinds" in settings
      && kind in settings.kinds
      && "platforms" in settings.kinds[kind]
      && platform in settings.kinds[kind].platforms)
    return settings.kinds[kind].platforms[platform].app || "";

  return "";
}

export function getPlatform() {
  if (platform.os === "android")
    return "android";
  else if (platform.os === "ios")
    return "ios";
  else if (platform.os === "macos")
    return "macos";
  else
    return "desktop";
}
