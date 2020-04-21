import styled from 'styled-components'
import flex from './flex'
import { fixedHeight, fixedWidth, grid } from './mixins'

const margin = {
  horizontal: 'marginRight',
  vertical: 'marginBottom',
};

// direction: 'horizontal' | 'vertical'
export const common = (direction) => p =>  ({
  ...(p.spaceBetween && flex.spaceBetween),
  ...(p.wrap && flex.wrap),
  ...(p.spaceAround && flex.spaceAround),
  ...(p.justifyEnd && flex.justifyEnd),
  ...(p.justifyStart && flex.justifyStart),
  ...(p.alignStart && flex.alignStart),
  ...(p.alignItemsStart && flex.alignItemsStart),
  ...(p.flex && { flex: p.flex }),
  ...(p.spaceFirst && {
      '& :first-child': { [margin[direction]]: `${p.spaceFirst}px !important` },
    }),
  ...(p.spaceAll && {
    '& > *': {
      [margin[direction]]: `${p.spaceAll}px !important`,
      ...(p.spaceBottom && { marginBottom: `${p.spaceAll}px !important` }),
    },
    '& > *:last-child': {
      [margin[direction]]: `0 !important`,
      ...(p.spaceBottom && { marginBottom: `0 !important` }),
    },
  }),
  ...(p.noShrink && {
    flexShrink: 0,
  }),
  ...(p.fullW && { width: '100%' }),
  ...(p.fullH && { height: '100%' }),
  ...(p.debug && { border: '1px solid red' }),
  ...(p.styles && p.styles),
})

const horizontalProps = props => {
  const { center, centerV, centerH } = props;
  return {
    ...flex.horizontal,
    ...(center && flex.centerHorizontal),
    ...(centerV && flex.centerHorizontalV),
    ...(centerH && flex.centerHorizontalH),
    ...common('horizontal')(props),
  }
}

const verticalProps = props => {
  const { center, centerV, centerH } = props;
  return {
    ...flex.vertical,
    ...(center && flex.centerVertical),
    ...(centerV && flex.centerVerticalV),
    ...(centerH && flex.centerVerticalH),
    ...common('vertical')(props),
  }
}

const getHorizontalProps = ({ invert = false, ...rest }) => {
  return invert === false ? horizontalProps(rest) : verticalProps(rest)
}

const getVerticalProps = ({ invert = false, ...rest }) => {
  return invert === false ? verticalProps(rest) : horizontalProps(rest)
}

const spaceUnit = 1

export const Space = styled.div(({ size = 1 }) => ({
  ...fixedHeight(spaceUnit * size),
  ...fixedWidth(spaceUnit * size),
}))

export const Horizontal = styled.div(getHorizontalProps)
export const Vertical = styled.div(getVerticalProps)
export const Grid = styled.div(grid)
