import React, { createContext, useContext, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: "15px",
    padding: theme.spacing(2),
    width: "600px",
  },
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
}));

const StyledDialogActions = styled(DialogActions)(() => ({
  justifyContent: "center",
}));

const StyledTypography = styled(Typography)(() => ({
  fontSize: "1.2rem",
}));

const DialogContext = createContext();

export const useDialog = () => useContext(DialogContext);

export const DialogProvider = ({ children }) => {
  const [dialog, setDialog] = useState({
    open: false,
    text: "",
    type: "info",
    onYes: () => {},
  });

  const openInfoDialog = (text) =>
    setDialog({ open: true, text, type: "info", onYes: () => {} });
  const openConfirmDialog = (text, onYes) =>
    setDialog({ open: true, text, type: "confirm", onYes });
  const closeDialog = () => {
    setDialog((prevDialog) => ({
      ...prevDialog,
      open: false,
    }));

    setTimeout(() => {
      setDialog((prevDialog) => ({
        ...prevDialog,
        text: "",
        type: "info",
        onYes: () => {},
      }));
    }, 300);
  };

  const handleYes = () => {
    dialog.onYes();
    closeDialog();
  };

  return (
    <DialogContext.Provider
      value={{ openInfoDialog, openConfirmDialog, closeDialog }}
    >
      {children}
      <StyledDialog open={dialog.open} onClose={closeDialog}>
        <StyledDialogContent>
          <StyledTypography variant="body1">{dialog.text}</StyledTypography>
        </StyledDialogContent>
        <StyledDialogActions>
          {dialog.type === "confirm" ? (
            <>
              <Button onClick={handleYes} variant="contained" color="primary">
                Yes
              </Button>
              <Button
                onClick={closeDialog}
                variant="contained"
                color="secondary"
              >
                No
              </Button>
            </>
          ) : (
            <Button onClick={closeDialog} variant="contained" color="primary">
              Close
            </Button>
          )}
        </StyledDialogActions>
      </StyledDialog>
    </DialogContext.Provider>
  );
};
