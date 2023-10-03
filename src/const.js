import * as Yup from 'yup';

export const KIND_META = 0;
export const KIND_RECOMM = 31989;
export const KIND_HANDLERS = 31990;

// https://www.npmjs.com/package/platform-detect#osmjs + web
export const platforms = [
  'web',
  'android',
  'ios',
  'windows',
  'macos',
  'linux',
  //  chromeos
  //  tizen
  //  linuxBased
];

export const types = ['', 'npub', 'note', 'nevent', 'nprofile', 'naddr'];

export const kinds = {
  0: 'Profiles',
  1: 'Notes',
  3: 'Contact list',
  4: 'DM',
  6: 'Repost',
  7: 'Like',
  8: 'Badge award',
  1063: 'File metadata',
  1984: 'Report',
  9735: 'Zap',
  9802: 'Highlight',
  10000: 'Mute list',
  10001: 'Pin list',
  13194: 'Wallet info',
  30000: 'Profile list',
  30001: 'Bookmark list',
  30008: 'Profile badges',
  30009: 'Badge definition',
  30017: 'Stall',
  30018: 'Product',
  30023: 'Long-form post',
  31989: 'Used apps',
  31990: 'App handlers',
  31337: 'Audio track',
};

export const reversedKinds = {
  Profiles: 0,
  Notes: 1,
  'Contact list': 3,
  DM: 4,
  Repost: 6,
  Like: 7,
  'Badge award': 8,
  'File metadata': 1063,
  Report: 1984,
  Zap: 9735,
  Highlight: 9802,
  'Mute list': 10000,
  'Pin list': 10001,
  'Wallet info': 13194,
  'Profile list': 30000,
  'Bookmark list': 30001,
  'Profile badges': 30008,
  'Badge definition': 30009,
  Stall: 30017,
  Product: 30018,
  'Long-form post': 30023,
  'Used apps': 31989,
  'App handlers': 31990,
  'Audio track': 31337,
};

export const validationSchemaForFormAddApp = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  link: Yup.string().matches(
    /^(ftp|http|https):\/\/[^ "]+$/,
    'Please enter a valid link URL'
  ),
  nips: Yup.array().of(
    Yup.object().shape({
      value: Yup.string().matches(
        /^NIP-\d{2}$/,
        'NIP should start with "NIP-" followed by two digits'
      ),
      label: Yup.string(), // Optional: You can also add validation for the label if needed
    })
  ),
});

export const programmingLanguages = [
  { value: 'JavaScript', label: 'JavaScript' },
  { value: 'Python', label: 'Python' },
  { value: 'C++', label: 'C++' },
  { value: 'C#', label: 'C#' },
  { value: 'Php', label: 'Php' },
  { value: 'Java', label: 'Java' },
];

export const optionsLicensies = [
  { value: 'MIT', label: 'MIT' },
  { value: 'GPL3', label: 'GPL3' },
];

