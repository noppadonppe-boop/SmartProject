// Shared layout geometry. The Gantt bars and the S-Curve overlay both rely on
// COL_W to keep their X-axis (timeline) perfectly aligned.

export const COL_W = 56 // width of one month column (px)
export const ROW_H = 26 // height of one task row (px)
export const HEADER_H = 32 // timeline header height (px)
export const WBS_WIDTH = 400 // left WBS panel width (px)

// Bar colors by category group.
export const GROUP_COLORS = {
  eng: '#3b82f6', // engineering / procurement (blue)
  civil: '#22c55e', // local construction (green)
  equip: '#f59e0b', // equipment (amber)
  commission: '#f87171', // commissioning (red/pink)
}

export const GROUP_LABELS = {
  eng: 'Engineering & Procurement',
  civil: 'Local Construction',
  equip: 'Equipment for Installation',
  commission: 'Test Run & Commissioning',
}
