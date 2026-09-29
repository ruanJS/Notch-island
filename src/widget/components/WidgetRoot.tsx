/**
 * WidgetRoot — Raiz da janela do widget lateral.
 */
import '../widget.css';
import WidgetContainer from './WidgetContainer';

export default function WidgetRoot() {
  return (
    <div className="widget-root">
      <WidgetContainer />
    </div>
  );
}
