import React from 'react';
import {
    FaQuestionCircle,
    FaCog,
    FaInstagram,
    FaTwitter,
} from 'react-icons/fa';
import {
    Container,
    Header,
    HelpIcon,
    SettingsIcon,
    Title,
    Main,
    Button,
    Footer,
    FooterLink,
    Socials,
} from './App.styles';

const App: React.FC = () => {
    return (
        <Container>
            <Header>
                <HelpIcon><FaQuestionCircle /></HelpIcon>
                <SettingsIcon><FaCog /></SettingsIcon>
            </Header>

            <Main>
                <Title>Snakescrabble</Title>
                <Button variant="primary">New Game</Button>
                <Button variant="secondary">Mode : Single</Button>
                <Button variant="secondary">Level : Easy</Button>
                <Button variant="dark">Invite Player</Button>
            </Main>

            <Footer>
                <FooterLink href="#">Contact</FooterLink>
                <FooterLink href="#">Privacy Policy</FooterLink>
                <Socials>
                    <a href="#"><FaInstagram /></a>
                    <a href="#" style={{ marginLeft: 12 }}><FaTwitter /></a>
                </Socials>
            </Footer>
        </Container>
    );
};

export default App;
