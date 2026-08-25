import React, { useEffect, useState } from 'react';
import { apiFetchOr } from '../../APIs/client';

/**
 * Active redemption codes for one game.
 *
 * Which codes and where they redeem both come from the game's home config;
 * previously every non-Genshin page fetched Star Rail's codes and pointed them
 * at Star Rail's redemption site. When a game only accepts codes in-game the
 * config has no redeem URL, and the code is shown as copyable text rather than
 * a link that would not work.
 */
function CodeRedeemTable({ codes }) {
  const [codeItems, setCodeItems] = useState([]);
  const [copied, setCopied] = useState(null);

  const command = codes?.command;

  useEffect(() => {
    if (!command) return;
    let cancelled = false;

    apiFetchOr([], `api/misc-commands?scrapeCommand=${command}`).then((data) => {
      if (!cancelled) setCodeItems(Array.isArray(data) ? data : []);
    });

    return () => {
      cancelled = true;
    };
  }, [command]);

  if (!command || codeItems.length === 0) return null;

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // clipboard blocked; the code is on screen to copy by hand
    }
  };

  return (
    <div className="code-table">
      <table>
        <thead>
          <tr>
            <th className="code-table-header-text">Code</th>
          </tr>
        </thead>
        <tbody>
          {codeItems.map((item) => (
            <tr key={item.code}>
              <td className="code-table-text">
                {codes.redeemUrl ? (
                  <a
                    className="code-redeem-text"
                    href={`${codes.redeemUrl}${item.code}`}
                    target="_blank"
                    rel="noreferrer"
                    title={item.reward}
                  >
                    {item.code}
                  </a>
                ) : (
                  <button
                    type="button"
                    className="code-redeem-text"
                    title={`${item.reward}\n(redeemed in-game -- click to copy)`}
                    onClick={() => copyCode(item.code)}
                  >
                    {copied === item.code ? 'Copied!' : item.code}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CodeRedeemTable;
