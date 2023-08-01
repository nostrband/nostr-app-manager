import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';

import { nip19 } from 'nostr-tools';

import AppEditForm from './AppEditForm';

import * as cmn from '../common';

const AppEditView = () => {
  const params = useParams();
  const naddr = (params.naddr ?? '').toLowerCase();
  const [info, setInfo] = useState(null);
  const [addr, setAddr] = useState(null);
  const [profile, setProfile] = useState(null);
  const [ready, setReady] = useState(false);
  const [otherTags, setOtherTags] = useState([]);

  const init = useCallback(async () => {
    let addr = null;
    if (naddr) {
      const { type, data } = nip19.decode(naddr);
      if (type !== 'naddr') return;

      addr = data;
      setAddr(addr);
    }

    cmn.addOnNostr(async () => {
      if (addr) {
        const info = await cmn.fetchApps(addr.pubkey, addr);
        setInfo(info);
        const firstApp = Object.values(info.apps)[0];
        const tags = firstApp.addrHandler.tags
          .filter((tag) => tag[0] === 't')
          .map((tag) => {
            return { label: tag[1], value: tag[1] };
          });
        setOtherTags(tags);
        setInfo(info);
      } else if (cmn.isAuthed()) {
        setProfile(await cmn.fetchProfile(cmn.getLoginPubkey()));
      }
      setReady(true);
    });
  }, [naddr]);

  // on the start
  useEffect(() => {
    init().catch(console.error);
  }, [init]);

  if (naddr && !addr) return 'Bad address.';

  if (naddr && info && !Object.values(info.apps).length)
    return 'Nothing found.';

  const app =
    naddr && info
      ? { ...Object.values(info.apps)[0].addrHandler, otherTags }
      : null;
  const meta = naddr && info ? info.meta : profile;
  const forbidden =
    naddr && info && cmn.isAuthed() && cmn.getLoginPubkey() !== app.pubkey;
  const viewUrl = naddr && info ? '/a/' + cmn.getNaddr(app) : '';
  return (
    <div className="mt-5">
      {!ready && <>Loading...</>}
      {ready && (
        <>
          {!cmn.isAuthed() && <div>Please login.</div>}
          {forbidden && (
            <div>
              You aren't the publisher of this app info.
              <br />
              Click <a href={viewUrl}>here</a> to view the app.
            </div>
          )}
          {!forbidden && (
            <div className="mt-5">
              <AppEditForm app={app} profileMeta={meta} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AppEditView;
