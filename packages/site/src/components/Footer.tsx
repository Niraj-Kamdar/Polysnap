import styled, { useTheme } from 'styled-components';
import { ReactComponent as MetaMaskFox } from '../assets/metamask_fox.svg';
import { ReactComponent as PolywrapLogo } from '../assets/polywrap.svg';
import { ReactComponent as IpfsLogo } from '../assets/ipfs-logo.svg';
import { MetaMask } from './MetaMask';
import { PoweredBy } from './PoweredBy';

const FooterWrapper = styled.footer`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding-top: 2.4rem;
  padding-bottom: 2.4rem;
  border-top: 1px solid ${(props) => props.theme.colors.border.default};
`;

const PoweredByButton = styled.a`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 1.2rem;
  margin: 1.2rem;
  border-radius: ${({ theme }) => theme.radii.button};
  box-shadow: ${({ theme }) => theme.shadows.button};
  background-color: ${({ theme }) => theme.colors.background.alternative};
`;

const PoweredByContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 1rem;
`;

const BrandText = styled.p`
  color: white;

  a:link {
    color: white;
    text-decoration: none;
  }

  /* visited link */
  a:visited {
    color: white;
    text-decoration: none;
  }

  /* mouse over link */
  a:hover {
    color: white;
    text-decoration: none;
  }

  /* selected link */
  a:active {
    color: white;
    text-decoration: none;
  }
`;

export const Footer = () => {
  const theme = useTheme();

  return (
    <FooterWrapper>
      <PoweredByButton href="https://docs.metamask.io/" target="_blank">
        <MetaMaskFox />
        <PoweredByContainer>
          <PoweredBy color={theme.colors.text.muted} />
          <BrandText>METAMASK</BrandText>
        </PoweredByContainer>
      </PoweredByButton>
      <PoweredByButton href="https://polywrap.io/" target="_blank">
        <PolywrapLogo />
        <PoweredByContainer>
          <PoweredBy color={theme.colors.text.muted} />
          <BrandText>POLYWRAP</BrandText>
        </PoweredByContainer>
      </PoweredByButton>
      <PoweredByButton href="https://polywrap.io/" target="_blank">
        <IpfsLogo />
        <PoweredByContainer>
          <PoweredBy color={theme.colors.text.muted} />
          <BrandText>IPFS</BrandText>
        </PoweredByContainer>
      </PoweredByButton>
    </FooterWrapper>
  );
};
