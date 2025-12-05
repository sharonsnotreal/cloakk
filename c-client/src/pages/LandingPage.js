// import React from 'react';
// import styled from 'styled-components';
// import { useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';

// const PageContainer = styled.div`
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   min-height: 100vh;
//   padding: 2rem;
// `;





// const LogoImage = styled.img`
//   width: 250px;
//   height: auto;
// `;

// const AppName = styled.h1`
//   position: absolute;
//   color: white;
//   font-size: 3.5rem;
//   font-weight: 700;
//   margin: 0;
// `;



// const ActionButton = styled.button`
//   background: ${({ theme }) => theme.black};
//   color: ${({ theme }) => theme.white};
//   border: none;
//   border-radius: 8px;
//   padding: 0.8rem 1.5rem;
//   font-size: 1rem;
//   font-weight: 500;
//   cursor: pointer;
//   align-self: flex-start;
//   transition: opacity 0.2s;
//   &:hover {
//     opacity: 0.8;
//   }
// `;

// const LandingPage = () => {
//   const navigate = useNavigate();

//   return (
//     <PageContainer>
//       <MainCard initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
//         <LeftPanel>
//           <LogoImage src="/cloakk.png" alt="Cloakk Logo" />
//           {/* <AppName>Cloakk</AppName> */}
//         </LeftPanel>
//         <RightPanel>
//           <Description>
//             Cloakk is a secure, anonymous submission platform designed for organizations to receive sensitive tips, reports, or files from insiders — without compromising their identity.
//           </Description>
//           <Description>
//             Whether you’re reporting misconduct, raising a concern, or just speaking up, your submission remains encrypted, protected, and untraceable.
//           </Description>
//           <Description>
//             <strong>Your identity is not recorded, stored, or required.</strong>
//           </Description>
//           <ActionButton onClick={() => navigate('/submit')}>
//             make a submission
//           </ActionButton>
//         </RightPanel>
//       </MainCard>
//     </PageContainer>
//   );
// };

// export default LandingPage;
import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const PageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: clamp(1rem, 3vw, 4rem);
`;

/* Main card: row on larger screens, column on small screens */
const MainCard = styled(motion.div)`
  background: ${({ theme }) => theme.white};
  border-radius: ${({ theme }) => theme.borderRadius || '12px'};
  border: 1px solid ${({ theme }) => theme.borderColor || '#e6e6e6'};
  display: flex;
  width: 100%;
  max-width: 1100px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(13, 16, 30, 0.06);

  /* Mobile: stack panels */
  @media (max-width: 768px) {
    flex-direction: column;
    border-radius: 10px;
  }
`;


/* Left panel: visually distinct background, centers logo */
const LeftPanel = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1.25rem, 3.5vw, 4rem);
  position: relative;
  // background: linear-gradient(135deg, #0b5cff 0%, #5ea1ff 100%);
  color: white;
  min-height: 280px;

  /* Make sure left panel doesn't become too short on very small screens */
  @media (max-width: 420px) {
    padding: 1rem;
    min-height: 200px;
  }
`;

/* Responsive logo scaling */
const LogoImage = styled.img`
  width: clamp(110px, 22vw, 260px);
  height: auto;
  display: block;
  max-width: 80%;
`;

/* Optional app name overlaid on left panel (kept but responsive) */
const AppName = styled.h1`
  position: absolute;
  bottom: clamp(1rem, 2.2vw, 2.5rem);
  left: clamp(1rem, 2.5vw, 2.5rem);
  color: white;
  font-size: clamp(1.1rem, 2.6vw, 2rem);
  font-weight: 700;
  margin: 0;
  text-shadow: 0 4px 18px rgba(0,0,0,0.18);
  pointer-events: none;

  @media (max-width: 420px) {
    position: static;
    margin-top: 0.75rem;
    text-align: center;
  }
`;

/* Right panel: content area */
const RightPanel = styled.div`
  flex: 1;
  background: ${({ theme }) => theme.rightPanelBg || '#F9FAFB'};
  padding: clamp(1.25rem, 3.5vw, 4rem);
  display: flex;
  flex-direction: column;
  justify-content: center;
`;


/* Paragraphs scale slightly and have improved spacing */
const Description = styled.p`
  font-size: clamp(0.95rem, 0.9rem + 0.4vw, 1.05rem);
  line-height: 1.6;
  color: ${({ theme }) => theme.darkGrey };
  margin-bottom: 2rem;
  margin-top: 0;
`;

/* CTA button: becomes full width on small screens */
const ActionButton = styled.button`
  background: ${({ theme }) => theme.black || '#000'};
  color: ${({ theme }) => theme.white || '#fff'};
  border: none;
  border-radius: 10px;
  padding: 0.85rem 1.25rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  align-self: flex-start;
  transition: opacity 0.18s ease, transform 0.12s ease;
  &:hover {
    opacity: 0.92;
    transform: translateY(-1px);
  }

  /* Full width and centered on small screens */
  @media (max-width: 768px) {
    width: 100%;
    align-self: stretch;
    text-align: center;
    padding: 0.9rem 1rem;
    margin-top: 0.5rem;
  }
`;

/* small helper to center CTAs on larger layouts if needed */
const CTAWrapper = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  align-items: center;

  @media (max-width: 420px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <MainCard
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        aria-label="Cloakk landing"
      >
        <LeftPanel>
          <LogoImage src="/cloakk.png" alt="Cloakk Logo" />
          {/* Keep the app name visible on larger screens; it will adapt on small screens */}
          <AppName>Cloakk</AppName>
        </LeftPanel>

        <RightPanel>
          <Description>
            Cloakk is a secure, anonymous submission platform designed for organizations to receive sensitive tips, reports, or files from insiders — without compromising their identity.
          </Description>

          <Description>
            Whether you’re reporting misconduct, raising a concern, or just speaking up, your submission remains encrypted, protected, and untraceable.
          </Description>

          <Description style={{ marginBottom: 0 }}>
            <strong>Your identity is not recorded, stored, or required.</strong>
          </Description>

          <CTAWrapper>
            <ActionButton onClick={() => navigate('/submit')} aria-label="Make a submission">
              Make a submission
            </ActionButton>
          </CTAWrapper>
        </RightPanel>
      </MainCard>
    </PageContainer>
  );
};

export default LandingPage;