export const optionsNips = [
  {
    value: 'NIP-01',
    label: 'NIP-01: Basic protocol flow description',
  },
  { value: 'NIP-02', label: 'NIP-02: Contact List and Petnames' },
  { value: 'NIP-03', label: 'NIP-03: OpenTimestamps Attestations for Events' },
  { value: 'NIP-04', label: 'NIP-04: Encrypted Direct Message' },
  {
    value: 'NIP-05',
    label: 'NIP-05: Mapping Nostr keys to DNS-based internet identifiers',
  },
  {
    value: 'NIP-06',
    label: 'NIP-06: Basic key derivation from mnemonic seed phrase',
  },
  {
    value: 'NIP-07',
    label: 'NIP-07: window.nostr capability for web browsers',
  },
  {
    value: 'NIP-08',
    label:
      'NIP-08: Handling Mentions --- unrecommended: deprecated in favor of NIP-27',
  },
  { value: 'NIP-09', label: 'NIP-09: Event Deletion' },
  {
    value: 'NIP-10',
    label:
      "NIP-10: Conventions for clients' use of e and p tags in text events",
  },
  { value: 'NIP-11', label: 'NIP-11: Relay Information Document' },
  { value: 'NIP-12', label: 'NIP-12: Generic Tag Queries' },
  { value: 'NIP-13', label: 'NIP-13: Proof of Work' },
  { value: 'NIP-14', label: 'NIP-14: Subject tag in text events' },
  {
    value: 'NIP-15',
    label: 'NIP-15: Nostr Marketplace (for resilient marketplaces)',
  },
  { value: 'NIP-16', label: 'NIP-16: Event Treatment' },
  { value: 'NIP-18', label: 'NIP-18: Reposts' },
  { value: 'NIP-19', label: 'NIP-19: bech32-encoded entities' },
  { value: 'NIP-20', label: 'NIP-20: Command Results' },
  { value: 'NIP-21', label: 'NIP-21: nostr: URI scheme' },
  { value: 'NIP-22', label: 'NIP-22: Event created_at Limits' },
  { value: 'NIP-23', label: 'NIP-23: Long-form Content' },
  { value: 'NIP-25', label: 'NIP-25: Reactions' },
  { value: 'NIP-26', label: 'NIP-26: Delegated Event Signing' },
  { value: 'NIP-27', label: 'NIP-27: Text Note References' },
  { value: 'NIP-28', label: 'NIP-28: Public Chat' },
  { value: 'NIP-30', label: 'NIP-30: Custom Emoji' },
  { value: 'NIP-31', label: 'NIP-31: Dealing with Unknown Events' },
  { value: 'NIP-32', label: 'NIP-32: Labeling' },
  { value: 'NIP-33', label: 'NIP-33: Parameterized Replaceable Events' },
  { value: 'NIP-36', label: 'NIP-36: Sensitive Content' },
  { value: 'NIP-39', label: 'NIP-39: External Identities in Profiles' },
  { value: 'NIP-40', label: 'NIP-40: Expiration Timestamp' },
  { value: 'NIP-42', label: 'NIP-42: Authentication of clients to relays' },
  { value: 'NIP-45', label: 'NIP-45: Counting results' },
  { value: 'NIP-46', label: 'NIP-46: Nostr Connect' },
  { value: 'NIP-47', label: 'NIP-47: Wallet Connect' },
  { value: 'NIP-50', label: 'NIP-50: Keywords filter' },
  { value: 'NIP-51', label: 'NIP-51: Lists' },
  { value: 'NIP-52', label: 'NIP-52: Calendar Events' },
  { value: 'NIP-53', label: 'NIP-53: Live Activities' },
  { value: 'NIP-56', label: 'NIP-56: Reporting' },
  { value: 'NIP-57', label: 'NIP-57: Lightning Zaps' },
  { value: 'NIP-58', label: 'NIP-58: Badges' },
  { value: 'NIP-65', label: 'NIP-65: Relay List Metadata' },
  { value: 'NIP-78', label: 'NIP-78: Application-specific data' },
  { value: 'NIP-89', label: 'NIP-89: Recommended Application Handlers' },
  { value: 'NIP-94', label: 'NIP-94: File Metadata' },
  { value: 'NIP-98', label: 'NIP-98: HTTP Auth' },
  { value: 'NIP-99', label: 'NIP-99: Classified Listings' },
];

export const optionsTags = [
  { value: 'social', label: 'social' },
  { value: 'productivity', label: 'productivity' },
  { value: 'live streaming', label: 'live streaming' },
  { value: 'marketplace', label: 'marketplace' },
  { value: 'music', label: 'music' },
  { value: 'video', label: 'video' },
  { value: 'pictures', label: 'pictures' },
  { value: 'storage', label: 'storage' },
  { value: 'dvm', label: 'dvm' },
  { value: 'game', label: 'game' },
  { value: 'messaging', label: 'messaging' },
  { value: 'education', label: 'education' },
  { value: 'health', label: 'health' },
  { value: 'dating', label: 'dating' },
  { value: 'adult', label: 'adult' },
  { value: 'news', label: 'news' },
  { value: 'podcasts', label: 'podcasts' },
  { value: 'cooking', label: 'cooking' },
];

export const categories = [
  { value: 'social', label: 'Social' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'live_streaming', label: 'Live Streaming' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'music', label: 'Music' },
  { value: 'video', label: 'Video' },
  { value: 'pictures', label: 'Pictures' },
  { value: 'storage', label: 'Storage' },
  { value: 'dvm', label: 'DVM' },
  { value: 'game', label: 'Games' },
  { value: 'messaging', label: 'Messaging' },
  { value: 'education', label: 'Education' },
  { value: 'health', label: 'Health' },
  { value: 'dating', label: 'Dating' },
  { value: 'adult', label: 'Adult' },
  { value: 'news', label: 'News' },
  { value: 'podcasts', label: 'Podcasts' },
  { value: 'tools', label: 'Tools' },
  { value: 'micro_apps', label: 'Micro-apps' },
];

export const isTablet = window.screen.width < 615;
