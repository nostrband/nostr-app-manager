import { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import { Link, useNavigate } from 'react-router-dom';

import AddKind from '../elements/AddKind';
import KindButton from '../elements/KindButton';
import HandlerUrl from '../elements/HandlerUrl';
import * as cmn from '../common';
import * as cs from '../const';

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
  const [displayName, setDisplayName] = useState('');
  const [nip05, setNip05] = useState('');
  const [picture, setPicture] = useState('');
  const [banner, setBanner] = useState('');
  const [ln, setLN] = useState('');
  const [website, setWebsite] = useState('');
  const [about, setAbout] = useState('');
  const [kinds, setKinds] = useState(props.app?.kinds || []);
  const [urls, setUrls] = useState(props.app?.urls || []);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [selectedTab, setSelectedTab] = useState('nostr');

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

    kinds.map((k) => event.tags.push(['k', k]));
    urls.map((u) =>
      event.tags.push([u.platform, u.url, u.type === '-' ? '' : u.type])
    );

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
        // NOTE: right now publishEvent doesn't wait for the 'ok',
        // so we should give relays some time to accept and publish our event
        setTimeout(() => {
          navigate(cmn.formatAppUrl(naddr));
        }, 500);
      } else {
        setError('');
        setTimeout(() => {
          setError(null);
        }, 3000);
      }
    }
  }

  const viewUrl = props.app ? '/a/' + cmn.getNaddr(props.app) : '';

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

          <ul class="nav nav-tabs mt-2 mb-2" id="myTab" role="tablist">
            {tabs.map((tab) => {
              return (
                <li
                  onClick={() => handleTabChange(tab.value)}
                  class={`tab nav-link ${
                    selectedTab === tab.value ? 'activeTab' : ''
                  }`}
                >
                  {tab.title}
                </li>
              );
            })}
          </ul>

          <Form.Group className="mb-3 mt-1" controlId="metaName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder={inherit ? '' : 'myapp'}
              disabled={inherit}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Form.Text className="text-muted">
              Short name of your app (use same name for other handlers of this
              app)
            </Form.Text>
          </Form.Group>
          <Form.Group className="mb-3" controlId="metaName">
            <Form.Label>Display name</Form.Label>
            <Form.Control
              type="text"
              placeholder={inherit ? '' : 'My App'}
              disabled={inherit}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <Form.Text className="text-muted">
              Human-readable name of your app
            </Form.Text>
          </Form.Group>
          <Form.Group className="mb-3" controlId="metaLN">
            <Form.Label>Website:</Form.Label>
            <Form.Control
              type="text"
              placeholder={inherit ? '' : 'https://app.com'}
              disabled={inherit}
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
            <Form.Text className="text-muted">
              How should people access the app
            </Form.Text>
          </Form.Group>
          <Form.Group className="mb-3" controlId="metaNip05">
            <Form.Label>Nip-05 identifier</Form.Label>
            <Form.Control
              type="text"
              placeholder={inherit ? '' : '_@app.com'}
              disabled={inherit}
              value={nip05}
              onChange={(e) => setNip05(e.target.value)}
            />
            <Form.Text className="text-muted">
              Preferably _@domain.com to make it trustworthy
            </Form.Text>
          </Form.Group>
          <Form.Group className="mb-3" controlId="metaPicture">
            <Form.Label>Icon</Form.Label>
            <Form.Control
              type="text"
              placeholder={inherit ? '' : 'URL of an image'}
              disabled={inherit}
              value={picture}
              onChange={(e) => setPicture(e.target.value)}
            />
            <Form.Text className="text-muted">
              Could be a link to your favicon
            </Form.Text>
          </Form.Group>
          <Form.Group className="mb-3" controlId="metaPicture">
            <Form.Label>Banner</Form.Label>
            <Form.Control
              type="text"
              placeholder={inherit ? '' : 'URL of an image'}
              disabled={inherit}
              value={banner}
              onChange={(e) => setBanner(e.target.value)}
            />
            <Form.Text className="text-muted">
              Could be a link to a screenshot
            </Form.Text>
          </Form.Group>
          <Form.Group className="mb-3" controlId="metaLN">
            <Form.Label>LN address</Form.Label>
            <Form.Control
              type="text"
              placeholder={inherit ? '' : 'name@provider.com'}
              disabled={inherit}
              value={ln}
              onChange={(e) => setLN(e.target.value)}
            />
            <Form.Text className="text-muted">
              Let people zap this app!
            </Form.Text>
          </Form.Group>
          <Form.Group className="mb-3" controlId="metaAbout">
            <Form.Label>About</Form.Label>
            <Form.Control
              type="text"
              placeholder={inherit ? '' : 'Describe your app'}
              as="textarea"
              rows={3}
              disabled={inherit}
              value={about}
              onChange={(e) => setAbout(e.target.value)}
            />
            <Form.Text className="text-muted">
              Explain what the app does and why people should use it
            </Form.Text>
          </Form.Group>
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
    </div>
  );
};

export default AppEditForm;
