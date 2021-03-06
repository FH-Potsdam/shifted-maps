import NextLink from 'next/link';
import { lighten, transparentize } from 'polished';
import { StatelessComponent } from 'react';
import styled from 'styled-components';
import Heading from '../common/Heading';
import { Icon, Logo } from '../common/icons/components';
import FHPLogo from '../common/icons/fhp.svg';
import GoIcon from '../common/icons/go.svg';
import HereLogo from '../common/icons/here.svg';
import UCLabLogo from '../common/icons/uclab.svg';
import Layout, { LayoutItem } from '../common/Layout';
import Link from '../common/Link';
import Paragraph from '../common/Paragraph';

interface HeroProps {
  className?: string;
}

const Hero: StatelessComponent<HeroProps> = props => {
  const { className } = props;

  return (
    <div className={className}>
      <HeroHeader>
        <Heading>Shifted Maps</Heading>
        <Paragraph lead>Visualizing personal Movement through Map Networks</Paragraph>
      </HeroHeader>
      <HeroHighlight>
        <NextLink href="/map">
          <HeroGo>
            Explore the
            <br />
            Demo
          </HeroGo>
        </NextLink>
      </HeroHighlight>
      <HeroBottom>
        <HeroSection as={HeroPaper}>
          <Layout>
            <LayoutItem span="6">
              <HeroDownload href="/static/downloads/ShiftedMaps_Poster_IEEE_2015.pdf" download>
                <Icon as={GoIcon} /> Poster IEEE VIS 2015
                <em>877 KB</em>
              </HeroDownload>
            </LayoutItem>
            <LayoutItem span="6">
              <HeroDownload href="/static/downloads/ShiftedMaps_Paper_IEEE_2018_VISAP.pdf" download>
                <Icon as={GoIcon} /> Paper IEEE VIS / VISAP 2018
                <em>4.9 MB</em>
              </HeroDownload>
            </LayoutItem>
          </Layout>
        </HeroSection>
        <HeroSection as={HeroCredits}>
          <p>
            Shifted Maps is a student research project by{' '}
            <Link href="https://www.lennerd.com">Lennart Hildebrandt</Link> and{' '}
            <Link href="http://www.heikeotten.de">Heike Otten</Link> conducted at the Urban Complexity Lab, University
            of Applied Sciences Potsdam.
          </p>
          <p>
            The source code of this project is available under GPL-3.0 at{' '}
            <Link href="https://github.com/FH-Potsdam/shifted-maps">Github (FH-Potsdam/shifted-maps)</Link>.
          </p>
        </HeroSection>
        <HeroSection as={HeroPartner}>
          <Layout>
            <LayoutItem span="3">
              <Link href="https://www.fh-potsdam.de">
                <Logo as={FHPLogo} />
              </Link>
            </LayoutItem>
            <LayoutItem span="5">
              <Link href="https://uclab.fh-potsdam.de">
                <Logo as={UCLabLogo} />
              </Link>
            </LayoutItem>
            <LayoutItem span="3">
              <Link href="https://here.com">
                <Logo as={HereLogo} />
              </Link>
            </LayoutItem>
          </Layout>
        </HeroSection>
      </HeroBottom>
    </div>
  );
};

export default styled(Hero)`
  background-color: rgba(255, 255, 255, 0.7);
  padding: ${props => props.theme.spacingUnit * 2}px;
  padding-top: ${props => props.theme.spacingUnit * 3}px;
  min-height: 100vh;

  @media (min-width: 47em) {
    position: absolute;
    height: 100%;
    top: 0;
    right: ${props => props.theme.spacingUnit * 7}px;
    width: ${props => props.theme.spacingUnit * 20}px;
    background-color: rgba(255, 255, 255, 0.9);
  }

  h1 {
    font-size: ${props => props.theme.fontSizeHero}px;
  }

  @media (min-width: 47em) and (min-height: 47em) {
    right: 0;
  }
`;

const HeroHeader = styled.header`
  @media (min-width: 35em) {
    width: 60%;
  }

  @media (min-width: 47em) {
    width: auto;
  }
`;

const HeroHighlight = styled(Paragraph)`
  position: relative;
`;

const HeroBottom = styled.div`
  margin-top: ${props => props.theme.spacingUnit * 12}px;

  @media (min-width: 35em) {
    margin-top: ${props => props.theme.spacingUnit * 4}px;
  }

  @media (min-width: 47em) {
    margin-top: 0;
    position: absolute;
    bottom: 0;
    width: 100%;
    left: 0;
    padding: ${props => props.theme.spacingUnit * 2}px;
  }
`;

const HeroSection = styled.div`
  & + & {
    margin-top: ${props => props.theme.spacingUnit}px;
  }
`;

const HeroGo = styled(Link)`
  display: flex;
  position: absolute;
  height: 140px;
  width: 140px;
  justify-content: center;
  align-items: center;
  right: -10px;
  top: 0px;
  text-align: center;
  font-weight: 900;
  transform: rotate(-10deg);
  background-color: ${props => props.theme.highlightColor};
  color: white;
  border-radius: 50%;
  line-height: 1.3;
  box-shadow: 0 3px 7px rgba(0, 0, 0, 0.2);
  font-size: ${props => props.theme.fontSizeBig}px;
  padding-top: 10px;

  &:hover {
    color: white;
  }

  @media (min-width: 35em) {
    top: -80px;
    right: 0;
  }

  @media (min-width: 47em) {
    top: -100px;
    right: -110px;
  }

  @media (min-width: 47em) and (min-height: 47em) {
    top: 0;
    right: 0;
  }

  @media (min-width: 50em) and (min-height: 50em) {
    top: 30px;
  }
`;

const HeroDownload = styled(Link)`
  display: block;

  ${Icon} {
    display: block;
    font-size: ${props => props.theme.spacingUnit * 2}px;
    margin-bottom: ${props => props.theme.spacingUnit * 0.5}px;
    transform: rotate(90deg);
  }

  em {
    display: block;
    font-size: ${props => props.theme.fontSizeSmall}px;
  }
`;

const HeroCredits = styled.div`
  font-size: ${props => props.theme.fontSizeSmall}px;
  font-style: italic;
  opacity: 0.6;

  ${HeroSection} + & {
    margin-top: ${props => props.theme.spacingUnit * 2}px;
  }

  a {
    color: ${props => props.theme.foregroundColor};
    transition: border-bottom 400ms;
    border-bottom: 1px solid ${props => lighten(0.6, props.theme.foregroundColor)};

    &:hover {
      border-bottom-color: ${props => lighten(0.4, props.theme.foregroundColor)};
    }
  }

  p + p {
    margin-top: ${props => props.theme.spacingUnit * 0.5}px;
  }
`;

const HeroPaper = styled.div`
  max-width: 310px;
`;

const HeroPartner = styled.div`
  align-items: center;
  max-width: 320px;

  ${HeroSection} + & {
    margin-top: ${props => props.theme.spacingUnit * 2}px;
  }

  ${Link} {
    color: ${props => transparentize(0.4, props.theme.foregroundColor)};

    &:hover {
      color: ${props => props.theme.highlightColor};
    }
  }
`;
