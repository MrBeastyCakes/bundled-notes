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
import { signIn } from "@/lib/firebase/auth";
import GoogleSignInButton from "./GoogleSignInButton";

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToSignup: () => void;
}

export default function LoginForm({ onSuccess, onSwitchToSignup }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to sign in";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%", maxWidth: 400 }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
        Welcome back
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Sign in to access your notes
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

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
        {loading ? "Signing in..." : "Sign in"}
      </Button>

      <Divider sx={{ my: 2 }}>
        <Typography variant="caption" color="text.secondary">
          or
        </Typography>
      </Divider>

      <GoogleSignInButton onSuccess={onSuccess} />

      <Box sx={{ textAlign: "center", mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Don&apos;t have an account?{" "}
          <Button
            onClick={onSwitchToSignup}
            sx={{ textTransform: "none", p: 0, minWidth: "auto", verticalAlign: "baseline" }}
          >
            Sign up
          </Button>
        </Typography>
      </Box>
    </Box>
  );
}
