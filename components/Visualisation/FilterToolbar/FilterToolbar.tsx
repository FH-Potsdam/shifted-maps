import classNames from 'classnames';
import { observer } from 'mobx-react';
import NextLink from 'next/link';
import { MouseEvent, useCallback, useState } from 'react';
import useDisableBodyScroll from '../../../hooks/useDIsableBodyScroll';
import DataStore from '../../../stores/DataStore';
import UIStore, { VIEW } from '../../../stores/UIStore';
import Heading from '../../common/Heading';
import { Icon, StrokeIcon } from '../../common/icons/components';
import DownIcon from '../../common/icons/down.svg';
import styled from '../../styled';
import { DEVICE } from '../Visualisation';
import { getActiveViewItem } from './config';
import TimeSection from './TimeSection';
import ViewSection from './ViewSection';

interface FilterBarProps {
  className?: string;
  data: DataStore;
  ui: Readonly<UIStore>;
  device: DEVICE;
  onViewChange: (view?: VIEW) => void;
  onTimeSpanChange: (timeSpan: ReadonlyArray<number>) => void;
}

const FilterBar = observer((props: FilterBarProps) => {
  const { className, device, ui, data, onViewChange, onTimeSpanChange } = props;

  const mobileOrTablet = device === DEVICE.mobile || device === DEVICE.tablet;
  const [collapsed, setCollapsed] = useState(true);
  const ref = useDisableBodyScroll<HTMLDivElement>();
  const activeViewItem = getActiveViewItem(ui.view);

  const handleHeadingClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (!mobileOrTablet) {
        return;
      }

      event.stopPropagation();
      event.preventDefault();
      setCollapsed(!collapsed);
    },
    [mobileOrTablet, collapsed]
  );

  return (
    <div className={classNames(className, { collapsed: mobileOrTablet && collapsed })} ref={ref}>
      <NextLink href="/">
        <HeadlingLink onClick={handleHeadingClick}>
          <Heading as="h1">
            <span>
              {mobileOrTablet && activeViewItem.icon}
              Shifted Maps
            </span>
            {mobileOrTablet && <StrokeIcon as={DownIcon} />}
          </Heading>
        </HeadlingLink>
      </NextLink>
      <ViewSection onViewChange={onViewChange} activeViewItem={activeViewItem} />
      <TimeSection ui={ui} data={data} onTimeSpanChange={onTimeSpanChange} />
    </div>
  );
});

export default styled(FilterBar)`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto auto;
  grid-template-areas: 'heading' 'view' 'time';
  grid-column-gap: ${props => props.theme.spacingUnit * 1.25}px;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 0 ${props => props.theme.spacingUnit * 1.25}px;
  padding-bottom: ${props => props.theme.spacingUnit * 1.5}px;
  width: 100%;
  position: absolute;
  z-index: 1;
  left: 0;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);

  ${Heading} {
    font-size: ${props => props.theme.fontSizeBig}px;
    height: ${props => props.theme.spacingUnit * 3}px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;

    ${Icon} {
      margin-right: ${props => props.theme.spacingUnit}px;
    }
  }

  ${StrokeIcon} {
    transition: transform ${props => props.theme.shortTransitionDuration};
    transform: rotateX(180deg);
  }

  &.collapsed {
    height: ${props => props.theme.spacingUnit * 3}px;
    top: 0;

    ${StrokeIcon} {
      transform: rotateX(0deg);
    }
  }

  @media (min-width: 440px) {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto auto;
    grid-template-areas: 'heading heading' 'view time' 'view time';
    padding-left: ${props => props.theme.spacingUnit * 1.5}px;
    padding-right: ${props => props.theme.spacingUnit * 1.5}px;

    ${Heading} {
      height: ${props => props.theme.spacingUnit * 3.5}px;
    }

    &.collapsed {
      height: ${props => props.theme.spacingUnit * 3.5}px;
    }
  }

  @media (min-width: 580px) {
    display: block;
    padding: ${props => props.theme.spacingUnit * 1.5}px ${props => props.theme.spacingUnit * 1.25}px;
    top: ${props => props.theme.spacingUnit}px;
    left: ${props => props.theme.spacingUnit}px;
    width: ${props => props.theme.spacingUnit * 16}px;
    height: auto;
    max-height: calc(100% - ${props => props.theme.spacingUnit * 2}px);
    overflow: auto;

    ${Heading} {
      height: auto;
    }
  }
`;

const HeadlingLink = styled.a`
  text-decoration: none;
  grid-area: heading;
`;
