// meetme-screens.jsx — MeetMe design screens
// Exports: ProfileScreen, CreateFormScreen, DoneScreen

const MM_BEIGE  = '#F5F0E8';
const MM_INK    = '#1C1A16';
const MM_MUTED  = '#9A8F7E';
const MM_DIVIDER = '#DDD6C9';
const MM_FONT   = '"Courier New", Courier, monospace';

// ─────────────────────────────────────────────────────────────
// Shared atoms
// ─────────────────────────────────────────────────────────────

const mmSectionLabel = {
  fontFamily: MM_FONT,
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: MM_MUTED,
};

const mmFieldLabel = {
  display: 'block',
  fontFamily: MM_FONT,
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: MM_MUTED,
  marginBottom: 4,
};

const mmInput = {
  display: 'block',
  width: '100%',
  border: 'none',
  borderBottom: `1px solid ${MM_DIVIDER}`,
  background: 'transparent',
  fontFamily: MM_FONT,
  fontSize: 17,
  color: MM_INK,
  padding: '8px 0',
  outline: 'none',
  boxSizing: 'border-box',
  borderRadius: 0,
  WebkitAppearance: 'none',
};

const mmGhostBtn = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontFamily: MM_FONT,
  fontSize: 12,
  color: MM_MUTED,
  padding: 0,
  textDecoration: 'underline',
  textUnderlineOffset: '2px',
  letterSpacing: '0.02em',
};


// ─────────────────────────────────────────────────────────────
// TASK A — Public Profile Page  /[slug]
// ─────────────────────────────────────────────────────────────

