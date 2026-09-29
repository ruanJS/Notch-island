/**
 * Widget Service — camada entre UI e comandos Tauri.
 * README seção 41: somente services conhecem os comandos Tauri.
 * UI não chama invoke() diretamente.
 */
import { invokeNative } from '@shared/services/tauriRuntime';

export interface WidgetPosition {
  placement: NotchPlacement;
  monitor_id: string | null;
  edge: WidgetEdge;
  /** Deslocamento lógico/CSS ao longo da borda; X/Y nativos são derivados. */
  offset: number;
}

export type NotchPlacement = 'RIGHT_CENTER' | 'LEFT_CENTER' | 'TOP_CENTER' | 'BOTTOM_CENTER' | 'TOP_LEFT' | 'TOP_RIGHT' | 'BOTTOM_LEFT' | 'BOTTOM_RIGHT';

export type WidgetEdge = 'left' | 'right' | 'top' | 'bottom';

export interface WidgetBoundsRequest {
  /** Borda para a qual este layout foi medido; descarta medidas antigas. */
  edge: WidgetEdge;
  /**
   * CSS px lógicos do canvas transparente completo: hull do DOM + reserva
   * de shadow. O Rust faz exatamente uma conversão para pixels físicos.
   */
  width: number;
  height: number;
  /** Posição e tamanho do notch visível dentro do canvas transparente. */
  dock_left: number;
  dock_top: number;
  dock_width: number;
  dock_height: number;
}

const widgetService = {
  async getPosition(): Promise<WidgetPosition> {
    return invokeNative<WidgetPosition>('get_widget_position', undefined, () => {
      const saved = window.localStorage.getItem('notchly:widget-position');
      return saved
        ? JSON.parse(saved) as WidgetPosition
        : { placement: 'RIGHT_CENTER', monitor_id: null, edge: 'right', offset: 0 };
    });
  },

  async updateBounds(request: WidgetBoundsRequest): Promise<WidgetPosition> {
    return invokeNative<WidgetPosition>('update_widget_bounds', { request }, () => ({
      monitor_id: null,
      placement: 'RIGHT_CENTER',
      edge: 'right',
      offset: 0,
    }));
  },

  async setPlacement(placement: NotchPlacement): Promise<WidgetPosition> {
    return invokeNative<WidgetPosition>('set_widget_placement', { request: { placement } }, () => ({
      placement,
      monitor_id: null,
      edge: placement.startsWith('TOP') ? 'top' : placement.startsWith('BOTTOM') ? 'bottom' : placement.startsWith('LEFT') ? 'left' : 'right',
      offset: 0,
    }));
  },

  async placeFromPointer(x: number, y: number): Promise<WidgetPosition> {
    return invokeNative<WidgetPosition>('place_widget_from_pointer', { request: { x, y } }, () => this.getPosition());
  },

  async beginPlacement(): Promise<void> {
    return invokeNative<void>('begin_widget_placement', undefined, () => undefined);
  },

  async show(): Promise<void> {
    return invokeNative('show_widget', undefined, () => undefined);
  },

  async hide(): Promise<void> {
    return invokeNative('hide_widget', undefined, () => undefined);
  },

  async openSettings(): Promise<void> {
    return invokeNative('open_settings', undefined, () => {
      window.location.assign('/?window=settings');
    });
  },
};

export default widgetService;
