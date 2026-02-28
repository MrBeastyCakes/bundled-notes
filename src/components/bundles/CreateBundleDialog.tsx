"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { bundleColors } from "@/lib/theme/colors";
import { createBundle } from "@/lib/firebase/firestore";
import { useAuth } from "@/lib/hooks/useAuth";
import { useBundles } from "@/lib/hooks/useBundles";

interface CreateBundleDialogProps {
  open: boolean;
  onClose: () => void;
  defaultParentId: string | null;
}

export default function CreateBundleDialog({
  open,
  onClose,
  defaultParentId,
}: CreateBundleDialogProps) {
  const { user } = useAuth();
  const { bundles } = useBundles();
  const [name, setName] = useState("");
  const [color, setColor] = useState(bundleColors[0]);
  const [parentBundleId, setParentBundleId] = useState<string | null>(defaultParentId);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!user || !name.trim()) return;
    setLoading(true);
    try {
      await createBundle(user.uid, {
        name: name.trim(),
        color,
        icon: "Folder",
        parentBundleId,
        order: bundles.length,
      });
      setName("");
      setColor(bundleColors[0]);
      setParentBundleId(null);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  // Reset parent when dialog opens with a new default
  const handleEnter = () => {
    setParentBundleId(defaultParentId);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      TransitionProps={{ onEnter: handleEnter }}
    >
      <DialogTitle>New Bundle</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label="Bundle name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mt: 1, mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Parent bundle (optional)</InputLabel>
          <Select
            value={parentBundleId || ""}
            onChange={(e) => setParentBundleId(e.target.value || null)}
            label="Parent bundle (optional)"
          >
            <MenuItem value="">
              <em>None (root level)</em>
            </MenuItem>
            {bundles.map((b) => (
              <MenuItem key={b.id} value={b.id}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: b.color,
                    }}
                  />
                  {b.name}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Color
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {bundleColors.map((c) => (
            <Box
              key={c}
              onClick={() => setColor(c)}
              sx={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                bgcolor: c,
                cursor: "pointer",
                border: color === c ? "3px solid" : "3px solid transparent",
                borderColor: color === c ? "text.primary" : "transparent",
                transition: "all 200ms cubic-bezier(0.2, 0, 0, 1)",
                "&:hover": { transform: "scale(1.1)" },
              }}
            />
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={!name.trim() || loading}
        >
          {loading ? "Creating..." : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