function ProfileScreen() {
  const CATEGORIES = [
    { name: 'CINEMA', items: ['Ratatouille', '12 Angry Men', 'The Conversation'] },
    { name: 'MUSIC',  items: ['Kind of Blue', 'Blonde on Blonde', "There's a Riot Goin' On"] },
    { name: 'SPORT',  items: ['A late-night run', 'Sunday tennis', 'Early morning swim'] },
    { name: 'FOOD',   items: ['Pasta carbonara', 'Dim sum Saturday'] },
  ];

  return (
    <div style={{
      background: MM_BEIGE,
      fontFamily: MM_FONT,
      padding: '52px 28px 48px',
      boxSizing: 'border-box',
      width: 375,
    }}>

      {/* ── Name ── */}
      <h1 style={{
        fontFamily: MM_FONT,
        fontSize: 30,
        fontWeight: 400,
        color: MM_INK,
        margin: '0 0 46px',
        letterSpacing: '-0.01em',
        lineHeight: 1.1,
      }}>
        Meet Martin
      </h1>

      {/* ── Category list ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
        {CATEGORIES.map(cat => (
          <div key={cat.name}>

            {/* Category label — not tappable */}
            <div style={{
              fontFamily: MM_FONT,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: MM_INK,
              marginBottom: 4,
            }}>
              {cat.name}
            </div>

            {/* Items — full-width tap targets */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {cat.items.map(item => (
                <a
                  key={item}
                  href="#"
                  onClick={e => e.preventDefault()}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 9,
                    padding: '10px 0',
                    textDecoration: 'none',
                    color: MM_INK,
                    fontFamily: MM_FONT,
                    fontSize: 17,
                    lineHeight: 1.3,
                  }}
                >
                  <span style={{ color: MM_MUTED, flexShrink: 0, userSelect: 'none' }}>·</span>
                  <span style={{
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                    textDecorationThickness: '1px',
                  }}>
                    {item}
                  </span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Footer link ── */}
      <div style={{
        marginTop: 56,
        paddingTop: 20,
        borderTop: `1px solid ${MM_DIVIDER}`,
        textAlign: 'center',
      }}>
        <a
          href="#"
          onClick={e => e.preventDefault()}
          style={{
            fontFamily: MM_FONT,
            fontSize: 12,
            color: MM_MUTED,
            textDecoration: 'none',
            letterSpacing: '0.03em',
          }}
        >
          Create a MeetMe
        </a>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────
// TASK B — Create / Edit Form  /create  /edit/[token]
// ─────────────────────────────────────────────────────────────

let _catId  = 50;
let _itemId = 50;

function CreateFormScreen({ editMode = false }) {

  const blankCats = [
    { id: 1, label: '', items: [{ id: 1, name: '', msg: '' }] },
  ];

  const filledCats = [
    {
      id: 1, label: 'Cinema', items: [
        { id: 1, name: 'Ratatouille',  msg: 'Hey Martin, want to watch Ratatouille?' },
        { id: 2, name: '12 Angry Men', msg: 'Hey Martin — 12 Angry Men tonight?' },
      ],
    },
    {
      id: 2, label: 'Music', items: [
        { id: 3, name: 'Kind of Blue',     msg: 'Kind of Blue on the speakers?' },
        { id: 4, name: 'Blonde on Blonde', msg: 'Dylan night?' },
      ],
    },
    {
      id: 3, label: 'Sport', items: [
        { id: 5, name: 'A late-night run', msg: 'Night run?' },
      ],
    },
  ];

  const [personName, setPersonName] = React.useState(editMode ? 'Martin' : '');
  const [phone,      setPhone]      = React.useState(editMode ? '+44 7911 123456' : '');
  const [cats,       setCats]       = React.useState(editMode ? filledCats : blankCats);

  const addCat = () => {
    _catId++;
    setCats(p => [...p, { id: _catId, label: '', items: [{ id: ++_itemId, name: '', msg: '' }] }]);
  };

  const removeCat  = id  => setCats(p => p.filter(c => c.id !== id));
  const setCatLbl  = (id, v) => setCats(p => p.map(c => c.id === id ? { ...c, label: v } : c));
  const addItem    = cid => { _itemId++; setCats(p => p.map(c => c.id === cid ? { ...c, items: [...c.items, { id: _itemId, name: '', msg: '' }] } : c)); };
  const removeItem = (cid, iid) => setCats(p => p.map(c => c.id === cid ? { ...c, items: c.items.filter(i => i.id !== iid) } : c));
  const setItemFld = (cid, iid, fld, val) => setCats(p => p.map(c => c.id === cid ? { ...c, items: c.items.map(i => i.id === iid ? { ...i, [fld]: val } : i) } : c));

  return (
    <div style={{
      background: MM_BEIGE,
      fontFamily: MM_FONT,
      padding: '52px 28px 56px',
      boxSizing: 'border-box',
      width: 375,
    }}>

      {/* ── Page title ── */}
      <h1 style={{
        fontFamily: MM_FONT,
        fontSize: 24,
        fontWeight: 400,
        color: MM_INK,
        margin: '0 0 40px',
        letterSpacing: '-0.01em',
        lineHeight: 1.2,
      }}>
        {editMode ? 'Edit your MeetMe' : 'Create a MeetMe'}
      </h1>

      {/* ════════ STEP 1 — IDENTITY ════════ */}
      <div style={{ ...mmSectionLabel, marginBottom: 20 }}>Identity</div>

      {/* Name */}
      <div>
        <label style={mmFieldLabel}>Your name</label>
        <input
          type="text"
          value={personName}
          onChange={e => setPersonName(e.target.value)}
          placeholder="e.g. Martin"
          style={mmInput}
          className="mm-input"
        />
      </div>

      {/* Phone */}
      <div style={{ marginTop: 24 }}>
        <label style={mmFieldLabel}>Your WhatsApp number</label>
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="+44 7911 000000"
          style={mmInput}
          className="mm-input"
        />
        <p style={{
          fontFamily: MM_FONT, fontSize: 11,
          color: MM_MUTED, margin: '6px 0 0', lineHeight: 1.5,
        }}>
          This is where people will message you
        </p>
      </div>

      {/* ════════ STEP 2 — CATEGORIES ════════ */}
      <div style={{ ...mmSectionLabel, marginTop: 44 }}>Categories</div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {cats.map((cat, ci) => (
          <div key={cat.id} style={{
            marginTop: 28,
            borderTop: `1px solid ${MM_DIVIDER}`,
            paddingTop: 20,
          }}>

            {/* Category name row */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
              <input
                type="text"
                value={cat.label}
                onChange={e => setCatLbl(cat.id, e.target.value)}
                placeholder={`Category ${ci + 1}`}
                style={{
                  ...mmInput,
                  flex: 1,
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}
                className="mm-input"
              />
              {cats.length > 1 && (
                <button onClick={() => removeCat(cat.id)} style={{ ...mmGhostBtn, paddingBottom: 9 }}>
                  remove
                </button>
              )}
            </div>

            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 20 }}>
              {cat.items.map(item => (
                <div key={item.id}>
                  {/* Item name */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                    <span style={{
                      color: MM_MUTED, fontSize: 16,
                      paddingBottom: 9, flexShrink: 0, fontFamily: MM_FONT,
                    }}>·</span>
                    <input
                      type="text"
                      value={item.name}
                      onChange={e => setItemFld(cat.id, item.id, 'name', e.target.value)}
                      placeholder="Item name"
                      style={{ ...mmInput, flex: 1, fontSize: 16 }}
                      className="mm-input"
                    />
                    {cat.items.length > 1 && (
                      <button
                        onClick={() => removeItem(cat.id, item.id)}
                        style={{ ...mmGhostBtn, paddingBottom: 9, fontSize: 15 }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                  {/* WhatsApp message */}
                  <div style={{ paddingLeft: 24, marginTop: 8 }}>
                    <label style={{ ...mmFieldLabel, fontSize: 9, letterSpacing: '0.16em' }}>
                      WhatsApp message
                    </label>
                    <textarea
                      value={item.msg}
                      onChange={e => setItemFld(cat.id, item.id, 'msg', e.target.value)}
                      placeholder="Pre-filled message when tapped..."
                      rows={2}
                      style={{
                        ...mmInput,
                        fontSize: 13,
                        resize: 'none',
                        lineHeight: 1.5,
                      }}
                      className="mm-input"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Add item */}
            <button
              onClick={() => addItem(cat.id)}
              style={{ ...mmGhostBtn, marginTop: 14, display: 'block' }}
            >
              + add item
            </button>
          </div>
        ))}
      </div>

      {/* Add category */}
      <button onClick={addCat} style={{ ...mmGhostBtn, marginTop: 20, display: 'block' }}>
        + add category
      </button>

      {/* ════════ SUBMIT ════════ */}
      <button style={{
        display: 'block',
        width: '100%',
        marginTop: 52,
        background: MM_INK,
        color: MM_BEIGE,
        border: 'none',
        fontFamily: MM_FONT,
        fontSize: 17,
        padding: '15px 0',
        cursor: 'pointer',
        letterSpacing: '0.04em',
        boxSizing: 'border-box',
        borderRadius: 0,
      }}>
        {editMode ? 'Save changes' : 'Create MeetMe'}
      </button>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────
// TASK B — Done Screen  (after submit)
// ─────────────────────────────────────────────────────────────

function DoneScreen() {
  const [shareOk, setShareOk] = React.useState(false);
  const [editOk,  setEditOk]  = React.useState(false);

  const handleCopy = (which) => {
    if (which === 'share') { setShareOk(true); setTimeout(() => setShareOk(false), 1800); }
    else                   { setEditOk(true);  setTimeout(() => setEditOk(false),  1800); }
  };

  const LinkRow = ({ url, copied, which }) => (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: 12,
      borderBottom: `1px solid ${MM_DIVIDER}`,
    }}>
      <span style={{ fontFamily: MM_FONT, fontSize: 15, color: MM_INK }}>{url}</span>
      <button
        onClick={() => handleCopy(which)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontFamily: MM_FONT,
          fontSize: 12,
          color: copied ? MM_MUTED : MM_INK,
          textDecoration: 'underline',
          textUnderlineOffset: '2px',
          padding: 0,
          minWidth: 36,
          transition: 'color 0.2s',
        }}
      >
        {copied ? 'copied' : 'copy'}
      </button>
    </div>
  );

  return (
    <div style={{
      background: MM_BEIGE,
      fontFamily: MM_FONT,
      padding: '52px 28px 48px',
      boxSizing: 'border-box',
      width: 375,
    }}>

      <h1 style={{
        fontFamily: MM_FONT,
        fontSize: 26,
        fontWeight: 400,
        color: MM_INK,
        margin: '0 0 52px',
        letterSpacing: '-0.01em',
        lineHeight: 1.25,
      }}>
        Your MeetMe<br />is ready.
      </h1>

      {/* Share link */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ ...mmSectionLabel, marginBottom: 12 }}>Share link</div>
        <LinkRow url="meetme.co/martin" copied={shareOk} which="share" />
      </div>

      {/* Edit link */}
      <div>
        <div style={{ ...mmSectionLabel, marginBottom: 12 }}>Edit link</div>
        <LinkRow url="meetme.co/edit/a8f3k2..." copied={editOk} which="edit" />
        <p style={{
          fontFamily: MM_FONT,
          fontSize: 12,
          color: MM_MUTED,
          margin: '10px 0 0',
          lineHeight: 1.6,
        }}>
          Save your edit link — you won't be able to recover it.
        </p>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────

Object.assign(window, { ProfileScreen, CreateFormScreen, DoneScreen });
