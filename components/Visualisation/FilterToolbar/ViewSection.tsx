import { observer } from 'mobx-react';
import { transparentize } from 'polished';

import { VIEW } from '../../../stores/UIStore';
import styled from '../../styled';
import { IViewItem, VIEW_LIST } from './config';
import ViewButton from './ViewButton';

interface IProps {
  className?: string;
  onViewChange: (view?: VIEW) => void;
  activeViewItem: IViewItem;
}

const ViewSection = observer((props: IProps) => {
  const { className, activeViewItem, onViewChange } = props;

  return (
    <section className={className}>
      <ViewList>
        {VIEW_LIST.map((viewItem, index) => (
          <ViewButton
            key={index}
            onClick={onViewChange}
            active={activeViewItem === viewItem}
            viewItem={viewItem}
          />
        ))}
      </ViewList>
      <ViewInfo>
        <ViewName>{activeViewItem.name}</ViewName>
        <ViewText>{activeViewItem.text}</ViewText>
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
