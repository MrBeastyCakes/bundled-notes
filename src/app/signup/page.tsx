"use client";

import { useRouter } from "next/navigation";
import { Box, Container } from "@mui/material";
import SignupForm from "@/components/auth/SignupForm";
import { useAuth } from "@/lib/hooks/useAuth";
import { useEffect } from "react";

export default function SignupPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) router.replace("/notes");
  }, [user, loading, router]);

  if (loading || user) return null;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <Container maxWidth="sm" sx={{ display: "flex", justifyContent: "center" }}>
        <SignupForm
          onSuccess={() => router.replace("/notes")}
          onSwitchToLogin={() => router.push("/login")}
        />
      </Container>
    </Box>
  );
}
