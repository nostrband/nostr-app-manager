import { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import { Link, useNavigate } from 'react-router-dom';

import AddKind from '../../elements/AddKind';
import KindButton from '../../elements/KindButton';
import HandlerUrl from '../../elements/HandlerUrl';
import * as cmn from '../../common';
import * as cs from '../../const';
import CreatableSelect from 'react-select/creatable';
import ShareAppModal from './ShareAppModal';
import { nip19 } from 'nostr-tools';
import { toast } from 'react-toastify';
import axios from 'axios';

const tabs = [
  {
    title: 'Nostr App',
    value: 'nostr',
  },
  {
    title: 'Other App',
    value: 'other',
  },
];

const AppEditForm = (props) => {
  const navigate = useNavigate();
  const noMeta = !Object.keys(props.app?.profile ?? {}).length;
  const [inherit, setInherit] = useState(false);
  const [name, setName] = useState('');
  const [banner, setBanner] = useState('');
  const [ln, setLN] = useState('');
  const [website, setWebsite] = useState('');
  const [about, setAbout] = useState('');
  const [kinds, setKinds] = useState(props.app?.kinds || []);
  const [urls, setUrls] = useState(props.app?.urls || []);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [selectedTab, setSelectedTab] = useState('nostr');
  const [createdApp, setCreatedApp] = useState();
  const [showShareModal, setShowShareModal] = useState(false);
  const [naddr, setNaddr] = useState();
  const [textForShare, setTextForShare] = useState('');
  const [importedDataByManifest, setImportDataByManifest] = useState({});

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
  };

  const toggleInherit = (v) => {
    setInherit(v);
    const meta = v ? props.profileMeta : props.app ?? {};
    setName(meta.profile?.name || '');
    setDisplayName(meta.profile?.display_name || '');
    setNip05(meta.profile?.nip05 || '');
    setPicture(meta.profile?.picture || '');
    setBanner(meta.profile?.banner || '');
    setLN(meta.profile?.lud16 || '');
    setWebsite(meta.profile?.website || '');
    setAbout(meta.profile?.about || '');
  };

  useEffect(() => {
    toggleInherit(props.app != null && (noMeta || props.app.inheritedProfile));
  }, [props.profileMeta, props.app]);

  const addKind = (k) => {
    if (kinds.find((v) => k === v) === undefined) setKinds((ks) => [...ks, k]);
  };

  const removeKind = (oldKind) => {
    setKinds((ks) => ks.filter((k) => k !== oldKind));
  };

  const addUrl = () => {
    setUrls((us) => [...us, { platform: 'web', url: '', type: '' }]);
  };

  const removeUrl = (index) => {
    setUrls((us) => us.filter((u, i) => i !== index));
  };

  const editUrl = (index, url) => {
    setUrls((us) => {
      const n = [...us];
      n[index] = url;
      return n;
    });
  };

  async function save() {
    const toastId = !props.app?.id
      ? toast('Loading...', { type: 'pending', autoClose: false })
      : null;
    if (
      urls.find((u) => u.url.trim() === '' || !u.url.includes('<bech32>')) !==
        undefined &&
      selectedTab === 'nostr'
    ) {
      setError('Specify a valid url with the <bech32> placeholder.');
      return;
    }

    if (!kinds.length && selectedTab === 'nostr') {
      setError('Specify which kinds of events are supported by this app.');
      return;
    }

    if (!inherit && name.trim() === '') {
      setError('Specify app name.');
      return;
    }

    setError(null);
    const event = {
      kind: cs.KIND_HANDLERS,
      content: '',
      tags: [],
    };

    if (!inherit) {
      event.content = JSON.stringify({
        name,
        display_name: displayName,
        nip05,
        picture,
        banner,
        about,
        lud16: ln,
        website,
      });
    }

    const newApp = !props.app?.id;
    const d = '' + Date.now();
    if (newApp) {
      event.tags.push(['d', d]);
      event.tags.push(['published_at', '' + Math.floor(Date.now() / 1000)]);
    } else {
      event.tags = props.app.tags.filter((t) => {
        if (t.length > 0 && (t[0] === 'k' || cmn.isPlatform(t[0])))
          return false;
        return true;
      });
    }
    if (website) {
      event.tags.push(['r', website]);
    }
    if (name) {
      event.tags.push(['alt', `Nostr App: ${name}`]);
    }
    if (selectedTab === 'nostr') {
      kinds.map((k) => event.tags.push(['k', k]));
      urls.map((u) =>
        event.tags.push([u.platform, u.url, u.type === '-' ? '' : u.type])
      );
    }

    event.tags = event.tags.filter((tag) => {
      if (tag[0] !== 't') {
        return true;
      }
      const tagLabel = tag[1];
      return tags.some((t) => t.label === tagLabel);
    });

    tags.forEach((tag) => {
      const tagLabel = tag.label;
      if (!event.tags.some((t) => t[0] === 't' && t[1] === tagLabel)) {
        event.tags.push(['t', tagLabel]);
      }
    });

    setSending(true);
    const r = await cmn.publishEvent(event);
    setSending(false);
    if (!r || r.error) {
      setError(r ? r.error : 'Failed');
    } else {
      if (newApp) {
        const naddr = cmn.formatNaddr({
          kind: cs.KIND_HANDLERS,
          pubkey: cmn.getLoginPubkey(),
          identifier: d,
        });
        setNaddr(naddr);
        toast.update(toastId, {
          render: props.app ? 'Saved' : 'Created',
          type: 'success',
          autoClose: 3000,
        });
        setShowShareModal(true);
        const { type, data } = nip19.decode(naddr);
        const info = await cmn.fetchApps(data.pubkey, data);
        setCreatedApp(info.apps[name].addrHandler);
        const naddrForBySelectedApp = cmn.getNaddr(info.apps[name].addrHandler);
        setTextForShare(
          `Check out ${info.apps[name].addrHandler.profile.display_name} - ${info.apps[name].addrHandler.profile.about}
      https://nostrapp.link/a/${naddrForBySelectedApp}`
        );
        // NOTE: right now publishEvent doesn't wait for the 'ok',
        // so we should give relays some time to accept and publish our event
      } else {
        setError('');
        setTimeout(() => {
          setError(null);
        }, 3000);
      }
    }
  }
  useEffect(() => {
    if (kinds.length === 0 && urls.length === 0 && props?.app?.id) {
      setSelectedTab('other');
    }
  }, [kinds, urls]);

  const askShareOrNorAndNavigateNext = async () => {
    setTimeout(() => {
      navigate(cmn.formatAppUrl(naddr));
    }, 500);
  };

  const handleCloseModal = () => {
    setShowShareModal(false);
    askShareOrNorAndNavigateNext();
  };

  const isDuplicate = (newValue, values) => {
    return values.some((item) => item.label === newValue);
  };
  const viewUrl = props.app ? '/a/' + cmn.getNaddr(props.app) : '';

  const handleImportFromManifest = async () => {
    try {
      const { data } = await axios.get(website);
      if (data) {
        let manifestUrl = website.endsWith('/')
          ? website + 'manifest.json'
          : website + '/manifest.json';
        const manifestResponse = await axios(manifestUrl);
        setImportDataByManifest(manifestResponse.data);
      }
    } catch (error) {
      setError('Error while importing from manifest: ' + error.message);
    }
  };

  const setDataFromManifest = () => {
    const { short_name, name, icons, description } = importedDataByManifest;
    setName(short_name);
    setDisplayName(name);
    setAbout(description);
    const iconSrc = website.endsWith('/')
      ? website + icons[0].src
      : website + '/' + icons[0].src;
    setPicture(iconSrc);
  };

  return (
    <div>
      <h4 className="mt-5">{props.app ? 'Edit app' : 'Create app'}</h4>
      <div>
        <Form>
          <Form.Check
            type="switch"
            label="Inherit info from your profile info (kind:0)"
            checked={inherit}
            disabled={props.profileMeta === null}
            onChange={(e) => toggleInherit(e.target.checked)}
          />
          <ul class="nav nav-pills mt-3 mb-3">
            {tabs.map((tab) => {
              return (
                <li
                  onClick={() => handleTabChange(tab.value)}
                  className={`tab nav-item nav-link ${
                    selectedTab === tab.value ? 'active' : ''
                  }`}
                >
                  {tab.title}
                </li>
              );
            })}
          </ul>
          <p>
            {selectedTab === 'nostr'
              ? 'Nostr apps can display, edit or process nostr events.'
              : "Other apps don't handle nostr events, but are still useful to nostr users."}
          </p>
          {importedDataByManifest.name ? (
            <Button
              className="mb-1"
              variant="primary"
              size="sm"
              onClick={setDataFromManifest}
            >
              Import from PWA manifest
            </Button>
          ) : null}
        </Form>
      </div>

      {selectedTab === 'nostr' ? (
        <>
          <h4 className="mt-5">Kinds</h4>
          <div>
            {kinds.map((k) => (
              <KindButton key={k} kind={k} onRemove={removeKind} />
            ))}
            <AddKind onSelect={addKind} />
          </div>
        </>
      ) : null}
      {selectedTab === 'nostr' ? (
        <>
          <h4 className="mt-5">Handler URLs</h4>
          <div>
            <div>
              <small className="text-muted">
                Specify how to redirect users to this app. For each platform
                this app supports, specify a URL with &quot;&lt;bech32&gt;&quot;
                template, and a type of identifier to fill in place of this
                template.
                <br />
                Example: https://app.com/&lt;bech32&gt; or nostr:&lt;bech32&gt;.
              </small>
            </div>

            {urls.length > 0 && (
              <>
                <table className="table-responsive mt-3">
                  <thead>
                    <tr>
                      <th scope="col">Platform</th>
                      <th scope="col">Url</th>
                      <th scope="col">Identifier</th>
                      <th scope="col"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {urls.map((u, i) => (
                      <tr key={i}>
                        <HandlerUrl
                          index={i}
                          url={u}
                          onRemove={removeUrl}
                          onChange={editUrl}
                        />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            <Button variant="outline-primary mt-2" onClick={addUrl}>
              Add URL
            </Button>
          </div>
        </>
      ) : null}

      <div className="mt-5">
        {error !== null && error !== '' && (
          <Alert variant="danger" dismissible={true}>
            {error}
          </Alert>
        )}
        {error === '' && <Alert variant="success">Saved!</Alert>}
        <Button variant="primary" size="lg" onClick={save} disabled={sending}>
          {props.app ? 'Save' : 'Create'}
        </Button>
        {viewUrl && (
          <Link to={viewUrl}>
            <Button variant="outline-secondary" className="ms-1" size="lg">
              View
            </Button>
          </Link>
        )}
      </div>
      {createdApp ? (
        <ShareAppModal
          showModal={showShareModal}
          handleCloseModal={handleCloseModal}
          selectedApp={createdApp}
          askShareOrNorAndNavigateNext={askShareOrNorAndNavigateNext}
          textForShare={textForShare}
          setTextForShare={setTextForShare}
        />
      ) : null}
    </div>
  );
};

export default AppEditForm;
