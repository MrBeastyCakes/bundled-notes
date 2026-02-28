"use client";

import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Divider,
} from "@mui/material";
import { signUp } from "@/lib/firebase/auth";
import GoogleSignInButton from "./GoogleSignInButton";

interface SignupFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export default function SignupForm({ onSuccess, onSwitchToLogin }: SignupFormProps) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, displayName);
      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create account";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%", maxWidth: 400 }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
        Create account
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Start organizing your notes
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Display name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        required
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        helperText="At least 6 characters"
        sx={{ mb: 3 }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={loading}
        sx={{ mb: 2 }}
      >
        {loading ? "Creating account..." : "Create account"}
      </Button>

      <Divider sx={{ my: 2 }}>
        <Typography variant="caption" color="text.secondary">
          or
        </Typography>
      </Divider>

      <GoogleSignInButton onSuccess={onSuccess} />

      <Box sx={{ textAlign: "center", mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Already have an account?{" "}
          <Button
            onClick={onSwitchToLogin}
            sx={{ textTransform: "none", p: 0, minWidth: "auto", verticalAlign: "baseline" }}
          >
            Sign in
          </Button>
        </Typography>
      </Box>
    </Box>
  );
}
