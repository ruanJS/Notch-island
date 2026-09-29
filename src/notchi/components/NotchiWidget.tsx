/**
 * NotchiWidget — Componente visual do mascote Notchi com o avatar 3D oficial.
 */
import { resolveNotchiState, NOTCHI_EMOJI, NOTCHI_MESSAGES } from '../domain/NotchiStateResolver';
import notchiImg from '@assets/notchi.png';

interface Props {
  maxPercentage: number;
}

export default function NotchiWidget({ maxPercentage }: Props) {
  const state = resolveNotchiState(maxPercentage);
  const emoji = NOTCHI_EMOJI[state];
  const message = NOTCHI_MESSAGES[state];

  return (
    <div className="notchi-widget" title={`${emoji} ${message}`}>
      <div className={`notchi-avatar notchi-avatar--${state}`}>
        <img
          src={notchiImg}
          alt="Notchi"
          style={{
            width: '24px',
            height: '24px',
            objectFit: 'contain',
            filter: state === 'critical' || state === 'exhausted' ? 'hue-rotate(320deg)' : 'none',
          }}
        />
      </div>
      <div className="notchi-bubble">
        <span className="notchi-text">{message}</span>
      </div>
    </div>
  );
}
