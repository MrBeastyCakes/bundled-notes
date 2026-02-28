"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Box, Button, Container, Typography, Stack } from "@mui/material";
import NotesIcon from "@mui/icons-material/Notes";
import { useAuth } from "@/lib/hooks/useAuth";

export default function LandingPage() {
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
      <Container maxWidth="sm" sx={{ textAlign: "center" }}>
        <NotesIcon sx={{ fontSize: 64, color: "primary.main", mb: 2 }} />

        <Typography variant="h3" fontWeight={700} gutterBottom>
          Bundled
        </Typography>

        <Typography variant="h6" color="text.secondary" sx={{ mb: 4, fontWeight: 400 }}>
          Beautiful, organized note-taking.
          <br />
          Create bundles, write in Markdown, sync everywhere.
        </Typography>

        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="contained"
            size="large"
            onClick={() => router.push("/signup")}
            sx={{ px: 4 }}
          >
            Get Started
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => router.push("/login")}
            sx={{ px: 4 }}
          >
            Sign In
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
