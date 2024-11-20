const {
  default: NDK,
  default: NDKEvent,
  NDKRelaySet,
} = require('@nostr-dev-kit/ndk');

const axios = require('axios').default;

const BOT_PUBKEY =
  'd0b48e6a4a36bb75520ba384dd9401f2744e1b70ce94ff05dec9c267a7e96e2a';
const KIND_TEST = 100030117;
const KIND_REAL = 30117;

const ndk = new NDK({
  relays: [
    'wss://relay.nostr.band/all',
    'wss://nos.lol',
    'wss://relay.damus.io',
    'wss://nostr.mutinywallet.com',
  ],
});

async function publishRepo(repo) {
  console.log(repo, 'REPO');
  const published_at = repo.created_at;
  const content = {
    description: repo.description.slice(0, 300),
    license: repo.license?.key || 'none',
    tags: repo.topics,
  };

  const ndkEvent = new NDKEvent(ndk);
  ndkEvent.kind = KIND_TEST;
  ndkEvent.pubkey = BOT_PUBKEY;
  ndkEvent.tags = [
    ['d', `${repo.owner.login}/${repo.name}`],
    ['published_at', published_at],
  ];
  ndkEvent.content = JSON.stringify(content);
  ndkEvent.created_at = Math.floor(Date.now() / 1000);

  const relaySet = NDKRelaySet.fromRelayUrls(
    [
      'wss://relay.nostr.band/all',
      'wss://nos.lol',
      'wss://relay.damus.io',
      'wss://nostr.mutinywallet.com',
    ],
    ndk
  );

  await ndkEvent.publish(relaySet);
}

async function scanGithub() {
  let page = 1;
  const baseURL =
    'https://api.github.com/search/repositories?q=nostr&per_page=100&page=';

  while (true) {
    try {
      const response = await axios.get(baseURL + page);
      if (!response.data.items.length) break;

      for (const repo of response.data.items) {
        await publishRepo(repo);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      page++;
    } catch (error) {
      console.error('Error scanning GitHub:', error);
      break;
    }
  }
}

(async () => {
  setInterval(scanGithub, 24 * 60 * 60 * 1000);
  scanGithub();
})();
