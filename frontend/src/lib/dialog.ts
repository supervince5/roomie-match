export function isOutsideDialog(point: { clientX: number; clientY: number }, rect: { left: number; right: number; top: number; bottom: number }) {
  return point.clientX < rect.left || point.clientX > rect.right || point.clientY < rect.top || point.clientY > rect.bottom;
}
