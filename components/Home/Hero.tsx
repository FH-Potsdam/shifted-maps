import NextLink from 'next/link';
import use from 'reuse';
import { lighten } from 'polished';
import { StatelessComponent } from 'react';

import Paragraph from '../common/Paragraph';
import Icon from '../common/Icon';
import styled, { mediaQuery } from '../styled';
import Layout, { LayoutItem } from '../common/Layout';
import Link from '../common/Link';
import Heading from '../common/Heading';

type Props = {
  className?: string;
};

const Hero: StatelessComponent<Props> = props => {
  const { className } = props;

  return (
    <div className={className}>
      <Heading>Shifted Maps</Heading>
      <Paragraph lead>Visualizing personal Movement through Map Networks</Paragraph>
      <HeroHighlight>
        <NextLink href="map" prefetch>
          <HeroGo>
            Test the Demo <Icon name="go" />
          </HeroGo>
        </NextLink>
      </HeroHighlight>
      <HeroBottom>
        <HeroSectionLayout>
          <LayoutItem span="4">
            <HeroDownload href="/static/downloads/ShiftedMaps_Paper_V2.pdf">
              <Icon name="go" /> Paper <em>874 KB</em>
            </HeroDownload>
          </LayoutItem>
          <LayoutItem span="4">
            <HeroDownload href="/static/downloads/ShiftedMaps_Plakat.pdf">
              <Icon name="go" /> Poster <em>4.8 MB</em>
            </HeroDownload>
          </LayoutItem>
        </HeroSectionLayout>
        <HeroCreditsSection>
          Shifted Maps is a student research project by{' '}
          <Link href="http://www.lennerd.com">Lennart Hildebrandt</Link> and{' '}
          <Link href="http://www.heikeotten.de">Heike Otten</Link> at the Urban Complexity Lab,
          University of Applied Sciences Potsdam.
        </HeroCreditsSection>
        <HeroSectionLayout>
          <LayoutItem span="2">
            <Link href="http://www.fh-potsdam.de">
              <HeroLogo
                src="/static/images/fhp-logo.png"
                alt="Logo of the University of Applied Science Potsdam"
              />
            </Link>
          </LayoutItem>
          <LayoutItem span="6">
            <Link href="http://uclab.fh-potsdam.de">
              <HeroLogo
                src="/static/images/uclab-logo.png"
                alt="Logo of the Urban Complexity Lab"
              />
            </Link>
          </LayoutItem>
          <LayoutItem span="3">
            <Link href="http://here.com">
              <HeroLogo src="/static/images/here-logo.png" alt="Logo of Micrsoft HERE" />
            </Link>
          </LayoutItem>
        </HeroSectionLayout>
      </HeroBottom>
    </div>
  );
};

export default styled(Hero)`
  background-color: rgba(255, 255, 255, 0.7);
  padding: ${props => props.theme.spacingUnit * 2}px;
  padding-top: ${props => props.theme.spacingUnit * 3}px;

  ${mediaQuery<Props>('tablet')` 
    position: absolute;
    height: 100%;
    top: 0;
    right: 0;
    width: ${props => props.theme.spacingUnit * 20}px;
    background-color: rgba(white, .9);
  `};

  h1 {
    font-size: ${props => props.theme.fontSizeHero}px;
  }
`;

const HeroHighlight = styled(Paragraph)`
  margin-top: ${props => props.theme.spacingUnit * 2}px;
`;

const HeroBottom = styled.div`
  margin-top: ${props => props.theme.spacingUnit * 8}px;

  ${mediaQuery<Props>('tablet')`
    margin-top: 0;
    position: absolute;
    bottom: 0;
    width: 100%;
    left: 0;
    padding: ${props => props.theme.spacingUnit * 2}px;
  `};
`;

const HeroSection = styled(use('div'))`
  & + & {
    margin-top: ${props => props.theme.spacingUnit}px;
  }
`;

const HeroSectionLayout = use(HeroSection, Layout);

const HeroGo = styled(Link)`
  display: block;
  line-height: ${props => props.theme.spacingUnit * 2}px;

  ${Icon} {
    font-size: ${props => props.theme.spacingUnit * 2}px;
    vertical-align: middle;
    margin-left: ${props => props.theme.spacingUnit}px;
    float: right;
  }

  & + & {
    margin-top: $inuit-base-spacing-unit;
  }
`;

const HeroDownload = styled(Link)`
  display: block;

  ${Icon} {
    display: block;
    font-size: ${props => props.theme.spacingUnit * 2}px;
    margin-bottom: ${props => props.theme.spacingUnit * 0.5}px;

    &:before {
      display: inline-block;
      transform: rotate(90deg);
    }
  }

  em {
    display: block;
    font-size: ${props => props.theme.fontSizeSmall}px;
  }
`;

const HeroCredits = styled(use('div'))`
  font-size: ${props => props.theme.fontSizeSmall}px;
  font-style: italic;
  opacity: 0.75;

  a {
    color: ${props => props.theme.foregroundColor};
    transition: border-bottom 400ms;
    border-bottom: 1px solid ${props => lighten(0.6, props.theme.foregroundColor)};

    &:hover {
      border-bottom-color: ${props => lighten(0.4, props.theme.foregroundColor)};
    }
  }
`;

const HeroCreditsSection = use(HeroCredits, HeroSection);

const HeroLogo = styled.img`
  height: 65px;
`;
