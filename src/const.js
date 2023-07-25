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

export const validationSchemaForFormAddApp = Yup.object().shape({
  name: Yup.string().required('Name is required'),
});

export const programmingLanguages = [
  { value: 'JavaScript', label: 'JavaScirpt' },
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
