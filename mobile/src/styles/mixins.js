// import { fixedHeight, fixedWidth, gridProps, grid } from './mixins'

export const fixedHeight = (height) => ({
  height,
  maxHeight: height,
  minHeight: height,
})

export const fixedWidth = (width) => ({
  width,
  maxWidth: width,
  minWidth: width,
})

export const grid = ({
  cols = 1,
  columnGap = 0,
  rowGap = columnGap,
  gap = 0,
}) => {
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    rowGap: rowGap || gap,
    columnGap: columnGap || gap,
  };
}
