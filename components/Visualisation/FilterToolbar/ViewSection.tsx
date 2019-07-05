import classNames from 'classnames';
import { observer } from 'mobx-react';
import { transparentize } from 'polished';
import { createElement, MouseEvent } from 'react';

import UIStore, { VIEW } from '../../../stores/UIStore';
import { Icon } from '../../common/icons/index';
import styled from '../../styled';
import { getActiveViewItem, VIEW_LIST } from './config';

interface IProps {
  className?: string;
  ui: UIStore;
  onViewChange: (view?: VIEW) => void;
}

const ViewSection = observer((props: IProps) => {
  const { className, ui, onViewChange } = props;

  const handleViewButtonClick = (event: MouseEvent<HTMLButtonElement>, view?: VIEW) => {
    event.stopPropagation();

    onViewChange(view);
  };

  const activeView = getActiveViewItem(ui.view);

  return (
    <section className={className}>
      <ViewList>
        {VIEW_LIST.map((viewItem, index) => (
          <ViewButton
            key={index}
            onClick={event => handleViewButtonClick(event, viewItem.type)}
            className={classNames({ active: activeView === viewItem })}
          >
            {createElement(viewItem.icon)}
          </ViewButton>
        ))}
      </ViewList>
      <ViewInfo>
        <ViewName>{activeView.name}</ViewName>
        <ViewText>{activeView.text}</ViewText>
      </ViewInfo>
    </section>
  );
});

export default styled(ViewSection)`
  grid-area: view;
  margin-top: ${props => props.theme.spacingUnit * 1.5}px;

  @media (min-width: 440px) {
    margin-top: ${props => props.theme.spacingUnit * 0.75}px;
  }

  @media (min-width: 580px) {
    margin-top: ${props => props.theme.spacingUnit * 1.5}px;
  }
`;

const ViewList = styled.div`
  display: flex;
  justify-content: space-between;

  @media (min-width: 440px) {
    justify-content: flex-start;
  }

  @media (min-width: 580px) {
    justify-content: space-between;
  }
`;

const ViewButton = styled.button`
  transition: color ${props => props.theme.shortTransitionDuration},
    transform ${props => props.theme.shortTransitionDuration};
  border: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  border-radius: 50%;
  cursor: pointer;
  color: ${props => props.theme.foregroundColor};
  padding: 0;
  background-color: white;
  transform: scale(1);
  box-shadow: 0 3px 7px rgba(0, 0, 0, 0.2);

  ${Icon} {
    width: 32px;
    height: 32px;
  }

  & + & {
    margin-left: ${props => props.theme.spacingUnit * 1}px;
  }

  &:hover,
  &.active {
    color: ${props => props.theme.highlightColor};
  }

  &:active,
  &.active {
    transform: scale(0.95);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
`;

const ViewInfo = styled.div`
  margin-top: ${props => props.theme.spacingUnit * 1}px;
`;

const ViewName = styled.strong`
  margin-right: ${props => props.theme.spacingUnit * 0.75}px;
  color: ${props => props.theme.highlightColor};
`;

const ViewText = styled.p`
  color: ${props => transparentize(0.4, props.theme.foregroundColor)};
`;
