import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, IconButton, Box } from '@mui/material';
import { Rocket, X, AlertTriangle } from 'lucide-react';
import { keyframes } from '@emotion/react';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const EarlyAccessPopup: React.FC = () => {
  const [open, setOpen] = React.useState(true);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="early-access-dialog-title"
      PaperProps={{
        sx: {
          animation: `${fadeIn} 0.5s ease-in-out`,
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: '#1a202c',
          color: 'white',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
        },
      }}
    >
      <DialogTitle
        id="early-access-dialog-title"
        sx={{
          backgroundColor: '#1a202c',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          padding: '16px 24px',
          borderBottom: 'none',
          fontSize: '1.2rem',
          fontWeight: 'bold',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Rocket size={24} style={{ color: '#80d8ff' }} />
          Welcome to Early Access!
        </Box>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            color: '#b0bec5',
            '&:hover': { color: '#ffffff' },
          }}
        >
          <X size={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ background: '#1a202c', padding: '20px 24px', color: '#b0bec5' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '20px' }}>
          <AlertTriangle size={24} color="#ffb300" style={{ flexShrink: 0 }} />
          <Typography variant="body1" sx={{ color: '#b0bec5', lineHeight: 1.6 }}>
            We're thrilled to have you join us in this exciting early phase of our Live Map project! As we're still in the early stages of development, you might encounter some bugs or features that aren't quite polished yet.
          </Typography>
        </Box>

        <Typography variant="h6" sx={{ color: '#80d8ff', marginBottom: '10px', fontWeight: 'bold' }}>
          What to expect:
        </Typography>
        <ul style={{ marginLeft: '20px', lineHeight: 1.6, color: '#b0bec5', padding: 0, listStyle: 'none' }}>
          <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0ea5e9', marginRight: '10px', flexShrink: 0 }} />
            Regular updates and improvements
          </li>
          <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0ea5e9', marginRight: '10px', flexShrink: 0 }} />
            New features being added frequently
          </li>
          <li style={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0ea5e9', marginRight: '10px', flexShrink: 0 }} />
            Your feedback shaping the future of the project
          </li>
        </ul>

        <Typography variant="body2" sx={{ color: '#9e9e9e', marginTop: '20px', fontStyle: 'italic', textAlign: 'left' }}>
          Thank you for being part of this journey! Your patience and feedback are invaluable to us.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ background: '#1a202c', padding: '16px 24px', justifyContent: 'flex-end' }}>
        <Button
          onClick={handleClose}
          variant="contained"
          sx={{
            background: '#007bff',
            color: 'white',
            boxShadow: 'none',
            textTransform: 'none',
            fontWeight: 'normal',
            padding: '8px 20px',
            fontSize: '0.9rem',
            '&:hover': { background: '#0056b3' },
          }}
        >
          Got it!
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EarlyAccessPopup; 