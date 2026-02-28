"use client";

import { useState } from "react";
import { Button } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { signInWithGoogle } from "@/lib/firebase/auth";

interface GoogleSignInButtonProps {
  onSuccess: () => void;
}

export default function GoogleSignInButton({ onSuccess }: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      onSuccess();
    } catch {
      // Google popup closed or error — silently ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      fullWidth
      variant="outlined"
      size="large"
      startIcon={<GoogleIcon />}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? "Signing in..." : "Continue with Google"}
    </Button>
  );
}
