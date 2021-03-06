import classNames from 'classnames';
import { observer } from 'mobx-react';
import { MouseEvent, useCallback } from 'react';
import styled from 'styled-components';
import { VIEW } from '../../../stores/UIStore';
import { Icon } from '../../common/icons/components';
import { ViewItem } from './config';

interface ViewButtonProps {
  className?: string;
  active: boolean;
  viewItem: ViewItem;
  onClick: (view?: VIEW) => void;
}

const ViewButton = observer((props: ViewButtonProps) => {
  const { className, viewItem, onClick, active } = props;

  const handleClick = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();

      onClick(viewItem.type);
    },
    [viewItem.type, onClick]
  );

  return (
    <button className={classNames(className, { active })} onClick={handleClick}>
      {viewItem.icon}
    </button>
  );
});

export default styled(ViewButton)`
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
